---
name: ty
description: Run or configure ty in Python projects that use it, or evaluate a migration to ty when explicitly requested.
---

# ty

Use ty when the project configures it or the task requests it. Preserve an existing
mypy or Pyright workflow during unrelated work; type checkers and their strictness
settings are not interchangeable command aliases.

## Environment and scope

Inspect project scripts, version pins, `pyproject.toml`, and `ty.toml`. Use the
repository's runner; `uv run ty` fits a uv-managed project with ty installed.
An isolated executable can be useful for evaluation, but verify which Python
environment and installed dependencies it will analyze.

Ty discovers dependencies through the active environment, a project `.venv`, or
Python on PATH. When discovery selects the wrong environment, choose the intended
interpreter with the supported `--python` option rather than suppressing import errors.

```bash
ty check
ty check path/to/file.py
ty check src/
```

Select the affected paths or package and honor required repository-wide checks.
Match the project's supported Python version and platform. Investigate dependency,
configuration, and stub problems before treating every diagnostic as a source defect.

## Fixes and configuration

Fix errors within the requested scope and rerun affected checks. Preserve existing
rule severities unless changing type-check policy is part of the task. Report
pre-existing failures and unavailable dependencies separately from regressions.

Prefer precise types and localized corrections. When a diagnostic cannot reasonably
be resolved, use a narrow, explained suppression compatible with the project's
checkers; do not apply blanket ignores or demand separate permission for every
justified suppression within authorized work.

For a requested migration, compare diagnostics, dependency discovery, supported
Python syntax, CI exit behavior, and editor setup. Do not equate warning-as-error
settings with another checker's strict mode. A skill file does not itself install
or configure a language server.

## Documentation

- [Type checking and environment discovery](https://docs.astral.sh/ty/type-checking/)
- [Configuration](https://docs.astral.sh/ty/configuration/)
- [Rules](https://docs.astral.sh/ty/rules/)
