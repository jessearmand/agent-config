#!/usr/bin/env bun
/**
 * Find dangling agent-skill symlinks left by `bunx skills add`.
 *
 * Install layout: canonical copy at ~/.agents/skills/<name>, then a symlink
 * from each agent's skills dir. After the canonical copy is removed, those
 * links stay behind because `skills remove` does not walk legacy agent paths.
 *
 * Default is dry-run. Pass --delete to unlink. Only dangling symlinks whose
 * target is under .agents/skills are removed; live links are left alone.
 *
 *   bun scripts/clean-dangling-skill-symlinks.ts
 *   bun scripts/clean-dangling-skill-symlinks.ts --delete
 */
import { $ } from "bun";
import { lstat, readdir, readlink } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";

const SKIP_HOME_DIRS: Record<string, true> = {
  ".Trash": true,
  ".bun": true,
  ".cache": true,
  ".cargo": true,
  ".docker": true,
  ".local": true,
  ".npm": true,
  ".nvm": true,
  ".rustup": true,
};

type Mode = "dry-run" | "delete";

type DanglingLink = {
  path: string;
  target: string;
  resolved: string;
};

function parseArgs(argv: string[]): { mode: Mode; help: boolean } {
  let mode: Mode = "dry-run";
  let help = false;
  for (const arg of argv) {
    if (arg === "--delete") mode = "delete";
    else if (arg === "--dry-run" || arg === "-n") mode = "dry-run";
    else if (arg === "--help" || arg === "-h") help = true;
    else {
      console.error(`unknown argument: ${arg}`);
      process.exit(2);
    }
  }
  return { mode, help };
}

async function isDirectory(path: string): Promise<boolean> {
  try {
    const st = await lstat(path);
    if (st.isDirectory()) return true;
    if (!st.isSymbolicLink()) return false;
    const target = resolve(dirname(path), await readlink(path));
    const targetSt = await lstat(target).catch(() => null);
    return targetSt?.isDirectory() ?? false;
  } catch {
    return false;
  }
}

async function collectSkillDirs(home: string): Promise<string[]> {
  const found = new Set<string>();

  const top = await readdir(home, { withFileTypes: true });
  for (const ent of top) {
    if (!ent.name.startsWith(".")) continue;
    if (SKIP_HOME_DIRS[ent.name]) continue;
    if (!ent.isDirectory() && !ent.isSymbolicLink()) continue;

    const base = join(home, ent.name);
    const skills = join(base, "skills");
    if (await isDirectory(skills)) found.add(skills);

    let children;
    try {
      children = await readdir(base, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const child of children) {
      if (!child.isDirectory() && !child.isSymbolicLink()) continue;
      const nested = join(base, child.name, "skills");
      if (await isDirectory(nested)) found.add(nested);
    }
  }

  return [...found].sort();
}

async function listEntries(dir: string): Promise<string[]> {
  const { stdout, exitCode } = await $`ls ${dir}`.nothrow().quiet();
  if (exitCode !== 0) return [];
  return stdout
    .toString()
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((name) => join(dir, name));
}

async function inspectLink(path: string): Promise<DanglingLink | null> {
  let st;
  try {
    st = await lstat(path);
  } catch {
    return null;
  }
  if (!st.isSymbolicLink()) return null;

  const target = await readlink(path);
  const resolved = resolve(dirname(path), target);
  if (
    !target.replaceAll("\\", "/").includes(".agents/skills") &&
    !resolved.replaceAll("\\", "/").includes("/.agents/skills/")
  ) {
    return null;
  }

  const targetSt = await lstat(resolved).catch(() => null);
  if (targetSt) return null;

  return { path, target, resolved };
}

async function unlink(path: string): Promise<void> {
  const { exitCode, stderr } = await $`rm ${path}`.nothrow().quiet();
  if (exitCode !== 0) {
    throw new Error(stderr.toString().trim() || `rm failed: ${path}`);
  }
}

async function main(): Promise<void> {
  const { mode, help } = parseArgs(process.argv.slice(2));
  if (help) {
    await $`echo ${`Usage: bun scripts/clean-dangling-skill-symlinks.ts [--dry-run|-n] [--delete]

Search agent skill directories for dangling bunx-skills symlinks
(target under .agents/skills, and that target does not exist).

  --dry-run, -n   print matches only (default)
  --delete        unlink matches with bun shell rm
  --help, -h      show this help
`}`;
    return;
  }

  const home = homedir();
  const dirs = await collectSkillDirs(home);
  const matches: DanglingLink[] = [];

  for (const dir of dirs) {
    for (const entry of await listEntries(dir)) {
      const hit = await inspectLink(entry);
      if (hit) matches.push(hit);
    }
  }

  if (matches.length === 0) {
    await $`echo ${"No dangling bunx-skills symlinks found."}`;
    return;
  }

  const verb = mode === "delete" ? "Removing" : "Would remove";
  await $`echo ${`${verb} ${matches.length} dangling symlink(s):`}`;

  for (const hit of matches) {
    await $`echo ${`  ${hit.path} -> ${hit.target}`}`;
    if (mode === "delete") await unlink(hit.path);
  }

  if (mode === "dry-run") {
    await $`echo ${"\nDry-run only. Re-run with --delete to unlink."}`;
  } else {
    await $`echo ${`\nRemoved ${matches.length} symlink(s).`}`;
  }
}

await main();
