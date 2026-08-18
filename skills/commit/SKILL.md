---
name: commit
description: This skill should be used when the user asks to "commit my changes", "create a commit", "commit modified files", "commit working tree changes", or otherwise wants a general Git commit that may include staged changes, tracked modifications, deletions, and explicitly approved new files. It enforces Conventional Commits, protects unrelated work, and verifies the intended change without relying on unrelated untracked files.
---

# Commit Changes

Create one focused Git commit from the intended staged and tracked working-tree changes. Preserve unrelated work, make every new-file decision explicit, and prove that the commit passes the repository's checks without depending on files that remain untracked.

## Invariants

- Treat staged changes, unstaged modifications, and tracked deletions as candidates for the commit.
- Commit only one coherent change. If tracked changes contain multiple unrelated concerns, ask which concern to commit first rather than combining them.
- Never use broad staging commands such as `git add .`, `git add -A`, or `git commit -a`; they can capture unrelated work.
- Never stage an untracked file implicitly. Stage a new file only after establishing that it belongs to the requested change and obtaining explicit approval to include it.
- Preserve unrelated untracked files. Never delete, move, ignore, or modify them without explicit approval.
- Preserve existing index selections. Obtain approval before unstaging already-staged content, and leave its worktree content intact.
- Stop when a merge, rebase, cherry-pick, or revert is active, or when the index contains unmerged entries. Use the operation-specific continuation workflow instead of creating an ordinary commit.
- Verify the exact index tree in an environment where files outside that tree are absent.
- Follow the `check` skill and the repository's own setup and validation instructions.

## Process

### 1. Establish the intended scope

1. Inspect repository operation state and the complete working tree, including staged, modified, deleted, renamed, unmerged, and untracked paths.
2. Stop on an active merge, rebase, cherry-pick, or revert. Report the operation and use its specific continuation command only when the user requests that workflow.
3. Review both the staged diff and the unstaged tracked diff. Compare against `HEAD` to understand the complete candidate change.
4. Group changed paths and hunks by purpose. Ask before including tracked hunks whose relationship or completeness is unclear.
5. Check every already-staged hunk, including staged additions. In this general workflow, confirm each new file even when it was staged before the skill started. If staged content is unrelated, ask whether to commit it separately or unstage it while preserving its worktree content. Never change the user's staged selection without approval.
6. Classify every untracked path as related, unrelated, or unclear:
   - **Related:** Required source, test, fixture, configuration, or documentation for the requested change.
   - **Unrelated:** Generated output, local state, another task, or content with no dependency on the requested change.
   - **Unclear:** Insufficient evidence to determine ownership safely.
7. Ask for explicit approval before adding any related untracked path.
8. For unrelated or unclear untracked paths, ask what to do. Recommend leaving them untouched. Other choices, only when explicitly requested, are handling them in a separate commit or adding an appropriate ignore rule. Never delete them by default.

Do not continue to staging while the intended scope, existing staged content, or treatment of untracked files remains ambiguous.

### 2. Prepare the candidate change

1. Stage approved new files by explicit path.
2. Stage intended tracked modifications, renames, and deletions with explicit pathspecs or tracked-only staging such as `git add -u -- <paths>`.
3. Use partial staging when one tracked file contains both related and unrelated hunks.
4. If approved, unstage only unrelated staged paths or hunks while preserving their worktree content.
5. Reinspect the staged and unstaged diffs. Confirm that the index contains the complete intended change, no unrelated hunk, and no unapproved new file.

### 3. Verify without unrelated untracked files

Validate the exact candidate stored in the index, not a text approximation of its diff:

1. Write the index to a Git tree object and record its tree identifier. Stop if unmerged entries prevent creating the tree.
2. Create a distinct Git checkout or worktree root under the repository's permitted scratch location. Do not use an ordinary nested directory that can inherit the dirty parent worktree, and never use a system temporary directory when repository policy forbids it.
3. Materialize the recorded tree in that isolated Git root with Git's tree or index checkout machinery rather than a textual patch. This preserves binary files, symlinks, file modes, and exact staged content.
4. Run every setup and validation command with the isolated root as its working directory and source boundary. Reject tracked symlinks, scripts, environment configuration, or resolved paths that read source from the original dirty worktree; use stronger filesystem isolation when the repository requires it.
5. Do not copy any other untracked, ignored, or unstaged source files into the validation root. Project setup may create its own dependencies, caches, and build outputs there.
6. Perform required project setup, then follow the `check` skill. Run the repository's relevant lint, type-check, test, and build commands.
7. If a check requires a source rewrite, report the exact rewrite and ask whether to extend the candidate. If approved, apply and stage only the reviewed hunks, create a new index tree, and rerun affected checks.
8. If validation fails because the candidate references a file outside the index tree, stop. Either approve and stage that file or remove the dependency; do not claim the candidate passes.
9. Remove the isolated validation root after success or failure without changing the user's unrelated files or original index state.

Treat checks from the original working tree as insufficient when unstaged or untracked source files were visible there. The isolated result is the required evidence that normal repository validation does not depend on them.

### 4. Review the final staged diff

1. Write the current index to a tree object and compare its identifier with the tree that passed validation.
2. If the identifiers differ, inspect the change and revalidate the new tree before committing.
3. Inspect `git status --short` and `git diff --staged` again.
4. Confirm that unrelated tracked changes and all unapproved untracked files remain outside the commit.
5. Derive the commit message from the final staged diff, not from the conversation alone.

### 5. Write a Conventional Commit message

Use this format:

```text
<type>[optional scope][!]: <description>

[optional body]

[optional trailers]
```

Apply these rules:

- Use `feat` for a new user-visible capability and `fix` for a bug fix.
- Use `docs`, `refactor`, `chore`, `test`, `perf`, `ci`, `build`, or `style` when one of those describes the change more accurately.
- Add a scope in parentheses only when it clarifies the affected subsystem, for example `fix(parser):`.
- Keep the description specific, imperative, and within 100 columns. Do not end it with a period.
- Add a body when the reason, behavior, tradeoff, or migration impact is not clear from the subject. Separate it with one blank line and wrap it within 120 columns.
- Explain why the change exists and what behavior changed; do not merely list filenames.
- Add trailer-style footers after another blank line, for example `Refs: #123`.
- Mark breaking changes with `!` before the colon or a `BREAKING CHANGE:` footer.

Example:

```text
fix(config): validate tracked changes without local files

Run checks from the candidate diff so ignored and unrelated untracked files cannot hide missing dependencies.

Refs: #412
```

### 6. Commit and report

1. Commit only after isolated validation passes and the final staged diff matches the validated candidate.
2. Do not bypass Git hooks with `--no-verify` unless explicitly requested.
3. After committing, compare `HEAD^{tree}` with the validated tree identifier. If they differ, report the hook-induced or concurrent change immediately; do not amend or push automatically.
4. Do not amend, squash, push, or alter earlier commits unless explicitly requested.
5. Report the commit identifier and subject, the validation commands that passed, and any unrelated files deliberately left untouched.
6. If checks cannot pass, do not commit. Report the failing command and the evidence needed to decide the next action.
