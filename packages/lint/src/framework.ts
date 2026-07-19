/**
 * Best-effort `Framework` guess from a file's extension, for callers that
 * don't pass one explicitly (the ESLint rule's `framework` option, the CLI's
 * `--framework` flag). `.tsx`/`.jsx` default to `react` — Solid also authors
 * in `.tsx`, so a Solid consumer must override explicitly; there's no
 * extension-only way to tell the two apart.
 */
import type { Framework } from "@moderno/lint-core";

export const FRAMEWORKS: Framework[] = ["react", "vue", "svelte", "solid", "astro"];

const EXTENSION_FRAMEWORK: Record<string, Framework> = {
  ".vue": "vue",
  ".svelte": "svelte",
  ".astro": "astro",
};

export function frameworkFromFilename(filename: string): Framework {
  const ext = filename.slice(filename.lastIndexOf("."));
  return EXTENSION_FRAMEWORK[ext] ?? "react";
}
