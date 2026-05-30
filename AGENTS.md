# AGENTS: Repository Guidance

- Scope: this repo manages reusable agent configuration: Codex config, opencode config, agent prompts, skills, and small helper scripts. There is no single app build.
- Before editing, distinguish portable configuration from local machine state. Commit reusable skills, prompts, docs, non-secret provider definitions, and profile files that work across machines. Keep local app paths, cache paths, trusted project lists, marketplace timestamps, generated files, and personal runtime state out of shared commits.
- Secrets must not be tracked. Do not commit API keys, provider tokens, bearer headers, auth files, or literal MCP header values. Use environment-variable indirection instead, and warn the user to remove and rotate any secret that appears in a tracked or staged file.
- Config files may contain provider names, base URLs, model IDs, and env var names such as `OPENAI_API_KEY`; they must not contain the corresponding secret values.
- Use `rg` for recursive search and filtering of plain text output.
- Run checks from `skills/check/SKILL.md` for the files you touched. Because this repo has mixed config and skill files, use targeted validation: parse changed TOML/JSON/YAML, run Python checks for changed scripts, and run language-specific checks only when touching that language.
- Use 4-space indentation unless the surrounding file uses another convention. Keep skills and scripts modular; split long workflows into focused files instead of growing one large file.
- Prefer existing repo conventions and tool-owned formatting. For TypeScript/JavaScript, rely on the configured linter/formatter such as oxlint, Prettier, or the project-local equivalent instead of adding framework-specific style rules here.
- Keep commits small and focused. Before committing, review `git diff --staged` for accidental local paths, generated state, and secrets.
