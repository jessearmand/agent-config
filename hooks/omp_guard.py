#!/usr/bin/env python3
"""Adapt omp and pi tool calls to the shared deterministic and Jev guard policies."""

from __future__ import annotations

import json
import os
import re
import shlex
import sys
from collections.abc import Iterable

sys.path.insert(0, os.path.dirname(os.path.realpath(__file__)))

os.environ.setdefault(
    "HOOKS_LOG_DIR",
    os.path.join(os.path.expanduser("~"), ".omp", "hooks-logs"),
)

import bash_risk_judge  # noqa: E402
import config_guard  # noqa: E402
import dangerous_commands  # noqa: E402
import file_protection  # noqa: E402
import rm_rf_guard  # noqa: E402
import secrets_guard  # noqa: E402
from hook_protocol import Decision, log_event, paths_from, read_input  # noqa: E402

HANDLED_TOOLS = (
    "bash",
    "read",
    "write",
    "edit",
    "multiedit",
    "grep",
    "glob",
    "find",
    "ls",
    "ast_edit",
    "apply_patch",
)
_URL_SCHEME = re.compile(r"^[A-Za-z][A-Za-z0-9+.-]*://")
_SELECTOR_WORD = re.compile(r"raw|img|conflicts|-?\d[\d+,\-]*|\d*-\d*")
_HASHLINE_HEADER = re.compile(r"^\[([^\]\n]+?)#[0-9A-Fa-f]{4}\]\s*$", re.MULTILINE)
_HASHLINE_MV = re.compile(r"^MV\s+(.+?)\s*$", re.MULTILINE)
_PATCH_FILE = re.compile(
    r"^\*\*\* (?:Add|Update|Delete) File: (.+?)\s*$",
    re.MULTILINE,
)
_PATCH_MOVE = re.compile(r"^\*\*\* Move to: (.+?)\s*$", re.MULTILINE)
# Sloppy mode names the file on its own header. ` all` is a match-every flag,
# and a bare header continues the file already open.
_SLOPPY_FILE = re.compile(r"^\*\*\* Edit File:[ \t]*(.*)[ \t]*$", re.MULTILINE)
_RENAME_DEPTH = 8


def strip_selector(path: str) -> str:
    """Remove read selectors and query strings without changing archive or DB members."""
    value = path.split("?", 1)[0]
    head, separator, tail = value.partition(":")
    if not separator:
        return value

    selectors = tail.split(":")
    if selectors and all(_SELECTOR_WORD.fullmatch(item) for item in selectors):
        return head
    return value


def split_targets(value: object) -> list[str]:
    """Split a semicolon-delimited tool path field into normalized targets."""
    if not isinstance(value, str) or not value.strip():
        return ["."]
    return [strip_selector(item.strip()) for item in value.split(";") if item.strip()]


def _append_unique(paths: list[str], values: Iterable[str]) -> None:
    for value in values:
        if value and value not in paths:
            paths.append(value)


def _move_path(value: str) -> str:
    try:
        parts = shlex.split(value)
    except ValueError:
        return value.strip()
    return parts[0] if parts else ""


def _sloppy_path(raw: str) -> str:
    """The file a sloppy `*** Edit File:` header writes, without its match flag."""
    text = raw.strip()
    if text == "all":
        return ""
    if text.endswith(" all"):
        text = text[: -len(" all")].rstrip()
    if len(text) >= 2 and text[0] == text[-1] and text[0] in "\"'":
        return text[1:-1].strip()
    # An unclosed quote is still a path. Dropping it would hide the destination.
    if text.startswith(("'", '"')):
        return text[1:].strip()
    return text


def _destination_strings(value: object, depth: int = 0) -> tuple[list[str], bool]:
    """Path strings inside one rename value, and whether a destination was lost.

    The documented value is a string. A list or object is walked so a nested
    path is still checked. A number, boolean, or other non-path is unreadable:
    treating it as "no destination" would let the edit defer.
    """
    if isinstance(value, str):
        text = value.strip()
        return ([text] if text else []), False
    if depth >= _RENAME_DEPTH or not isinstance(value, (dict, list, tuple)):
        return [], True
    nodes = value.values() if isinstance(value, dict) else value
    found: list[str] = []
    for node in nodes:
        if node is None:
            continue
        paths, _hidden = _destination_strings(node, depth + 1)
        found.extend(paths)
    if found:
        return found, False
    return [], True


def _patch_rename_destinations(edits: object) -> tuple[list[str], bool]:
    """Every patch-mode `edits[].rename` destination, and any unreadable one.

    The wire contract is a list of objects with an optional string `rename`
    (the file the top-level path is moved onto). One object is read the same
    way. Entries that are not objects have no rename and are skipped. An empty
    string is not a destination; any other non-path rename is unreadable.
    """
    if isinstance(edits, dict):
        entries: Iterable[object] = (edits,)
    elif isinstance(edits, (list, tuple)):
        entries = edits
    else:
        return [], False

    found: list[str] = []
    unreadable = False
    for entry in entries:
        if not isinstance(entry, dict):
            continue
        rename = entry.get("rename")
        if rename is None:
            continue
        paths, hidden = _destination_strings(rename)
        _append_unique(found, paths)
        unreadable = unreadable or hidden
    return found, unreadable


