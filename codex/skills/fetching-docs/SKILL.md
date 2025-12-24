---
name: fetching-docs
description: Fetch authoritative library/API documentation and analyze Git repositories. Use when you need up-to-date docs, real-world usage examples, or to quickly understand an unfamiliar codebase.
compatibility: Optional internet access; optional doc-fetch tool and repo-ingest/search helpers.
---

# Fetching Documentation

Use this skill to quickly gather trustworthy information needed to implement or debug code.

## General Workflow

1. Identify the exact question (API surface, config, version constraints, examples).
2. Prefer primary sources: official docs, release notes, and the library’s own repository.
3. Cross-check version compatibility with the target project.
4. Keep provenance: URLs, versions, and/or commit hashes for anything non-obvious.

## Library/API Documentation

- If your agent/runtime provides a documentation retrieval tool, use it to fetch the relevant API pages for the exact library + version you need.
- If you have Context7 available, the common flow is:
  - Resolve a library ID (e.g., `mcp__context7__resolve-library-id`)
  - Fetch focused docs (e.g., `mcp__context7__get-library-docs`)
- Otherwise, use the library’s official docs site (or web search) and verify the version matches the project.

## Repository Analysis

### Local repositories

- Use fast code search (e.g., `rg`, `git grep`, IDE search) to find relevant symbols.
- Read `README`, `CHANGELOG`, and `docs/` before diving into implementation.

### Remote repositories (no local checkout)

- If you have a “repo-to-text” ingester (e.g., `gitingest`), generate a digest to reduce context switching.
- Otherwise, clone the repository locally and inspect it with normal tooling.

Example (optional, if `gitingest` is installed):

```bash
# Remote repository
gitingest https://github.com/user/repo

# Local directory
gitingest /path/to/repo

# Specific branch
gitingest https://github.com/user/repo -b main
```

## Cross-Repository Code Search

Use cross-repo search to find real-world usage patterns (configuration snippets, migration examples, gotchas).

- Be specific: search for exact imports, error messages, or function names.
- Expect rate limits and result caps; refine queries iteratively.

If this skill’s helper script is available, you can run it from this skill directory:

```bash
python scripts/grepgithub.py -q "ProviderTransform" -frepo "owner/repo"
```

Script options:
- `-q QUERY` (required), `-r` (regex), `-c` (case sensitive), `-w` (whole words)
- `-frepo owner/repo`, `-fpath PATH`, `-flang LANG[,LANG]`
- `-json` (machine-readable), `-o FILE`, `--max-pages N`
