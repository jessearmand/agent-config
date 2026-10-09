// Guard hooks for omp (Oh My Pi) and pi. Both hosts share the extension API
// used here: `pi.on("tool_call")`, `{ block, reason }`, `ctx.hasUI`,
// `ctx.ui.confirm`, `ctx.sessionManager`. omp runs extensions on Bun and pi on
// Node, so this file uses only Node APIs, and treats omp-only extras
// (`setLabel`, `logger`) as optional.
import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import { spawn } from "node:child_process";
import { realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HANDLED_TOOLS: Readonly<Record<string, true>> = {
    bash: true,
    read: true,
    write: true,
    edit: true,
    multiedit: true,
    grep: true,
    glob: true,
    find: true,
    ls: true,
    ast_edit: true,
    apply_patch: true,
};
const PACKAGE_DIR = realpathSync(path.dirname(fileURLToPath(import.meta.url)));
const GUARD =
    process.env.OMP_GUARD_SCRIPT ??
    path.resolve(PACKAGE_DIR, "../../hooks/omp_guard.py");
const PYTHON = process.env.OMP_GUARD_PYTHON ?? "python3";
const configuredTimeout = Number(process.env.OMP_GUARD_TIMEOUT_MS);
const TIMEOUT_MS =
    Number.isFinite(configuredTimeout) && configuredTimeout > 0
        ? configuredTimeout
        : 10_000;
// The judge only needs the gist of the request; keep the payload small.
const PROMPT_LIMIT = 4_000;

type Verdict = {
    decision: "deny" | "ask" | "defer";
    reason: string;
    hook: string;
    system_message: string | null;
};

function isVerdict(value: unknown): value is Verdict {
    if (!value || typeof value !== "object") return false;
    const candidate = value as Record<string, unknown>;
    return (
        (candidate.decision === "deny" ||
            candidate.decision === "ask" ||
            candidate.decision === "defer") &&
        typeof candidate.reason === "string" &&
        typeof candidate.hook === "string" &&
        (typeof candidate.system_message === "string" ||
            candidate.system_message === null)
    );
}

type GuardResult = {
    verdict?: Verdict;
    stderr: string;
    code: number | null;
};

function runGuard(request: object): Promise<GuardResult> {
    return new Promise((resolve) => {
        let child: ReturnType<typeof spawn>;
        try {
            child = spawn(PYTHON, [GUARD], {
                stdio: ["pipe", "pipe", "pipe"],
                // Jev only explains its fallbacks on stderr when debugging is on;
                // an explicit user setting still wins. This extension is live
                // guard code too, so config_guard asks before anything edits it.
                env: {
                    HOOK_JEV_DEBUG: "1",
                    ...process.env,
                    CONFIG_GUARD_LIVE_DIRS: [process.env.CONFIG_GUARD_LIVE_DIRS, PACKAGE_DIR]
                        .filter(Boolean)
                        .join(path.delimiter),
                },
            });
        } catch {
            resolve({ stderr: "", code: null });
            return;
        }

        const stdout: Buffer[] = [];
        const stderr: Buffer[] = [];
        let settled = false;
        const finish = (result: GuardResult) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            resolve(result);
        };
        const timer = setTimeout(() => child.kill("SIGKILL"), TIMEOUT_MS);
        timer.unref?.();

        child.stdout?.on("data", (chunk: Buffer) => stdout.push(chunk));
        child.stderr?.on("data", (chunk: Buffer) => stderr.push(chunk));
        child.on("error", () => finish({ stderr: Buffer.concat(stderr).toString(), code: null }));
        child.on("close", (code) => {
            const errorText = Buffer.concat(stderr).toString();
            if (code !== 0) {
                finish({ stderr: errorText, code });
                return;
            }
            try {
                const parsed: unknown = JSON.parse(Buffer.concat(stdout).toString());
                finish(isVerdict(parsed)
                    ? { verdict: parsed, stderr: errorText, code }
                    : { stderr: errorText, code });
            } catch {
                finish({ stderr: errorText, code });
            }
        });
        child.stdin?.on("error", () => {});
        child.stdin?.end(JSON.stringify(request));
    });
}

