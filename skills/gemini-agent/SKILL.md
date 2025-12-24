---
name: gemini-agent
description: Use an external large-context, multimodal model/CLI (e.g., Gemini) to analyze very large codebases, documents, or images. Use when your primary agent’s context window is insufficient.
compatibility: Requires access to a Gemini-like CLI (or equivalent); may require internet access.
---

# Gemini Agent

Use a large-context CLI model (for example, `gemini`) for tasks requiring massive context or multimodal understanding.

## Quick Start

```bash
# Basic prompt
gemini -p "Your question here"

# Include files with @ syntax
gemini -p "@src/main.py Explain this file"

# Include directories
gemini -p "@src/ Summarize the architecture"

# Pipe content
cat error.log | gemini -p "Analyze these errors"
```

## When to Use Gemini

| Scenario | Use Gemini |
|----------|------------|
| Files totaling > 100KB | Yes |
| Entire codebase analysis | Yes |
| PDF documents | Yes |
| Images (screenshots, diagrams) | Yes |
| Simple code questions | No (use your primary agent) |
| Small file edits | No (use your primary agent/editor) |

## Core Capabilities

- **1M Token Context**: Analyze entire codebases at once
- **Image Understanding**: Screenshots, diagrams, photos
- **Document Analysis**: PDFs, large text files
- **Web Search**: Built-in Google search for current information
- **Reasoning**: In-depth analysis and explanation

## CLI Reference

| Flag | Description |
|------|-------------|
| `-p`, `--prompt` | Run in headless mode with prompt |
| `-m`, `--model` | Select Gemini model |
| `-y`, `--yolo` | Auto-approve all actions |
| `--output-format` | Output as `text`, `json`, or `stream-json` |
| `--include-directories` | Include additional directories |
| `-d`, `--debug` | Enable debug mode |

## File Inclusion Syntax

The `@` prefix includes file or directory contents:

```bash
# Single file
gemini -p "@path/to/file.py Explain this"

# Multiple files
gemini -p "@file1.py @file2.py Compare these"

# Directory (all files)
gemini -p "@src/ Analyze architecture"

# Current directory
gemini -p "@./ Overview of project"
```

**Note**: Paths are relative to where you run the command.

## Detailed Guides

- [Codebase Analysis](codebase-analysis.md) - Code reviews, architecture analysis, implementation verification
- [Media Analysis](media-analysis.md) - Image and document understanding
- [Headless Mode](headless-mode.md) - Scripting and automation
