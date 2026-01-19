---
description: Perform commit on staged changes 
agent: build
model: anthropic/claude-haiku-4-5-20251001
---

Commit staged changes with clear title and description

Primary Task:
Run `git diff --staged`, review the changes, commit the staged changes with clear title and description.
Describe the purpose of the changes, prioritize clarity, readability, and minimize ambiguity.

Commit message guidelines (Conventional Commits):
- Use the format `<type>[optional scope][!]: <description>`.
- Use `feat` for new features and `fix` for bug fixes; other allowed types include `docs`, `refactor`, `chore`, `test`, `perf`, `ci`, `build`, and `style`.
- Add a scope in parentheses when it clarifies the area affected, e.g. `feat(parser):`.
- Keep the description short, specific, and immediately after the colon and space.
- Add a body when extra context is useful; start it one blank line after the description.
- Add footers after another blank line using trailer style (e.g. `Refs: #123`).
- Indicate breaking changes with `!` before the colon or a `BREAKING CHANGE:` footer.

Example:
```
feat(commands): add dry-run support for commit workflow

Explain how dry-run skips git writes and reports intended actions.

Refs: #412
```

Important:
- DO NOT add any other files that are not staged
- Focus on the staged changes identified by the output of `git diff --staged`
- EXCEPTION: when there are modified files from the process of checking, ONLY add those modified files

Process:
1. Perform checks based on @$HOME/.config/opencode/command/check.md
2. After checks are resolved, proceed with reviewing the output of `git diff`
3. Review modified files from the process of checking, ONLY add those modified files
4. Run `git diff --staged`, then ONLY commit the staged changes
