/**
 * The preview pages of the built docs, read from the *build* rather than
 * hand-maintained.
 *
 * A **preview page** is a built docs page that hydrates at least one island —
 * the pages where the design system renders for real (the live `<Preview>`
 * demos and the Theme Builder). Prose pages carry only code blocks and prop
 * tables, so nothing in the suite has an opinion about them.
 *
 * Deriving the list from `dist/` is what makes the seam self-extending: the
 * docs page for a new primitive or block joins it the moment it is built.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const distDir = resolve(fileURLToPath(import.meta.url), "../../../dist");

export interface DocsPage {
  /** URL path to visit, e.g. `/en/button/`. */
  path: string;
  /** Absolute path to the built `index.html`. */
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
  return { path: urlPath, file };
}

/**
 * Every built page, sorted by URL. Superset of `previewPages()` — the guards in
 * `guards.spec.ts` walk this, since a prose page can regress in ways that have
 * nothing to do with an island.
 */
export function allPages(dir: string = distDir): DocsPage[] {
  return [...indexFiles(dir)].map(toPage);
}

/**
 * Every built preview page, sorted by URL so the suite's test order stays stable
 * across machines.
 */
export function previewPages(dir: string = distDir): DocsPage[] {
  return [...indexFiles(dir)]
    .filter(({ file }) => readFileSync(file, "utf8").includes(ISLAND_MARKER))
    .map(toPage);
}
