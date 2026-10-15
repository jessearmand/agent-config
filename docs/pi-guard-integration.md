# Pi guard integration

## Architecture decision

Use the shared in-process extension in `omp/guard-hooks/`, not an external hook runner.
Pi loads its `index.ts` entry through `pi.extensions` in `package.json`.
The extension intercepts `tool_call` before a handled tool runs.
Its factory registers handlers without session actions.
In pi, `setLabel()` labels a session entry, not the extension, and cannot run during extension loading.

The integration has two parts:

- The TypeScript extension handles pi events, session context, confirmation dialogs, and block results.
- A Python subprocess runs the shared policies through `hooks/omp_guard.py`.

[CC Safety Net's integration architecture](https://ccsafetynet.com/docs/guides/integration-architecture#the-pi-extension)
uses the same pi event, but its analyzer also runs in process.
This adapter keeps Python outside the pi process to reuse the policies and parser across hosts.
A complete TypeScript port is not required for pi support.

An external hook runner adds another adapter and must preserve interactive `ask` decisions.
The native extension can ask through `ctx.ui.confirm()` and return `{ block: true, reason }` directly.
There is no pi hook configuration file to install.

## Decision and failure behavior

The adapter applies these rules:

| Result | Interactive or RPC mode | Print or JSON mode |
| --- | --- | --- |
| Deterministic `deny` | Block without approval | Block |
| `ask` | Require explicit confirmation | Block |
| `defer` | Continue to other handlers | Continue to other handlers |
| Python missing, crash, timeout, or invalid result | Require confirmation without policy checks | Block |
| Optional model judge unavailable | Retain deterministic checks and defer the model decision | Same behavior |

Pi does not provide a built-in permission prompt for every tool call.
A backend error therefore cannot return silently and rely on host approval.
The unavailable-backend dialog identifies the tool and its command or path.
Each affected call requires its own confirmation.

## Install for your account

Keep the complete repository checkout available.
The extension resolves the Python backend relative to its own directory.
Copying only `omp/guard-hooks/` loses the policy files.

1. From the repository root, install the local package:

   ```sh
   ./omp/guard-hooks/install.sh pi
   ```

2. Run `/reload` in pi, or restart pi.

3. Confirm that pi lists the local package:

   ```sh
   pi list
   ```

The installer changes personal pi settings, not tracked repository configuration.
The local package loads from the checkout without copying files.
Git updates to that checkout take effect after a reload or restart.
`pi update --extensions` reconciles installed packages but does not update the local checkout.

For a single invocation from the repository root, load the extension explicitly:

```sh
pi -e ./omp/guard-hooks
```

The optional model judge remains disabled unless `HOOK_JEV_ENABLE=1` is present in the pi process environment.
Its credentials and configuration follow the [shared adapter configuration](../omp/guard-hooks/README.md#configuration).
The deterministic policies do not require a model or an API key.

## Validate the integration

From the repository root, run the adapter tests:

```sh
node --test omp/guard-hooks/index.test.ts
```

These tests cover confirmation, headless blocking, backend errors, and pi tool inputs against the real Python policies.
They submit commands for analysis without executing them.
They use a host stub, so they do not prove interactive terminal rendering.

Run the pi configuration tests separately:

```sh
python3 hooks/pi_guard_test.py
```

These tests cover configuration writes, allowed controls, and `PI_CODING_AGENT_DIR` relocation.
Host verification also requires a pi session or the real pi extension loader and runner.
`pi --help` does not exercise session loading and cannot establish that protection is active.

## Coverage limits

The adapter handles Bash and the file tools listed in `HANDLED_TOOLS` in `index.ts`.
PowerShell, arbitrary custom tools, MCP tools, and direct extension subprocesses are outside this contract.
Nested calls through pi's `ctx.executeTool()` reach `tool_call` and receive the same checks for handled tools.
User-entered `!` commands are outside this model-tool guard.

The parser performs bounded static analysis, not full shell evaluation.
The extension is not an operating-system sandbox.
For the policy review boundary, see [Bash guard review boundary](guard-scope.md).
