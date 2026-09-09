#!/usr/bin/env node
/**
 * Docs `prebuild` step: compile the Tailwind utilities the previews need into
 * `src/generated/tailwind.css`, which `BaseLayout.astro` imports.
 *
 * Generated, not committed (`src/generated/` is gitignored) — the file is a
 * function of the sources below plus `@moderno-ui/tokens/preset`, and a stale
 * committed copy would silently drop a utility a block started using.
 */
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDocsTailwind } from "./tailwind.ts";

const here = resolve(fileURLToPath(import.meta.url), "..");
const repoRoot = resolve(here, "../../..");

/**
 * Where a Tailwind class can legitimately appear: the registry blocks, screens
 * and flows (the design system's only Tailwind surface) and the docs markup
 * that mounts them.
 */
const SOURCE_DIRS = [
  resolve(repoRoot, "registry/blocks"),
  resolve(repoRoot, "registry/screens"),
  resolve(repoRoot, "registry/flows"),
  resolve(here, "../src/islands"),
  resolve(here, "../src/components"),
  resolve(here, "../src/layouts"),
  resolve(here, "../src/pages"),
];

const SOURCE_EXTENSIONS = /\.(astro|svelte|vue|tsx|jsx|mdx)$/;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (SOURCE_EXTENSIONS.test(entry.name)) out.push(full);
  }
  return out;
}

const sources = SOURCE_DIRS.flatMap(walk);
const css = await buildDocsTailwind(sources);

const outDir = resolve(here, "../src/generated");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "tailwind.css"), css);

console.log(`✓ tailwind: ${sources.length} sources → src/generated/tailwind.css`);