type SessionLike = {
    getSessionId?: () => unknown;
    buildContextEntries?: () => unknown[];
    getBranch?: () => unknown[];
    getEntries?: () => unknown[];
};

function sessionId(ctx: { sessionManager?: SessionLike }): string | null {
    try {
        const id = ctx.sessionManager?.getSessionId?.();
        return typeof id === "string" && id ? id : null;
    } catch {
        return null;
    }
}

function textOf(content: unknown): string | undefined {
    if (typeof content === "string") return content.trim() || undefined;
    if (!Array.isArray(content)) return undefined;
    const parts = content
        .filter((block): block is { type: string; text: string } =>
            typeof block === "object" && block !== null &&
            (block as { type?: unknown }).type === "text" &&
            typeof (block as { text?: unknown }).text === "string")
        .map((block) => block.text);
    return parts.join("\n").trim() || undefined;
}

/** The latest message the user typed in this branch: task context for the judge. */
function latestUserPrompt(ctx: { sessionManager?: SessionLike }): string | null {
    try {
        const manager = ctx.sessionManager;
        const entries =
            manager?.buildContextEntries?.() ?? manager?.getBranch?.() ?? manager?.getEntries?.() ?? [];
        for (let index = entries.length - 1; index >= 0; index -= 1) {
            const entry = entries[index] as { message?: unknown } | undefined;
            const message = (entry?.message ?? entry) as { role?: unknown; content?: unknown } | undefined;
            if (message?.role !== "user") continue;
            const text = textOf(message.content);
            if (text) return text.slice(0, PROMPT_LIMIT);
        }
    } catch {
        // Context is optional; the guards work without it.
    }
    return null;
}

type Logger = Partial<Record<"debug" | "info" | "warn", (message: string) => void>>;

export default function guardHooks(pi: ExtensionAPI) {
    let warnedUnavailable = false;
    const host = pi as unknown as { setLabel?: (label: string) => void; logger?: Logger };
    const log = (level: keyof Logger, message: string) => host.logger?.[level]?.(message);

    host.setLabel?.("guard-hooks");
    pi.on("tool_call", async (event, ctx) => {
        if (
            process.env.OMP_GUARD_DISABLE === "1" ||
            !HANDLED_TOOLS[event.toolName]
        ) {
            return;
        }

        const { verdict, stderr, code } = await runGuard({
            tool: event.toolName,
            input: event.input,
            cwd: ctx.cwd,
            session_id: sessionId(ctx),
            user_prompt: event.toolName === "bash" ? latestUserPrompt(ctx) : null,
        });
        const diagnostics = stderr.trim();
        if (diagnostics) {
            log(verdict ? "debug" : "warn",
                `guard-hooks stderr (exit ${code}): ${diagnostics.slice(0, 2000)}`);
        }
        if (!verdict) {
            if (!warnedUnavailable) {
                warnedUnavailable = true;
                log("warn", "guard-hooks: omp_guard.py unavailable; tool calls are not guarded");
                if (ctx.hasUI) {
                    ctx.ui.notify(
                        "guard-hooks: Python guard unavailable; running without guards",
                        "warning",
                    );
                }
            }
            return;
        }
        if (verdict.decision === "defer") return;

        log("info", `guard-hooks ${verdict.hook}: ${verdict.decision}`);
        if (verdict.decision === "deny") {
            return { block: true, reason: verdict.reason };
        }

        if (!ctx.hasUI) {
            return {
                block: true,
                reason:
                    `${verdict.reason}\n\n` +
                    "[guard-hooks] No interactive UI is available to confirm, so the call is blocked.",
            };
        }

        const confirmed = await ctx.ui.confirm(
            `${verdict.hook} wants confirmation`,
            verdict.reason,
        );
        if (!confirmed) {
            return {
                block: true,
                reason: `User declined: ${verdict.reason}`,
            };
        }
    });
}
