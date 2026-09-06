---
name: ruff
description: Run or configure Ruff linting and formatting in projects that use Ruff, or when adopting Ruff is explicitly requested.
---

# Ruff

Use the project's configured linter and formatter. Ruff may provide linting,
formatting, or both; do not infer formatter adoption merely from lint configuration.
Preserve an existing Black, Flake8, or other toolchain during unrelated work.

## Run the appropriate check

Inspect project scripts and `pyproject.toml`, `ruff.toml`, or `.ruff.toml` for
configuration and version pins. Prefer the repository's invocation; in a uv-managed
project with Ruff installed, use `uv run ruff`. Use an isolated tool only when it
fits the task, selecting the required version rather than silently using latest.

Examples below assume the appropriate Ruff executable or project runner:

```bash
ruff check path/to/file.py
ruff format --check path/to/file.py
ruff check --diff path/to/file.py
ruff format --diff path/to/file.py
ruff rule <CODE>
```

`ruff check --diff` previews available fixes; it is not a replacement for the
lint check and does not restrict diagnostics to changed lines. Scope paths to the
change, while honoring repository-wide checks required by CI. A large formatting
diff is a reason to inspect configuration and scope, not proof that Ruff is unused.

## Apply fixes

For authorized fixes, run lint fixes before formatting when both apply. Inspect
changes in files that already contain user edits. Do not run broad autofixes or
change rule selection to clear unrelated failures.

Safe fixes are intended to preserve behavior. Unsafe fixes may alter behavior or
remove comments; inspect their preview and assumptions before applying them, then
run affected tests. Do not enable `--unsafe-fixes` globally for an ordinary cleanup.

Report remaining diagnostics and validation limits. If adopting or migrating to
Ruff is requested, compare the existing rules, plugins, formatting conventions, and
CI behavior before changing configuration.

## Documentation

- [Linter and fix safety](https://docs.astral.sh/ruff/linter/)
- [Formatter](https://docs.astral.sh/ruff/formatter/)
- [Configuration](https://docs.astral.sh/ruff/configuration/)
