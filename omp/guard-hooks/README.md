# Guard hooks for omp and pi

This extension applies the shared Python guard policies to omp and pi tool calls. The same `index.ts` loads in both hosts: it uses only Node APIs (pi runs extensions on Node, omp on Bun) and the extension API the two share (`tool_call`, `{ block, reason }`, `ctx.ui.confirm`, `ctx.hasUI`). It asks before recursive forced removals and other file deletions, and blocks dangerous commands (destructive git, downloads piped into a shell, disk writes, publishing, cloud and database deletes), secret access, edits to agent configuration and persistence locations, and generated-file edits. The first deny wins; otherwise the first ask is shown. The optional Jev policy asks for confirmation when a command might be destructive, exfiltrate data, set up persistence, weaken a control, run downloaded code, or stray from the user's request.

Commands are parsed with the same bash-subset parser the Claude Code hooks use, so wrappers (`sudo -u`, `timeout`), re-parsed strings (`bash -c`, `eval`, `ssh host`), heredocs fed to a shell and interpreter one-liners are all checked. Scripts, `npm run` scripts and Makefile recipes a command executes are read too; a match found only there asks rather than denies.

## Pi architecture

Use this native extension rather than an external hook runner. Its event handler runs inside pi, while the shared Python policies run in a subprocess. For the architecture decision, failure behavior, and repository-root install commands, see [Pi guard integration](../../docs/pi-guard-integration.md).

## Install the extension

From the repository root, install the extension for your user account. With no argument the script installs into every host it finds on PATH:

```sh
./omp/guard-hooks/install.sh          # omp and/or pi
./omp/guard-hooks/install.sh pi       # one host only
```

In pi you can also try it for one session with `pi -e ./omp/guard-hooks`.

You can also link the package directly:

```sh
omp plugin link ~/Develop/agent-config/omp/guard-hooks
```

Restart the host after installation, or run `/reload` in pi. The interactive interface displays a confirmation dialog for an `ask` verdict. Headless mode blocks the call because no interactive confirmation is available.

If the Python backend is unavailable, each handled call requires confirmation without policy checks. Headless mode blocks these calls. An optional model-judge outage still defers after deterministic checks.

To use the extension only in one project, add the package directory to the project's `.omp/config.yml` file:

```yaml
extensions:
  - ~/Develop/agent-config/omp/guard-hooks
```

## Configuration

The following environment variables configure the adapter:

- `OMP_GUARD_DISABLE=1` disables the extension.
- `OMP_GUARD_PYTHON` selects the Python executable.
- `OMP_GUARD_SCRIPT` overrides the path to `omp_guard.py`.
- `OMP_GUARD_TIMEOUT_MS` sets the Python process timeout in milliseconds. The default is `10000`.

The Python policies also use the `HOOK_JEV_*`, `SECRETS_GUARD_*`, `DANGEROUS_COMMANDS_*`, `CONFIG_GUARD_*`, `FILE_PROTECTION_*`, and `BASH_RISK_JUDGE_*` variables documented in their source files. `config_guard` treats this checkout's `hooks/` directory and this extension's directory as live guard code and asks before writes there. Set `HOOK_JEV_ENABLE=1` to enable the model judge (Jev by default; `HOOK_JEV_MODEL=openai/gpt-6-luna-decisions` or any other AI Gateway decision model also works). If the API key comes from fnox, set `HOOK_JEV_FNOX_CONFIG` to the fnox configuration path.

Policies that emit audit records write them to `~/.omp/hooks-logs/` in both hosts unless `HOOKS_LOG_DIR` overrides the directory. The `rm-rf-guard` policy does not emit JSONL audit records. Blocked calls include its reason in the tool result, and omp logs its verdict. Pi has no omp-style logger API. Backend errors reach pi through confirmation dialogs or blocked tool results.

In omp, guard stderr also reaches the host log (`~/.omp/logs/`). Valid verdicts use `debug`, and backend errors use `warn`. The extension sets `HOOK_JEV_DEBUG=1` unless you set it yourself.

## Verify the adapter

From the repository root, run `python3 hooks/omp_guard_test.py`. The test submits
commands to the policies without executing them and uses a local shim for the
model judge, not a live provider.

From the repository root, run `node --test omp/guard-hooks/index.test.ts` for the TypeScript adapter and `python3 hooks/pi_guard_test.py` for pi configuration protection. The TypeScript tests also run with `bun test omp/guard-hooks/index.test.ts`.

## Uninstall the extension

```sh
omp plugin uninstall omp-guard-hooks          # omp
pi uninstall /path/to/agent-config/omp/guard-hooks   # pi
```

## Alternative: pi-yaml-hooks

[pi-yaml-hooks](https://github.com/KristjanPikhof/pi-yaml-hooks) can run an external command on `tool.before.*` in both hosts, but its bash actions can only block (exit 2, stderr as the reason); they cannot ask the user. Every `ask` from these guards would become a block, so this extension is the better fit. Use pi-yaml-hooks only where installing an extension is not an option.
