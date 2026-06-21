#!/usr/bin/env node
/**
 * CI guard — fail the build if any docs slug lacks a translation. Scans the
 * content dir for `*.{md,mdx}`, derives `<locale>/<slug>` ids, and runs the
 * pure `checkParity`. Exits non-zero (and lists the gaps) so a missing es/en
 * pair can never reach production.
 */
import { readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkParity } from "../src/i18n/parity.ts";

const here = resolve(fileURLToPath(import.meta.url), "..");
const contentDir = resolve(here, "../src/content/docs");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.mdx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

const ids = walk(contentDir).map((f) => relative(contentDir, f).replace(/\.mdx?$/, ""));
const result = checkParity(ids);

if (!result.ok) {
  console.error("✗ docs slug parity broken — every page must exist in en and es:");
  for (const { locale, slug } of result.missing) {
    console.error(`  missing ${locale}/${slug}`);
  }
  process.exit(1);
}

console.log(`✓ slug parity: ${ids.length} pages, all locales present`);
