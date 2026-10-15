import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import type {
    ExtensionAPI,
    ExtensionContext,
    ExtensionHandler,
    ToolCallEvent,
    ToolCallEventResult,
} from "@earendil-works/pi-coding-agent";

type Handler = ExtensionHandler<ToolCallEvent, ToolCallEventResult>;
type GuardOptions = { backend?: string; env?: Record<string, string> };
const scratchpad = fileURLToPath(new URL("../../scratchpad/", import.meta.url));
let moduleId = 0;

// Each import captures its own backend settings, just as a host reload does.
async function withGuard(
    options: GuardOptions,
    run: (handler: Handler, directory: string) => Promise<void>,
) {
    await mkdir(scratchpad, { recursive: true });
    const directory = await mkdtemp(path.join(scratchpad, "guard-extension-"));
    const saved = { ...process.env };
    try {
        for (const key of Object.keys(process.env)) {
            if (/^(OMP_GUARD_|HOOK_|HOOKS_|CONFIG_GUARD_|SECRETS_GUARD_|DANGEROUS_COMMANDS_|FILE_PROTECTION_|BASH_RISK_JUDGE_)/.test(key)) {
                delete process.env[key];
            }
        }
        process.env.HOOKS_LOG_DIR = path.join(directory, "logs");
        if (options.backend !== undefined) {
            const backend = path.join(directory, "backend.py");
            await writeFile(backend, options.backend);
            process.env.OMP_GUARD_SCRIPT = backend;
        }
        Object.assign(process.env, options.env);
        const module = await import(`./index.ts?test=${moduleId++}`);
        let handler: Handler | undefined;
        // Pi's setLabel edits a session entry; it is not omp's extension label.
        // Calling it during factory execution fails before handlers register.
        module.default({
            setLabel() { throw new Error("Extension runtime not initialized"); },
            on(event: string, callback: Handler) {
                assert.equal(event, "tool_call");
                handler = callback;
            },
        } as unknown as ExtensionAPI);
        assert.ok(handler);
        await run(handler, directory);
    } finally {
        for (const key of Object.keys(process.env)) {
            if (!(key in saved)) delete process.env[key];
        }
        Object.assign(process.env, saved);
        await rm(directory, { recursive: true, force: true });
    }
}

function context(directory: string, answer?: boolean) {
    const confirmations: string[] = [];
    const notifications: string[] = [];
    const ctx = {
        cwd: directory,
        hasUI: answer !== undefined,
        sessionManager: { getSessionId: () => "extension-test" },
        ui: {
            confirm: async (title: string, message: string) => {
                confirmations.push(`${title}\n${message}`);
                return answer ?? false;
            },
            notify: (message: string) => { notifications.push(message); },
        },
    } as unknown as ExtensionContext;
    return { ctx, confirmations, notifications };
}

function call(toolName: string, input: Record<string, unknown>): ToolCallEvent {
    return { type: "tool_call", toolCallId: "test-call", toolName, input };
}

function backend(decision: string) {
    return `import json\njson.dump({"decision": "${decision}", "reason": "policy reason", "hook": "test-policy", "system_message": None}, __import__("sys").stdout)\n`;
}

test("factory registers without session actions; defer passes through and deny cannot be approved", async () => {
    for (const decision of ["defer", "deny"]) {
        await withGuard({ backend: backend(decision) }, async (handler, directory) => {
            const { ctx, confirmations } = context(directory, true);
            const result = await handler(call("bash", { command: "git status" }), ctx);
            assert.equal(result?.block, decision === "deny" ? true : undefined);
            assert.equal(confirmations.length, 0);
        });
    }
});

test("ask needs explicit approval, including RPC-style UI contexts", async () => {
    await withGuard({ backend: backend("ask") }, async (handler, directory) => {
        for (const answer of [undefined, false, true]) {
            const { ctx, confirmations } = context(directory, answer);
            const result = await handler(call("bash", { command: "rm -rf build" }), ctx);
            assert.equal(result?.block, answer === true ? undefined : true);
            assert.equal(confirmations.length, answer === undefined ? 0 : 1);
        }
    });
});

const failures: (GuardOptions & { name: string })[] = [
    { name: "missing Python", env: { OMP_GUARD_PYTHON: "/nonexistent/guard-python" } },
    { name: "missing script", env: { OMP_GUARD_SCRIPT: "/nonexistent/guard.py" } },
    { name: "crash", backend: "raise RuntimeError('backend failed')\n" },
    { name: "invalid JSON", backend: "print('not json')\n" },
    { name: "invalid verdict", backend: "print('{}')\n" },
    { name: "timeout", backend: "import time\ntime.sleep(60)\n", env: { OMP_GUARD_TIMEOUT_MS: "100" } },
];
for (const failure of failures) {
    test(`backend ${failure.name} requires confirmation or blocks without UI`, async () => {
        await withGuard(failure, async (handler, directory) => {
            for (const answer of [undefined, false, true]) {
                const { ctx, confirmations } = context(directory, answer);
                const result = await handler(call("bash", { command: "git reset --hard" }), ctx);
                assert.equal(result?.block, answer === true ? undefined : true);
                assert.equal(confirmations.length, answer === undefined ? 0 : 1);
                if (answer !== undefined) {
                    assert.match(confirmations[0], /unavailable/i);
                    assert.match(confirmations[0], /git reset --hard/);
                }
            }
        });
    });
}

test("disabled and unhandled calls do not start the backend", async () => {
    await withGuard({ backend: "raise RuntimeError()\n" }, async (handler, directory) => {
        assert.equal(await handler(call("custom_tool", {}), context(directory).ctx), undefined);
        process.env.OMP_GUARD_DISABLE = "1";
        assert.equal(await handler(call("bash", { command: "git reset --hard" }), context(directory).ctx), undefined);
    });
});

test("real Python policies handle pi's tools without executing submitted commands", async () => {
    await withGuard({}, async (handler, directory) => {
        const cases: [string, Record<string, unknown>, boolean][] = [
            ["bash", { command: "git status" }, false],
            ["bash", { command: "git reset --hard" }, true],
            ["bash", { command: "rm -rf build" }, true],
            ["read", { path: "src/main.ts" }, false],
            ["read", { path: "~/.pi/agent/auth.json" }, true],
            ["edit", { path: "~/.pi/agent/settings.json", edits: [{ oldText: "a", newText: "b" }] }, true],
            ["write", { path: "~/.pi/agent/mcp.json", content: "{}" }, true],
            ["write", { path: "~/.pi/agent/models.json", content: "{}" }, true],
            ["write", { path: ".pi/mcp.json", content: "{}" }, true],
            ["find", { pattern: "*.ts", path: "src" }, false],
            ["ls", { path: "src" }, false],
        ];
        for (const [tool, input, blocked] of cases) {
            const result = await handler(call(tool, input), context(directory).ctx);
            assert.equal(result?.block === true, blocked, `${tool}: ${JSON.stringify(input)}`);
        }
    });
});
