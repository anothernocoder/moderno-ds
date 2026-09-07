/**
 * The preview pages the visual suite captures, read from the *build* rather
 * than hand-maintained.
 *
 * A **preview page** is a built docs page that hydrates at least one island —
 * the pages where the design system renders for real (the live `<Preview>`
 * demos and the Theme Builder). Prose pages carry only code blocks and prop
 * tables, so a pixel baseline for them would cost repo weight without watching
 * a single primitive.
 *
 * Deriving the list from `dist/` is what makes the seam self-extending: the
 * docs page for a new primitive or block joins the matrix the moment it is
 * built, and shows up as a missing baseline until someone updates them.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const distDir = resolve(fileURLToPath(import.meta.url), "../../../dist");

export interface DocsPage {
  /** URL path to visit, e.g. `/en/button/`. */
  path: string;
  /** Snapshot-safe name, e.g. `en-button`. */
  name: string;
  /** Absolute path to the built `index.html`, for non-pixel guards. */
  file: string;
}

/** Astro's marker for a hydrated component — one per live demo on the page. */
const ISLAND_MARKER = "<astro-island";

function* indexFiles(dir: string, prefix = ""): Generator<{ file: string; urlPath: string }> {
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    // Pagefind's bundle is a build artifact of the search index, not a page.
    if (entry.isDirectory() && entry.name !== "pagefind") {
      yield* indexFiles(join(dir, entry.name), `${prefix}/${entry.name}`);
    } else if (entry.isFile() && entry.name === "index.html") {
      yield { file: join(dir, entry.name), urlPath: `${prefix}/` };
    }
  }
}

function toPage({ file, urlPath }: { file: string; urlPath: string }): DocsPage {
  return {
    path: urlPath,
    name: urlPath.replace(/^\/|\/$/g, "").replace(/\//g, "-") || "index",
    file,
  };
}

/**
 * Every built page, sorted by URL. Superset of `previewPages()` — the non-pixel
 * guards in `guards.spec.ts` walk this, since a prose page can regress in ways
 * that have nothing to do with an island.
 */
export function allPages(dir: string = distDir): DocsPage[] {
  return [...indexFiles(dir)].map(toPage);
}

/**
 * Every built preview page, sorted by URL so the suite's test order — and the
 * baseline filenames — stay stable across machines.
 */
export function previewPages(dir: string = distDir): DocsPage[] {
  return [...indexFiles(dir)]
    .filter(({ file }) => readFileSync(file, "utf8").includes(ISLAND_MARKER))
    .map(toPage);
}
