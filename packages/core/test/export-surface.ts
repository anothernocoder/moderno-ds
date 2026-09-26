/**
 * Shared suite for the framework packages' export-surface tests (ADR-0009).
 *
 * A package's public API is its barrel, which `pnpm gen` writes from one export
 * fragment per component (`src/exports/<slug>.ts`). The API is pinned one
 * component at a time: each fragment has a committed snapshot,
 * `test/export-surface/<slug>.txt`, listing its runtime values
 * (`Object.keys(await import(fragment))`) and its type-only exports (the names
 * TypeScript sees that are not values — what the `.d.ts` adds). The barrel must
 * export exactly the union of its fragments, so a name two fragments export
 * (which `export *` silently drops) fails here.
 *
 * A new component adds a fragment and its snapshot; it edits no shared list.
 * Run `vitest -u` to write the snapshot of a new or changed fragment.
 */
import { existsSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vitest";

interface ExportSurface {
  values: string[];
  types: string[];
}

/**
 * Registers the export-surface tests of the package whose barrel is
 * `barrelUrl` (e.g. `new URL("../src/index.ts", import.meta.url)`).
 */
export function describeExportSurface(packageName: string, barrelUrl: URL): void {
  const barrel = fileURLToPath(barrelUrl);
  const exportsDir = fileURLToPath(new URL("exports/", barrelUrl));
  const snapshotDir = fileURLToPath(new URL("../test/export-surface/", barrelUrl));
  const fragments = readdirSync(exportsDir)
    .filter((file) => file.endsWith(".ts") && !file.startsWith("_"))
    .sort()
    .map((file) => ({ slug: basename(file, ".ts"), path: join(exportsDir, file) }));
  const declared = declaredExportNames([barrel, ...fragments.map(({ path }) => path)]);

  const surfaceOf = async (path: string): Promise<ExportSurface> => {
    const values = Object.keys(await import(/* @vite-ignore */ path)).sort();
    const types = (declared.get(path) ?? []).filter((name) => !values.includes(name));
    return { values, types };
  };

  // The first import compiles the package's components cold (every Svelte
  // component, for the Svelte package), which exceeds the 5s default under the
  // full parallel run. A ceiling, not a target.
  describe(`${packageName} export surface`, { timeout: 30_000 }, () => {
    it.each(fragments)("the $slug fragment exports what its snapshot lists", async (fragment) => {
      const surface = await surfaceOf(fragment.path);
      await expect(formatSurface(surface)).toMatchFileSnapshot(
        join(snapshotDir, `${fragment.slug}.txt`),
      );
    });

    it("the barrel exports every fragment's names and nothing else", async () => {
      const union: ExportSurface = { values: [], types: [] };
      for (const fragment of fragments) {
        const { values, types } = await surfaceOf(fragment.path);
        union.values.push(...values);
        union.types.push(...types);
      }
      union.values.sort();
      union.types.sort();
      expect(await surfaceOf(barrel)).toEqual(union);
    });

    // A fragment without a snapshot fails above (in CI, where vitest writes no
    // new snapshot); this catches the reverse, a component removed from the
    // package whose pinned surface would otherwise linger unchecked.
    it("every snapshot belongs to a fragment", () => {
      const slugs = new Set(fragments.map(({ slug }) => slug));
      const snapshots = existsSync(snapshotDir) ? readdirSync(snapshotDir) : [];
      const orphans = snapshots.filter((file) => !slugs.has(basename(file, ".txt")));
      expect(orphans).toEqual([]);
    });
  });
}

/**
 * Every name each file exports, values and types, sorted — as the TypeScript
 * checker resolves them (following the barrel's `export *` into the fragments).
 */
function declaredExportNames(files: string[]): Map<string, string[]> {
  const program = ts.createProgram(files, {
    noEmit: true,
    skipLibCheck: true,
    types: [],
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.Preserve,
  });
  const checker = program.getTypeChecker();
  return new Map(
    files.map((file) => {
      const source = program.getSourceFile(file);
      const module = source && checker.getSymbolAtLocation(source);
      if (!module) throw new Error(`${file} is not a module`);
      const names = checker.getExportsOfModule(module).map((symbol) => symbol.name);
      return [file, names.sort()];
    }),
  );
}

/** One `value <name>` or `type <name>` line per export, values first. */
function formatSurface({ values, types }: ExportSurface): string {
  const lines = [...values.map((name) => `value ${name}`), ...types.map((name) => `type ${name}`)];
  return `${lines.join("\n")}\n`;
}
