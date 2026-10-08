# Guard hooks for omp

This extension applies the shared Python guard policies to omp tool calls. It blocks recursive forced removals, dangerous commands (destructive git, downloads piped into a shell, disk writes, publishing, cloud and database deletes), secret access, edits to agent configuration and persistence locations, and generated-file edits. The first deny wins; otherwise the first ask is shown. The optional Jev policy asks for confirmation when a command might be destructive, exfiltrate data, set up persistence, weaken a control, run downloaded code, or stray from the user's request.

Commands are parsed with the same bash-subset parser the Claude Code hooks use, so wrappers (`sudo -u`, `timeout`), re-parsed strings (`bash -c`, `eval`, `ssh host`), heredocs fed to a shell and interpreter one-liners are all checked. Scripts, `npm run` scripts and Makefile recipes a command executes are read too; a match found only there asks rather than denies.

## Install the extension

Install the extension for your user account:

```sh
./install.sh
```

You can also link the package directly:

```sh
omp plugin link ~/Develop/agent-config/omp/guard-hooks
```

Restart omp after installation. The interactive interface displays a confirmation dialog for an `ask` verdict. Headless mode blocks the call because no interactive confirmation is available.

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

The Python policies also use the `HOOK_JEV_*`, `SECRETS_GUARD_*`, `DANGEROUS_COMMANDS_*`, `CONFIG_GUARD_*`, `FILE_PROTECTION_*`, and `BASH_RISK_JUDGE_*` variables documented in their source files. `config_guard` treats this checkout's `hooks/` directory and this extension's directory as live guard code and asks before writes there. Set `HOOK_JEV_ENABLE=1` to enable Jev. If the API key comes from fnox, set `HOOK_JEV_FNOX_CONFIG` to the fnox configuration path.

Audit records are written to `~/.omp/hooks-logs/`. Anything the guard prints
on stderr is forwarded to the omp log (`~/.omp/logs/`): at `debug` when a
verdict was produced (Jev fallback reasons; the extension sets
`HOOK_JEV_DEBUG=1` unless you set it yourself), at `warn` when the guard
crashed, followed by the one-time "unavailable" warning.

## Uninstall the extension

Remove the linked plugin:

```sh
omp plugin uninstall omp-guard-hooks
```
