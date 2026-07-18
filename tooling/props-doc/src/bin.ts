#!/usr/bin/env node
/**
 * `moderno-props-doc [outDir]` — emit `<outDir>/<component>.json` for every
 * documented component, resolved from the canonical `@moderno/react` types.
 *
 * Props are identical across the framework bindings by contract (they share the
 * `@moderno/core` recipes), so React is the single source of truth. The docs
 * `<PropsTable>` imports the emitted JSON; the build runs this before Astro.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { extractProps } from "./index.ts";
import { ENTRIES } from "./manifest.ts";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../..");

const REACT_TSCONFIG = join(repoRoot, "packages/react/tsconfig.json");

function main(): number {
  const outDir = resolve(process.argv[2] ?? join(repoRoot, "apps/docs/src/generated/props"));
  mkdirSync(outDir, { recursive: true });

  const docs = extractProps({ tsConfigFilePath: REACT_TSCONFIG, entries: ENTRIES });
  for (const doc of docs) {
    const file = join(outDir, `${doc.name}.json`);
    writeFileSync(file, JSON.stringify(doc, null, 2) + "\n");
    console.log(`✓ ${doc.name}.json (${doc.props.length} props)`);
  }
  return 0;
}

process.exit(main());
