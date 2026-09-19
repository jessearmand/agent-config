#!/usr/bin/env python3
"""Behavioral tests for the omp guard dispatcher."""

from __future__ import annotations

import json
import os
import stat
import subprocess
import sys
import tempfile
from contextlib import contextmanager
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from omp_guard import edit_paths, judge, strip_selector  # noqa: E402

_HOOK = os.path.join(os.path.dirname(os.path.abspath(__file__)), "omp_guard.py")
_SCRATCHPAD = Path(__file__).resolve().parent.parent / "scratchpad"
SUCCESS_JSON = json.dumps(
    {
        "answers": {
            "destructive": {"probability": 0.93},
            "exfiltrates": {"probability": 0.02},
            "scope": {"choice": "home_directory"},
        },
        "usage": {"inputTokens": 40, "outputTokens": 3, "totalTokens": 43},
    }
)
_GUARD_ENV = (
    "AI_GATEWAY_API_KEY",
    "BASH_RISK_JUDGE_ASK_THRESHOLD",
    "BASH_RISK_JUDGE_DISABLE",
    "FILE_PROTECTION_ASK",
    "FILE_PROTECTION_DISABLE",
    "HOOK_JEV_ENABLE",
    "HOOK_ASK_CRITICAL",
    "HOOK_ASK_HIGH",
    "HOOK_ASK_STRICT",
    "SECRETS_GUARD_DISABLE",
    "SECRETS_GUARD_LEVEL",
)


@contextmanager
def _environment(updates: dict[str, str] | None = None):
    saved = {name: os.environ.get(name) for name in _GUARD_ENV}
    try:
        for name in _GUARD_ENV:
            os.environ.pop(name, None)
        os.environ.update(updates or {})
        yield
    finally:
        for name, value in saved.items():
            if value is None:
                os.environ.pop(name, None)
            else:
                os.environ[name] = value


def _request(tool: str, inputs: dict) -> dict:
    return {
        "tool": tool,
        "input": inputs,
        "cwd": str(_SCRATCHPAD),
        "session_id": "test-session",
    }


def _check(condition: bool, label: str, failures: list[str]) -> None:
    if condition:
        print(f"  pass  {label}")
    else:
        print(f"  FAIL  {label}")
        failures.append(label)


def _shim(directory: str, body: str) -> None:
    path = os.path.join(directory, "ai")
    with open(path, "w", encoding="utf-8") as handle:
        handle.write("#!/bin/sh\n" + body + "\n")
    os.chmod(path, os.stat(path).st_mode | stat.S_IXUSR)


def _run(
    request: dict, env: dict[str, str] | None = None
) -> subprocess.CompletedProcess[str]:
    clean_env = {**os.environ, **(env or {})}
    for name in _GUARD_ENV:
        if not env or name not in env:
            clean_env.pop(name, None)
    return subprocess.run(
        [sys.executable, _HOOK],
        input=json.dumps(request),
        capture_output=True,
        text=True,
        env=clean_env,
        check=False,
    )


