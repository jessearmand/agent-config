#!/usr/bin/env python3
"""Pi configuration protection through the shared tool adapter (no tool execution)."""

from __future__ import annotations

import os
import tempfile
import unittest
from contextlib import ExitStack
from pathlib import Path
from unittest import mock

from omp_guard import judge

SCRATCHPAD = Path(__file__).resolve().parent.parent / "scratchpad"
PI_CONFIG_FILES = (
    "settings.json",
    "mcp.json",
    "models.json",
    "keybindings.json",
    "trust.json",
    "SYSTEM.md",
    "APPEND_SYSTEM.md",
)


class PiConfigTests(unittest.TestCase):
    def setUp(self) -> None:
        SCRATCHPAD.mkdir(exist_ok=True)
        stack = ExitStack()
        self.addCleanup(stack.close)
        self.project = stack.enter_context(tempfile.TemporaryDirectory(dir=SCRATCHPAD))
        stack.enter_context(
            mock.patch.dict(
                os.environ,
                {
                    "CONFIG_GUARD_DISABLE": "0",
                    "CONFIG_GUARD_ASK": "0",
                    "HOOK_ASK_CRITICAL": "0",
                    "HOOK_ASK_HIGH": "0",
                    "HOOK_JEV_ENABLE": "0",
                    "HOOKS_LOG_DIR": str(Path(self.project) / "logs"),
                },
            )
        )

    def verdict(self, tool: str, inputs: dict) -> dict:
        return judge({"tool": tool, "input": inputs, "cwd": self.project})

    def test_pi_configuration_writes(self) -> None:
        for root in ("~/.pi/agent", ".pi"):
            for name in PI_CONFIG_FILES:
                target = f"{root}/{name}"
                calls = (
                    ("write", {"path": target, "content": "{}"}),
                    (
                        "edit",
                        {"path": target, "edits": [{"oldText": "a", "newText": "b"}]},
                    ),
                    ("bash", {"command": f"printf x > {target}"}),
                )
                for tool, inputs in calls:
                    with self.subTest(tool=tool, target=target):
                        result = self.verdict(tool, inputs)
                        self.assertEqual(result["decision"], "deny")
                        self.assertEqual(result["hook"], "config-guard")

    def test_ordinary_files_and_configuration_reads(self) -> None:
        for target in ("src/models.json", "docs/SYSTEM.md", ".pi/notes.md"):
            with self.subTest(target=target):
                result = self.verdict("write", {"path": target, "content": "notes"})
                self.assertEqual(result["decision"], "defer")
        for name in PI_CONFIG_FILES:
            with self.subTest(name=name):
                result = self.verdict("read", {"path": f"~/.pi/agent/{name}"})
                self.assertEqual(result["decision"], "defer")

    def test_relocated_agent_configuration(self) -> None:
        agent_dir = str(Path(self.project) / "agent-state")
        with mock.patch.dict(os.environ, {"PI_CODING_AGENT_DIR": agent_dir}):
            for name in PI_CONFIG_FILES:
                with self.subTest(name=name):
                    result = self.verdict(
                        "write", {"path": f"{agent_dir}/{name}", "content": "{}"}
                    )
                    self.assertEqual(result["decision"], "deny")
            result = self.verdict(
                "bash", {"command": 'printf x > "$PI_CODING_AGENT_DIR/mcp.json"'}
            )
            self.assertEqual(result["decision"], "deny")
            result = self.verdict("bash", {"command": f"rm -r {agent_dir}"})
            self.assertEqual(result["decision"], "deny")
            result = self.verdict(
                "write", {"path": f"{agent_dir}/notes.md", "content": "notes"}
            )
            self.assertEqual(result["decision"], "defer")


if __name__ == "__main__":
    unittest.main()
