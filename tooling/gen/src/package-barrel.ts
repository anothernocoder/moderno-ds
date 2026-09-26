/**
 * The aggregator shape shared by the four framework barrels (ADR-0009).
 *
 * Each component lists what it adds to its package's public API in a fragment
 * of its own, `src/exports/<slug>.ts`, as explicit `export { … }` /
 * `export type { … }` lines. The barrel is the hand-kept header
 * (`src/exports/_header.ts`) followed by one `export *` per fragment, sorted by
 * slug, so adding a component adds a fragment and edits no barrel.
 */
import { readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import type { Aggregator } from "./aggregator.ts";

/** The file in `src/exports/` that opens the barrel; it is not a fragment. */
const BARREL_HEADER = "_header.ts";

/** A fragment is any `.ts` file in `src/exports/` except the `_`-prefixed header. */
function isExportFragment(file: string): boolean {
  return file.endsWith(".ts") && !file.startsWith("_");
}

/**
 * The aggregator that writes `<packageDir>/src/<barrelFile>` from the fragments
 * in `<packageDir>/src/exports/`.
 */
export function packageBarrel(packageDir: string, barrelFile: string): Aggregator {
  const exportsDir = `${packageDir}/src/exports`;
  return {
    output: `${packageDir}/src/${barrelFile}`,
    source: `${exportsDir}/*.ts`,
    generate: ({ root }) => {
      const header = readFileSync(join(root, exportsDir, BARREL_HEADER), "utf8");
      const reExports = readdirSync(join(root, exportsDir))
        .filter(isExportFragment)
        .sort()
        .map((file) => `export * from "./exports/${basename(file, ".ts")}.js";\n`);
      return `${header}\n${reExports.join("")}`;
    },
  };
}
