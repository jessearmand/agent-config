# Guard hooks for omp

This extension applies the shared Python guard policies to omp tool calls. It blocks recursive forced removals, secret access, and generated-file edits. The optional Jev policy asks for confirmation when a command might be destructive or exfiltrate data.

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

The Python policies also use the `HOOK_JEV_*`, `SECRETS_GUARD_*`, `FILE_PROTECTION_*`, and `BASH_RISK_JUDGE_*` variables documented in their source files. Set `HOOK_JEV_ENABLE=1` to enable Jev. If the API key comes from fnox, set `HOOK_JEV_FNOX_CONFIG` to the fnox configuration path.

Audit records are written to `~/.omp/hooks-logs/`.

## Uninstall the extension

Remove the linked plugin:

```sh
omp plugin uninstall omp-guard-hooks
```
