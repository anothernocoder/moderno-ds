/**
 * Best-effort `Framework` guess for callers that don't pass one explicitly
 * (the ESLint rule's `framework` option, the CLI's `--framework` flag).
 *
 * Two guesses, weakest last. A path segment naming a framework is decisive —
 * registry sources are laid out `blocks/<name>/<framework>/<file>`, which is
 * the only signal that separates Solid from React (both author in `.tsx`).
 * Failing that, the extension decides, and `.tsx`/`.jsx` fall back to react.
 */
import type { Framework } from "@moderno-ui/lint-core";

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

/**
 * As `frameworkFromFilename`, but reads a framework-named directory segment
 * first: `blocks/pricing/solid/pricing.tsx` is Solid, not React.
 */
export function frameworkFromPath(path: string): Framework {
  const segments = path.split(/[\\/]/).slice(0, -1);
  for (let i = segments.length - 1; i >= 0; i--) {
    const match = FRAMEWORKS.find((f) => f === segments[i]);
    if (match) return match;
  }
  return frameworkFromFilename(path);
}
