#!/usr/bin/env node
/**
 * `pnpm qa:shots <pr> <dir>` — replace the `qa-shots` branch with the screenshots
 * in `<dir>/<group>/*.png` and show them in the description of PR `<pr>`.
 *
 * The branch is one commit, force-pushed, so old screenshots leave the repo. No
 * workflow runs on it. A PR's images stop loading after a later run replaces them.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { renderGallery, withGallery } from "./gallery.ts";

const BRANCH = "qa-shots";

function run(command: string, args: string[], env?: NodeJS.ProcessEnv): string {
  return execFileSync(command, args, {
    encoding: "utf8",
    env: { ...process.env, ...env },
  }).trim();
}

function shotsIn(dir: string): Record<string, string[]> {
  const groups = readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  return Object.fromEntries(
    groups.map(({ name }) => [
      name,
      readdirSync(join(dir, name))
        .filter((file) => file.endsWith(".png"))
        .sort(),
    ]),
  );
}

/** Commits `dir` with a temporary index, so the checkout is left alone, and returns the commit. */
function commitShots(dir: string, pr: string): string {
  const index = { GIT_INDEX_FILE: join(mkdtempSync(join(tmpdir(), "qa-shots-")), "index") };
  run("git", [`--work-tree=${dirname(dir)}`, "add", "--force", basename(dir)], index);
  const tree = run("git", ["write-tree"], index);
  return run("git", ["commit-tree", tree, "-m", `QA screenshots of PR #${pr}`]);
}

const [pr, dirArgument] = process.argv.slice(2);
if (!pr || !dirArgument) {
  console.error("Usage: pnpm qa:shots <pr> <dir>");
  process.exit(1);
}
const dir = resolve(dirArgument);
const commit = commitShots(dir, pr);
run("git", ["push", "--force", "origin", `${commit}:refs/heads/${BRANCH}`]);

const repo = run("gh", ["repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner"]);
const gallery = renderGallery(
  shotsIn(dir),
  (group, file) =>
    `https://raw.githubusercontent.com/${repo}/${commit}/${basename(dir)}/${group}/${file}`,
);
const body = run("gh", ["pr", "view", pr, "--json", "body", "--jq", ".body"]);
run("gh", [
  "api",
  "--method",
  "PATCH",
  `repos/${repo}/pulls/${pr}`,
  "-f",
  `body=${withGallery(body, gallery)}`,
  "--silent",
]);
console.log(`PR #${pr}: screenshots from ${commit} on ${BRANCH}.`);
