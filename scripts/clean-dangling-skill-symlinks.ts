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
 * lstat errors other than ENOENT fail closed (the link is not removed).
 *
 *   bun scripts/clean-dangling-skill-symlinks.ts
 *   bun scripts/clean-dangling-skill-symlinks.ts --delete
 *   bun scripts/clean-dangling-skill-symlinks.ts --root /path --delete
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
  kind: "dangling";
  path: string;
  target: string;
  resolved: string;
};

type InspectResult =
  | DanglingLink
  | { kind: "skip" }
  | { kind: "blocked"; path: string; reason: string };

function errnoCode(err: unknown): string | undefined {
  if (typeof err === "object" && err !== null && "code" in err && typeof err.code === "string") {
    return err.code;
  }
}

function parseArgs(argv: string[]): { mode: Mode; help: boolean; root: string } {
  let mode: Mode = "dry-run";
  let help = false;
  let root = homedir();
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--delete") mode = "delete";
    else if (arg === "--dry-run" || arg === "-n") mode = "dry-run";
    else if (arg === "--help" || arg === "-h") help = true;
    else if (arg === "--root") {
      const value = argv[++i];
      if (!value) {
        console.error("--root requires a directory");
        process.exit(2);
      }
      root = value;
    } else {
      console.error(`unknown argument: ${arg}`);
      process.exit(2);
    }
  }
  return { mode, help, root };
}

async function isDirectory(path: string): Promise<boolean> {
  try {
    const st = await lstat(path);
    if (st.isDirectory()) return true;
    if (!st.isSymbolicLink()) return false;
    const target = resolve(dirname(path), await readlink(path));
    try {
      return (await lstat(target)).isDirectory();
    } catch {
      return false;
    }
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

async function inspectLink(path: string): Promise<InspectResult> {
  let st;
  try {
    st = await lstat(path);
  } catch (err) {
    if (errnoCode(err) === "ENOENT") return { kind: "skip" };
    return { kind: "blocked", path, reason: `cannot lstat link: ${String(err)}` };
  }
  if (!st.isSymbolicLink()) return { kind: "skip" };

  let target: string;
  try {
    target = await readlink(path);
  } catch (err) {
    return { kind: "blocked", path, reason: `cannot read link: ${String(err)}` };
  }

  const resolved = resolve(dirname(path), target);
  if (
    !target.replaceAll("\\", "/").includes(".agents/skills") &&
    !resolved.replaceAll("\\", "/").includes("/.agents/skills/")
  ) {
    return { kind: "skip" };
  }

  try {
    await lstat(resolved);
    return { kind: "skip" };
  } catch (err) {
    if (errnoCode(err) === "ENOENT") return { kind: "dangling", path, target, resolved };
    const code = errnoCode(err) ?? "unknown";
    return {
      kind: "blocked",
      path,
      reason: `cannot confirm target is absent (${code}): ${resolved}`,
    };
  }
}

async function unlink(path: string): Promise<void> {
  const { exitCode, stderr } = await $`rm ${path}`.nothrow().quiet();
  if (exitCode !== 0) {
    throw new Error(stderr.toString().trim() || `rm failed: ${path}`);
  }
}

async function main(): Promise<void> {
  const { mode, help, root } = parseArgs(process.argv.slice(2));
  if (help) {
    await $`echo ${`Usage: bun scripts/clean-dangling-skill-symlinks.ts [--dry-run|-n] [--delete] [--root <dir>]

Search agent skill directories for dangling bunx-skills symlinks
(target under .agents/skills, and that target does not exist).

  --dry-run, -n     print matches only (default)
  --delete          unlink matches with bun shell rm
  --root <dir>      scan this directory instead of the home directory
  --help, -h        show this help
`}`;
    return;
  }

  const dirs = await collectSkillDirs(root);
  const matches: DanglingLink[] = [];
  const blocked: { path: string; reason: string }[] = [];

  for (const dir of dirs) {
    for (const entry of await listEntries(dir)) {
      const result = await inspectLink(entry);
      if (result.kind === "dangling") matches.push(result);
      else if (result.kind === "blocked") blocked.push(result);
    }
  }

  for (const item of blocked) {
    console.error(`blocked: ${item.path}: ${item.reason}`);
  }

  if (matches.length === 0) {
    await $`echo ${"No dangling bunx-skills symlinks found."}`;
    if (blocked.length > 0) process.exit(1);
    return;
  }

  const verb = mode === "delete" ? "Removing" : "Would remove";
  await $`echo ${`${verb} ${matches.length} dangling symlink(s):`}`;

  let removed = 0;
  for (const hit of matches) {
    if (mode === "dry-run") {
      await $`echo ${`  ${hit.path} -> ${hit.target}`}`;
      continue;
    }

    const again = await inspectLink(hit.path);
    if (again.kind !== "dangling") {
      if (again.kind === "blocked") {
        console.error(`blocked before unlink: ${again.path}: ${again.reason}`);
        blocked.push(again);
      } else {
        console.error(`skipped before unlink (no longer dangling): ${hit.path}`);
      }
      continue;
    }

    await $`echo ${`  ${again.path} -> ${again.target}`}`;
    await unlink(again.path);
    removed++;
  }

  if (mode === "dry-run") {
    await $`echo ${"\nDry-run only. Re-run with --delete to unlink."}`;
  } else {
    await $`echo ${`\nRemoved ${removed} symlink(s).`}`;
  }

  if (blocked.length > 0) process.exit(1);
}

await main();
