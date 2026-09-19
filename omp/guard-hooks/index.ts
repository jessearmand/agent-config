import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import { realpathSync } from "node:fs";
import path from "node:path";

const HANDLED_TOOLS: Readonly<Record<string, true>> = {
    bash: true,
    read: true,
    write: true,
    edit: true,
    grep: true,
    glob: true,
    ast_edit: true,
    apply_patch: true,
};
const PACKAGE_DIR = realpathSync(import.meta.dir);
const GUARD =
    process.env.OMP_GUARD_SCRIPT ??
    path.resolve(PACKAGE_DIR, "../../hooks/omp_guard.py");
const PYTHON = process.env.OMP_GUARD_PYTHON ?? "python3";
const configuredTimeout = Number(process.env.OMP_GUARD_TIMEOUT_MS);
const TIMEOUT_MS =
    Number.isFinite(configuredTimeout) && configuredTimeout > 0
        ? configuredTimeout
        : 10_000;

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

async function runGuard(request: object): Promise<Verdict | undefined> {
    try {
        const proc = Bun.spawn([PYTHON, GUARD], {
            stdin: "pipe",
            stdout: "pipe",
            stderr: "pipe",
            env: process.env,
        });
        const timer = setTimeout(() => proc.kill(), TIMEOUT_MS);
        timer.unref?.();
        try {
            proc.stdin.write(JSON.stringify(request));
            proc.stdin.end();

            const [stdout, , code] = await Promise.all([
                new Response(proc.stdout).text(),
                new Response(proc.stderr).text(),
                proc.exited,
            ]);
            if (code !== 0) return undefined;

            const parsed: unknown = JSON.parse(stdout);
            return isVerdict(parsed) ? parsed : undefined;
        } finally {
            clearTimeout(timer);
        }
    } catch {
        return undefined;
    }
}

function sessionId(ctx: {
    sessionManager?: { getSessionId?: () => unknown };
}): string | null {
    try {
        const id = ctx.sessionManager?.getSessionId?.();
        return typeof id === "string" && id ? id : null;
    } catch {
        return null;
    }
}

export default function guardHooks(pi: ExtensionAPI) {
    let warnedUnavailable = false;

    pi.setLabel("guard-hooks");
    pi.on("tool_call", async (event, ctx) => {
        if (
            process.env.OMP_GUARD_DISABLE === "1" ||
            !HANDLED_TOOLS[event.toolName]
        ) {
            return;
        }

        const verdict = await runGuard({
            tool: event.toolName,
            input: event.input,
            cwd: ctx.cwd,
            session_id: sessionId(ctx),
        });
        if (!verdict) {
            if (!warnedUnavailable) {
                warnedUnavailable = true;
                pi.logger.warn(
                    "guard-hooks: omp_guard.py unavailable; tool calls are not guarded",
                );
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

        pi.logger.info(`guard-hooks ${verdict.hook}: ${verdict.decision}`);
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