def main() -> int:
    failures: list[str] = []
    _SCRATCHPAD.mkdir(exist_ok=True)

    print("Selectors:")
    for source, expected in (
        ("src/foo.ts:50-200", "src/foo.ts"),
        ("a.py:raw:2-4", "a.py"),
        ("x.md:5-16,960-973", "x.md"),
        ("db.sqlite:users:42", "db.sqlite:users:42"),
        ("arch.zip:inner/.env", "arch.zip:inner/.env"),
        ("img.png?q=what", "img.png"),
        (".env:-60", ".env"),
    ):
        actual = strip_selector(source)
        _check(actual == expected, f"{source} -> {actual}", failures)

    print("\nEdit paths:")
    hashline = {
        "input": (
            '[src/a.py#1A2B]\nPUT 1.=1:\n+x\n[src/b.py#3C4D]\nMV "new dir/x.py"\n'
        )
    }
    _check(
        edit_paths(hashline) == ["src/a.py", "src/b.py", "new dir/x.py"],
        "hashline sections and move destination",
        failures,
    )
    patch = {
        "patch": (
            "*** Begin Patch\n"
            "*** Update File: Cargo.lock\n"
            "*** Move to: b.rs\n"
            "*** End Patch\n"
        )
    }
    _check(
        edit_paths(patch) == ["Cargo.lock", "b.rs"],
        "apply-patch source and move destination",
        failures,
    )
    _check(edit_paths({"path": "uv.lock"}) == ["uv.lock"], "explicit path", failures)

    print("\nPolicy composition:")
    with tempfile.TemporaryDirectory(dir=_SCRATCHPAD) as log_dir:
        os.environ["HOOKS_LOG_DIR"] = log_dir
        with _environment():
            cases = (
                (
                    _request("bash", {"command": "rm -rf build"}),
                    "deny",
                    "rm-rf-guard",
                    "rm -rf",
                ),
                (
                    _request("bash", {"command": "cat .env"}),
                    "deny",
                    "secrets-guard",
                    "secret command",
                ),
                (
                    _request(
                        "edit", {"input": "[package-lock.json#1A2B]\nPUT 1.=1:\n+x"}
                    ),
                    "deny",
                    "file-protection",
                    "hashline lockfile edit",
                ),
                (
                    _request("write", {"path": ".env", "content": "x"}),
                    "deny",
                    "secrets-guard",
                    "secret write",
                ),
                (
                    _request("read", {"path": "src/main.rs:10-20"}),
                    "defer",
                    "",
                    "ordinary selected read",
                ),
                (
                    _request("grep", {"path": ".env; src", "pattern": "x"}),
                    "deny",
                    "secrets-guard",
                    "multi-target grep",
                ),
                (
                    _request("bash", {"command": "git status"}),
                    "defer",
                    "",
                    "ordinary Bash command",
                ),
                (
                    _request("eval", {"language": "py", "code": "1"}),
                    "defer",
                    "",
                    "unhandled tool",
                ),
            )
            for request, decision, hook, label in cases:
                result = judge(request)
                _check(
                    result["decision"] == decision and result["hook"] == hook,
                    f"{label} -> {decision}/{hook or '-'}",
                    failures,
                )

        with tempfile.TemporaryDirectory(dir=_SCRATCHPAD) as bindir:
            capture = os.path.join(bindir, "model-called")
            _shim(
                bindir,
                f"touch '{capture}'; cat >/dev/null; printf '%s' '{SUCCESS_JSON}'",
            )
            with _environment(
                {
                    "AI_GATEWAY_API_KEY": "test-key",
                    "FILE_PROTECTION_ASK": "1",
                    "HOOK_JEV_ENABLE": "1",
                }
            ):
                old_path = os.environ.get("PATH", "")
                os.environ["PATH"] = bindir + os.pathsep + old_path
                try:
                    result = judge(_request("bash", {"command": "rm -rf build"}))
                finally:
                    os.environ["PATH"] = old_path
            _check(
                result["decision"] == "deny" and not os.path.exists(capture),
                "deterministic denial skips Jev",
                failures,
            )

        with tempfile.TemporaryDirectory(dir=_SCRATCHPAD) as bindir:
            _shim(bindir, f"cat >/dev/null; printf '%s' '{SUCCESS_JSON}'")
            with _environment(
                {
                    "AI_GATEWAY_API_KEY": "test-key",
                    "HOOK_JEV_ENABLE": "1",
                }
            ):
                old_path = os.environ.get("PATH", "")
                os.environ["PATH"] = bindir + os.pathsep + old_path
                try:
                    result = judge(_request("bash", {"command": "git clean -xdf"}))
                finally:
                    os.environ["PATH"] = old_path
            _check(
                result["decision"] == "ask" and result["hook"] == "bash-risk-judge",
                "Jev escalation -> ask/bash-risk-judge",
                failures,
            )

    print("\nProcess protocol:")
    denied = _run(_request("bash", {"command": "rm -rf build"}))
    denied_json = json.loads(denied.stdout)
    _check(
        denied.returncode == 0 and denied_json["decision"] == "deny",
        "subprocess denial returns JSON",
        failures,
    )
    deferred = _run(_request("read", {"path": "README.md:1-10"}))
    deferred_json = json.loads(deferred.stdout)
    _check(
        deferred.returncode == 0 and deferred_json["decision"] == "defer",
        "subprocess defer returns JSON",
        failures,
    )
    invalid = subprocess.run(
        [sys.executable, _HOOK],
        input="not json",
        capture_output=True,
        text=True,
        check=False,
    )
    _check(
        invalid.returncode == 1 and "invalid JSON" in invalid.stderr,
        "invalid JSON exits 1",
        failures,
    )

    print()
    if failures:
        print(f"{len(failures)} failure(s):")
        for failure in failures:
            print(f"  - {failure}")
        return 1
    print("omp_guard: all tests passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
