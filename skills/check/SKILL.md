---
name: check
description: Perform code quality and security checks
---

Run project-specific check command and resolve any resulting errors.

Important:
- DO NOT commit any code during this process
- DO NOT change version numbers
- Focus only on fixing issues identified by checks

Common Checks Include:
1. **Linting**: Code style and syntax errors
2. **Type Checking**: TypeScript/Flow type errors
3. **Unit Tests**: Failing test cases
4. **Security Scan**: Vulnerability detection
5. **Code Formatting**: Style consistency
6. **Build Verification**: Compilation errors

Process:
1. Run the check command
2. Analyze output for errors and warnings
3. Fix issues in priority order:
   - Build-breaking errors first
   - Test failures
   - Linting errors
   - Warnings
4. Re-run checks after each fix
5. Continue until all checks pass

For Different Project Types:
- **JavaScript/TypeScript**: `npm run check` or `yarn run check` (see `lang-typescript` for Biome)
- **Python**: see `lang-python` for `uv`/`ruff`/`ty`; fall back to the repo's own linter/type checker
- **Rust**: `cargo check`, `cargo clippy` (see `lang-rust`)
- **Go**: `go vet`, `staticcheck`
- **Swift**: `swift-format`, `swiftlint` (see `lang-swift` / `xcode-build`)
