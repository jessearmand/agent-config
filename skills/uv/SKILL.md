---
name: uv
description: Manage Python dependencies, environments, scripts, and tools in uv projects or when uv is explicitly requested.
---

# uv

Use uv when repository instructions, `uv.lock`, or an explicit request establish
it as the workflow. A `pyproject.toml` alone does not establish uv ownership.
Preserve Poetry, PDM, Conda, pip, or other existing workflows during unrelated work.

## Choose the execution environment

Prefer repository scripts and the project's Python version. Use `uv run` for
commands that need project dependencies and `uvx` / `uv tool run` for independent
tools. Isolated tools do not automatically share the project's installed packages.

| Need | Starting point |
|------|----------------|
| Run in a uv project | `uv run <command>` |
| Run a script with a temporary dependency | `uv run --with <package> script.py` |
| Run independently of a surrounding project | `uv run --no-project --with <package> script.py` |
| Run an isolated tool | `uvx <tool>` |
| Pin a one-off tool version | `uvx <tool>@<version>` |

Project runs may synchronize the environment and update the lockfile. Follow the
repository's reproducibility policy; use `--locked` when the lockfile must remain
up to date without modification. Do not silently change dependencies during a
read-only review. Read the installed command's help when choosing stricter
execution or synchronization options.

## Dependency changes

Use `uv add` and `uv remove` for authorized dependency changes in uv projects.
For scripts using inline dependency metadata, use `uv add --script` only when
persisting that dependency is part of the task; use `--with` for temporary needs.

Keep manifest and lockfile changes consistent and review the diff. Use `uv init`,
Python installation/pinning, or persistent `uv tool install` only when setup or
installation is in scope. There is no need to initialize a project to run a
standalone script, or to replace an already suitable Python interpreter.

For an existing requirements-based workflow that uses uv, use the appropriate
`uv pip` commands against the intended environment. Do not migrate dependency
formats or replace another environment manager merely because uv is available.

## Documentation

Consult the relevant official guide for version-specific flags or a requested
migration instead of treating commands from another tool as exact equivalents:

- [Projects and synchronization](https://docs.astral.sh/uv/concepts/projects/sync/)
- [Scripts](https://docs.astral.sh/uv/guides/scripts/)
- [Tools and isolation](https://docs.astral.sh/uv/guides/tools/)
