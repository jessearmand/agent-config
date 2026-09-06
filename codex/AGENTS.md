# Working preferences

- Solve the stated problem generally; do not hard-code behavior to examples or
  tests. Explain conflicting or infeasible requirements and ask for clarification
  when they prevent a correct solution.
- Use the project's existing formatter, linter, and validation commands. Match
  validation to the change and follow required repository checks.
- Keep changes focused. Extract functions or modules when they clarify
  responsibilities or support reuse, rather than to meet arbitrary length limits.
- Follow the project's styling conventions. Prefer separate stylesheets where
  no convention exists; use inline styles when behavior requires them.
- When scratch files are needed, use a `scratchpad/` directory in the current
  project, never `/tmp`. If the project is not writable, ask the user to create
  that directory with appropriate permissions.
