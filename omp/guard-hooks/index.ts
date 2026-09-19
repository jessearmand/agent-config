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

type GuardResult = {
    verdict?: Verdict;
    stderr: string;
    code: number | null;
};

async function runGuard(request: object): Promise<GuardResult> {
    try {
        const proc = Bun.spawn([PYTHON, GUARD], {
            stdin: "pipe",
            stdout: "pipe",
            stderr: "pipe",
            // Jev only explains its fallbacks on stderr when debugging is on;
            // an explicit user setting still wins.
            env: { HOOK_JEV_DEBUG: "1", ...process.env },
        });
        const timer = setTimeout(() => proc.kill(), TIMEOUT_MS);
        timer.unref?.();
        try {
            proc.stdin.write(JSON.stringify(request));
            proc.stdin.end();

            const [stdout, stderr, code] = await Promise.all([
                new Response(proc.stdout).text(),
                new Response(proc.stderr).text(),
                proc.exited,
            ]);
            if (code !== 0) return { stderr, code };

            let parsed: unknown;
            try {
                parsed = JSON.parse(stdout);
            } catch {
                return { stderr, code };
            }
            return isVerdict(parsed)
                ? { verdict: parsed, stderr, code }
                : { stderr, code };
        } finally {
            clearTimeout(timer);
        }
    } catch {
        return { stderr: "", code: null };
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

        const { verdict, stderr, code } = await runGuard({
            tool: event.toolName,
            input: event.input,
            cwd: ctx.cwd,
            session_id: sessionId(ctx),
        });
        const diagnostics = stderr.trim();
        if (diagnostics) {
            pi.logger[verdict ? "debug" : "warn"](
                `guard-hooks stderr (exit ${code}): ${diagnostics.slice(0, 2000)}`,
            );
        }
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