def edit_paths(inputs: dict) -> list[str]:
    """Extract every source and destination path from edit-family tool inputs.

    Hashline puts a destination on `MV`, and apply-patch puts one on
    `*** Move to:`. Patch mode puts it on `edits[].rename` instead of in the
    patch text. Sloppy mode names each file with `*** Edit File:`.
    """
    found: list[str] = []
    edit_input = inputs.get("input")
    if isinstance(edit_input, str):
        _append_unique(found, _HASHLINE_HEADER.findall(edit_input))
        _append_unique(
            found, (_move_path(value) for value in _HASHLINE_MV.findall(edit_input))
        )

    for key in ("input", "patch"):
        value = inputs.get(key)
        if not isinstance(value, str):
            continue
        _append_unique(found, _PATCH_FILE.findall(value))
        _append_unique(found, _PATCH_MOVE.findall(value))
        _append_unique(
            found, (_sloppy_path(item) for item in _SLOPPY_FILE.findall(value))
        )

    _append_unique(found, paths_from(inputs))
    destinations, _unreadable = _patch_rename_destinations(inputs.get("edits"))
    _append_unique(found, destinations)
    return found


def _payload(
    tool_name: str,
    tool_inputs: dict,
    cwd: str,
    session_id: object,
) -> dict:
    return {
        "tool_name": tool_name,
        "tool_input": tool_inputs,
        "cwd": cwd,
        "session_id": session_id,
    }


def normalize(
    tool: str,
    inputs: dict,
    cwd: str,
    session_id: object = None,
) -> list[dict]:
    """Translate one omp tool call into Claude-shaped guard payloads."""
    if tool == "bash":
        command_cwd = inputs.get("cwd")
        effective_cwd = (
            os.path.normpath(os.path.join(cwd, command_cwd))
            if isinstance(command_cwd, str) and command_cwd
            else cwd
        )
        command = inputs.get("command", "")
        return [_payload("Bash", {"command": command}, effective_cwd, session_id)]

    if tool in ("read", "write"):
        paths = paths_from(inputs)
        if not paths:
            return []
        path = paths[0]
        if _URL_SCHEME.match(path):
            return []
        normalized = strip_selector(path) if tool == "read" else path
        tool_name = "Read" if tool == "read" else "Write"
        return [_payload(tool_name, {"file_path": normalized}, cwd, session_id)]

    if tool in ("grep", "glob", "find", "ls"):
        # pi names its file-listing tools find/ls; omp calls the same thing glob.
        tool_name = "Grep" if tool == "grep" else "Glob"
        return [
            _payload(tool_name, {"path": path}, cwd, session_id)
            for path in split_targets(inputs.get("path"))
            if not _URL_SCHEME.match(path)
        ]

    if tool in ("edit", "multiedit", "apply_patch"):
        return [
            _payload("Edit", {"file_path": path}, cwd, session_id)
            for path in edit_paths(inputs)
        ]

    if tool == "ast_edit":
        paths = inputs.get("paths", [])
        if not isinstance(paths, list):
            return []
        return [
            _payload("Edit", {"file_path": path}, cwd, session_id)
            for path in paths
            if isinstance(path, str) and path
        ]

    return []


def _verdict(result: Decision | None) -> dict:
    if result is None:
        return {
            "decision": "defer",
            "reason": "",
            "hook": "",
            "system_message": None,
        }
    return {
        "decision": result.decision,
        "reason": result.reason,
        "hook": result.hook,
        "system_message": result.system_message,
    }


_UNREADABLE_RENAME = (
    "This edit includes a rename destination that is not a path, so it is not "
    "possible to tell whether a protected file would be replaced."
)


def judge(request: dict) -> dict:
    """Run all applicable guards and return the strongest verdict."""
    tool = request.get("tool", "")
    inputs = request.get("input")
    cwd = request.get("cwd")
    tool_name = tool if isinstance(tool, str) else ""
    tool_inputs = inputs if isinstance(inputs, dict) else {}
    payloads = normalize(
        tool_name,
        tool_inputs,
        cwd if isinstance(cwd, str) and cwd else os.getcwd(),
        request.get("session_id"),
    )
    unreadable_rename = False
    if tool_name in ("edit", "multiedit", "apply_patch"):
        _destinations, unreadable_rename = _patch_rename_destinations(
            tool_inputs.get("edits")
        )
    if not payloads and not unreadable_rename:
        return _verdict(None)

    first_ask: Decision | None = None
    for hook in (rm_rf_guard, dangerous_commands, secrets_guard, config_guard, file_protection):
        for payload in payloads:
            try:
                result = hook.run(payload)
            except re.error as error:
                log_event(
                    "omp-guard",
                    {
                        "outcome": "rule-error",
                        "guard": hook.__name__,
                        "error": str(error),
                        "tool": payload.get("tool_name"),
                    },
                )
                continue
            if result is None:
                continue
            if result.decision == "deny":
                return _verdict(result)
            if first_ask is None and result.decision == "ask":
                first_ask = result

    if first_ask is not None:
        return _verdict(first_ask)

    if unreadable_rename:
        log_event(
            "omp-guard",
            {
                "outcome": "ask",
                "reason": "unreadable-rename",
                "tool": tool_name,
                "session_id": request.get("session_id"),
            },
        )
        return {
            "decision": "ask",
            "reason": _UNREADABLE_RENAME,
            "hook": "omp-guard",
            "system_message": None,
        }

    if tool == "bash":
        judged = dict(payloads[0])
        prompt = request.get("user_prompt")
        if isinstance(prompt, str) and prompt.strip():
            # The host's latest user message: task context for the model judge.
            judged["user_prompt"] = prompt
        return _verdict(bash_risk_judge.run(judged))
    return _verdict(None)


def main() -> None:
    json.dump(judge(read_input("omp_guard")), sys.stdout, ensure_ascii=False)
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
