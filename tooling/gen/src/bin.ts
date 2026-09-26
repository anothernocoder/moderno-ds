#!/usr/bin/env node
/**
 * `pnpm gen` — write every generated file from the aggregators in
 * `src/aggregators/` (ADR-0009).
 *
 * `pnpm gen --check` writes nothing: it exits non-zero and lists every
 * committed generated file that is missing, stale, or edited by hand. CI runs
 * it before the build.
 */
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  discoverAggregators,
  findStaleFiles,
  renderGeneratedFiles,
  writeGeneratedFiles,
} from "./gen.ts";

const here = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(here, "../../..");
const AGGREGATORS_DIR = join(here, "aggregators");

async function main(args: string[]): Promise<number> {
  const unknown = args.filter((arg) => arg !== "--check");
  if (unknown.length > 0) {
    console.error(`pnpm gen: unknown argument ${unknown.join(" ")} (only --check is accepted)`);
    return 1;
  }

  const aggregators = await discoverAggregators(AGGREGATORS_DIR);
  const files = await renderGeneratedFiles(aggregators, REPO_ROOT);

  if (args.includes("--check")) {
    const stale = findStaleFiles(files, REPO_ROOT);
    if (stale.length > 0) {
      console.error("✗ generated files are stale or edited by hand:");
      for (const path of stale) console.error(`  ${path}`);
      console.error("run `pnpm gen` and commit the result");
      return 1;
    }
    console.log(`✓ every generated file is current (${files.length})`);
    return 0;
  }

  writeGeneratedFiles(files, REPO_ROOT);
  for (const file of files) console.log(`✓ ${file.path}`);
  return 0;
}

process.exit(await main(process.argv.slice(2)));
