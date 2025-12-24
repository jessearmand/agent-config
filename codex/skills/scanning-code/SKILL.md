---
name: scanning-code
description: Structural code search using an AST-based pattern tool (e.g., ast-grep). Use `kind` for "all X" queries and `pattern` for specific code shapes.
compatibility: Requires ast-grep (or an equivalent AST-aware search tool).
---

# scanning-code: Structural Code Search

## When to Use `kind` vs `pattern`

| Query Type | Use | Why |
|------------|-----|-----|
| "Find all X" (functions, classes) | `kind` | Matches AST node type directly |
| Specific code structure | `pattern` | Matches literal code with metavariables |
| "Find X containing Y" | `kind` + `has` | Structural containment |

## Decision Guide

**Use `kind` when:**
- Query is "all functions", "all classes", "all imports"
- You need structural containment (`has`, `inside`)
- Format/style variations shouldn't affect matches

**Use `pattern` when:**
- Matching specific function calls (`print(...)`)
- Matching literal syntax (`with open(...) as ...`)
- You want exact structural matching

## Language-Specific Examples

- **Python**: See [languages/python.md](languages/python.md)
- **Rust**: See [languages/rust.md](languages/rust.md)
- **TypeScript**: See [languages/typescript.md](languages/typescript.md)
- **Swift**: See [languages/swift.md](languages/swift.md)

## AST Node Kinds Quick Reference

| Language | Functions | Classes | Error Handling |
|----------|-----------|---------|----------------|
| Python | `function_definition` | `class_definition` | `try_statement` |
| Rust | `function_item` | `impl_item` | `?` operator |
| TypeScript | `function_declaration` | `class_declaration` | `try_statement` |
| Swift | `function_declaration` | `class_declaration` | `throws` |
