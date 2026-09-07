#!/usr/bin/env node
/**
 * Refresh the committed visual baselines from CI.
 *
 * Screenshots are only reproducible inside the environment that produced them,
 * so the baselines this repo commits are the ones the CI container renders —
 * never the maintainer's laptop. Rather than asking a macOS user to reproduce a
 * Linux container by hand, this script dispatches the `visual-baselines`
 * workflow on the current branch, waits for it, and drops the artifact into
 * `tests/visual/__screenshots__/linux/` ready to review with `git diff` and
 * commit.
 *
 * Run it after any deliberate visual change:  pnpm docs:visual:update
 *
 * For a local, throwaway comparison instead, run `pnpm docs:visual
 * --update-snapshots`: that writes a `darwin/` (or `win32/`) directory which
 * `.gitignore` drops, so it can never be mistaken for what CI compares against.
 */
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const WORKFLOW = "visual-baselines.yml";
const ARTIFACT = "visual-baselines";
const POLL_MS = 10_000;
const TIMEOUT_MS = 30 * 60_000;

const here = resolve(fileURLToPath(import.meta.url), "..");
const baselines = resolve(here, "../tests/visual/__screenshots__/linux");

function run(cmd: string, args: string[]): string {
  return execFileSync(cmd, args, { encoding: "utf8" }).trim();
}

function fail(message: string): never {
  console.error(`✖ ${message}`);
  process.exit(1);
}

interface Run {
  databaseId: number;
  status: string;
  conclusion: string | null;
}

function latestRun(branch: string): Run | undefined {
  const json = run("gh", [
    "run",
    "list",
    "--workflow",
    WORKFLOW,
    "--branch",
    branch,
    "--limit",
    "1",
    "--json",
    "databaseId,status,conclusion",
  ]);
  return (JSON.parse(json) as Run[])[0];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

try {
  run("gh", ["--version"]);
} catch {
  fail("the GitHub CLI (`gh`) is required — https://cli.github.com");
}

const branch = run("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
if (branch === "HEAD") fail("detached HEAD — check out the branch you want baselines for");

// The workflow runs the branch's own code, so unpushed commits would produce
// baselines for something else entirely.
try {
  run("git", ["rev-parse", "--verify", `origin/${branch}`]);
} catch {
  fail(`origin/${branch} does not exist — push the branch first`);
}
if (run("git", ["rev-parse", "HEAD"]) !== run("git", ["rev-parse", `origin/${branch}`])) {
  fail(`origin/${branch} is not at HEAD — push before regenerating baselines`);
}

const before = latestRun(branch)?.databaseId;
console.log(`→ dispatching ${WORKFLOW} on ${branch}`);
try {
  run("gh", ["workflow", "run", WORKFLOW, "--ref", branch]);
} catch {
  // GitHub only exposes `workflow_dispatch` for workflows that exist on the
  // default branch, whatever ref you point it at.
  fail(
    `could not dispatch ${WORKFLOW} — it must be merged into the default branch before it can be run from ${branch}. Until then, take the "visual-baselines" artifact from the failing CI run.`,
  );
}

const deadline = Date.now() + TIMEOUT_MS;
let current: Run | undefined;
while (Date.now() < deadline) {
  await sleep(POLL_MS);
  current = latestRun(branch);
  if (!current || current.databaseId === before) {
    console.log("… waiting for the run to be queued");
    continue;
  }
  if (current.status !== "completed") {
    console.log(`… run ${current.databaseId} is ${current.status}`);
    continue;
  }
  break;
}
if (!current || current.databaseId === before || current.status !== "completed") {
  fail(`timed out waiting for ${WORKFLOW} on ${branch}`);
}

// The workflow rewrites every baseline, so a non-zero conclusion is expected
// noise only if the artifact is missing — download decides.
const staging = mkdtempSync(join(tmpdir(), "moderno-baselines-"));
try {
  run("gh", ["run", "download", String(current.databaseId), "--name", ARTIFACT, "--dir", staging]);
} catch {
  rmSync(staging, { recursive: true, force: true });
  fail(
    `run ${current.databaseId} produced no "${ARTIFACT}" artifact (conclusion: ${current.conclusion}) — check the logs with \`gh run view ${current.databaseId}\``,
  );
}

// Replace rather than merge: a baseline whose page no longer exists must go.
if (existsSync(baselines)) rmSync(baselines, { recursive: true, force: true });
cpSync(staging, baselines, { recursive: true });
rmSync(staging, { recursive: true, force: true });

console.log(`✓ baselines from run ${current.databaseId} written to ${baselines}`);
console.log("  review with `git diff --stat` and commit them with the change that caused them.");
