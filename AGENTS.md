# AGENTS: Repository Guidance

- Scope: this repo manages reusable agent configuration: Codex config, opencode config, agent prompts, skills, and small helper scripts. There is no single app build.
- Before editing, distinguish portable configuration from local machine state. Commit reusable skills, prompts, docs, non-secret provider definitions, and profile files that work across machines. Keep local app paths, cache paths, trusted project lists, marketplace timestamps, generated files, and personal runtime state out of shared commits.
- Secrets must not be tracked. Do not commit API keys, provider tokens, bearer headers, auth files, or literal MCP header values. Use environment-variable indirection instead, and warn the user to remove and rotate any secret that appears in a tracked or staged file.
- Config files may contain provider names, base URLs, model IDs, and env var names such as `OPENAI_API_KEY`; they must not contain the corresponding secret values.
- Use `rg` for recursive search and filtering of plain text output.
- Run checks from `skills/check/SKILL.md` for the files you touched. Because this repo has mixed config and skill files, use targeted validation: parse changed TOML/JSON/YAML, run Python checks for changed scripts, and run language-specific checks only when touching that language.
- Keep skills and scripts modular; split long workflows into focused files instead of growing one large file.
- Prefer existing repo conventions and tool-owned formatting. Defer to the language skills for tooling (`lang-typescript` for TypeScript/JavaScript, `uv`/`ruff`/`ty` for Python) instead of adding framework-specific style rules here.
- Follow the project's existing linter and formatter. Do not add a second JS toolchain beside the one already configured.
- `npm`, `bun`, and `pnpm` are managed by mise. Do not install those package managers outside mise.
- Keep commits small and focused. Before committing, review `git diff --staged` for accidental local paths, generated state, and secrets.
- Do not use `/tmp` as a scratchpad, create a `scratchpad` directory in the current working directory of a project.
- If you don't have write access to the current working directory, ask the user to create a `scratchpad` directory with proper permission.

## Code Review Rules

### Review the declared scope and affected contracts

- Establish the PR's base and head, intended behavior, supported platforms, and
  explicit exclusions from its description before reviewing. If scope is unclear,
  state the assumption and the clarification needed instead of silently expanding it.
- Review changed behavior and affected callers and dependencies. Report concrete
  correctness or security defects caused by the PR even when no custom rule names
  them. Keep unrelated pre-existing issues, new feature coverage, and architectural
  proposals as non-blocking follow-up work.

### Return one actionable batch of findings

- Complete the scoped review before returning one consolidated list. Group duplicate
  symptoms by root cause and check existing threads before adding another finding.
- For each finding, give its priority, location, violated contract or applicable
  rule, triggering conditions, impact, occurrence likelihood with assumptions, and
  a reproduction or source trace. Separate demonstrated failures from uncertainty;
  do not invent probability estimates or infer safety from passing tests alone.
- Describe the smallest safe correction and an acceptance check with a failing case
  and a legitimate control. Keep formatting and mechanical checks in existing CI.

### Keep follow-up reviews bounded

- After the consolidated review, verify tracked fixes and newly changed behavior
  and dependencies. Start another full review only when the author requests it or
  the PR materially changes scope; explain any necessary scope expansion.
- Reopen a resolved finding only with fresh evidence that it remains or has regressed.
  New blockers must identify a concrete defect in the affected PR behavior; unrelated
  improvements belong in follow-up work. Once tracked blockers are verified, state
  remaining evidence gaps and stop rather than searching repeatedly for new scope.
- These rules guide review feedback; tests, branch protections, and required
  approvals remain the enforcement gates.

## Skill conventions

- Skills in this repo are the canonical, harness-neutral source. Do not reference a specific
  harness (Claude Code plugins or slash commands, Codex, opencode) inside `skills/`. Downstream
  repos (e.g. `claude-code-rules`) mirror these skills and re-apply their harness-specific
  overlays with their own sync script. Two exceptions: reference material whose purpose is
  per-harness setup (e.g. MCP client configuration tables) and skills that are inherently
  harness-scoped (e.g. `hatch-pet`) may name harnesses; keep the core workflow guidance
  harness-neutral.
- Refer to sibling skills by name (e.g. "follow the `check` skill"), never by repo-relative
  path — deployed skill directories do not guarantee this repo's layout.
- Split large guides into `references/` files that `SKILL.md` links, so agents load only what
  they need (see `lang-swift/references/`, `lang-typescript/references/`).
- When two skills need the same material, cross-link instead of duplicating (e.g. `lang-swift`
  defers build/test workflow to `xcode-build`; `fetching-docs` defers cross-repo search to
  `grep-code-search`).

## Generic skills

Cross-agent skills live under `skills/`, each with its own `SKILL.md`:

- Languages: `lang-python`, `lang-rust`, `lang-typescript`, `lang-swift`. Toolchain details live in each skill's `SKILL.md` plus `references/` (TypeScript: Oxlint, Oxfmt, Biome).
- Platform/build: `xcode-build`, `scanning-code`, `process-pdf`
- Research/docs: `fetching-docs`, `grep-code-search`
- Workflow: `check`, `commit-staged`
- Generators: `hatch-pet` (harness-scoped: Codex-compatible pet spritesheets)
