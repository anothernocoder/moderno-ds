/**
 * Non-pixel guards over the built docs.
 *
 * "Did the new page actually reach the navigation, in the right place?" is the
 * kind of question the docs build can get wrong silently. These assertions ask
 * it in text rather than pixels — which means they commit no artifact and can
 * never conflict between parallel branches.
 *
 * They read `dist/`, which the suite already requires.
 */
import { readdirSync, readFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { allPages, distDir, previewPages } from "./pages.ts";

const srcDir = resolve(fileURLToPath(import.meta.url), "../../../src");
const LOCALES = ["en", "es"] as const;

interface SidebarRow {
  href: string;
  current: boolean;
}

/** The sidebar's rows, in document order, from a built page's HTML. */
function sidebarRows(html: string): SidebarRow[] {
  const aside = /<aside class="sidebar"[\s\S]*?<\/aside>/.exec(html)?.[0];
  if (!aside) return [];
  return [...aside.matchAll(/<a\s([^>]*)>/g)].map((m) => ({
    href: /href="([^"]*)"/.exec(m[1])?.[1] ?? "",
    current: m[1].includes('aria-current="page"'),
  }));
}

/** Slugs of a locale's docs pages, from the content collection's files. */
function contentSlugs(locale: string): string[] {
  return readdirSync(resolve(srcDir, "content/docs", locale))
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => f.replace(/\.mdx?$/, ""))
    .filter((slug) => slug !== "index")
    .sort();
}

test.describe("built docs", () => {
  // Pure text assertions over the build: nothing here touches the rendered
  // page, only the HTML the build emitted and the sources it came from.

  for (const locale of LOCALES) {
    test(`sidebar lists every ${locale} docs page`, () => {
      const expected = contentSlugs(locale)
        .map((slug) => `/${locale}/${slug}`)
        .sort();
      expect(expected.length, `no ${locale} content pages found`).toBeGreaterThan(0);

      const pages = allPages().filter((p) => p.path.startsWith(`/${locale}/`));
      expect(pages.length, `no built ${locale} pages found`).toBeGreaterThan(0);

      let reference: string[] | undefined;
      for (const page of pages) {
        const rows = sidebarRows(readFileSync(page.file, "utf8"));
        expect(
          [...rows.map((r) => r.href)].sort(),
          `${page.path} sidebar does not list exactly the ${locale} docs pages`,
        ).toEqual(expected);

        // Every page of a locale renders the same list in the same order, so a
        // stray `order` on one page cannot reshuffle the nav for that page only.
        const order = rows.map((r) => r.href);
        reference ??= order;
        expect(order, `${page.path} orders the sidebar differently`).toEqual(reference);

        // The current page's own row is the one per-page state the sidebar has.
        const self = page.path.replace(/\/$/, "");
        const current = rows.filter((r) => r.current).map((r) => r.href);
        expect(current, `${page.path} marks the wrong sidebar row as current`).toEqual(
          expected.includes(self) ? [self] : [],
        );
      }
    });
  }

  test("every island is on a preview page", () => {
    // `pages.ts` derives its list from `<astro-island` markers in `dist/`, so a
    // demo whose page fails to hydrate drops out of the seam without a single
    // red test. Astro names the island bundle after its source file, which is
    // enough to tie the two ends together — including a component-page's
    // Example (CONTEXT.md "Example"), the file under `src/examples/**` that
    // both the docs show and the live demo mounts; each is named after its
    // component (`button/button.svelte`), never the generic `svelte.svelte`,
    // precisely so this basename-matching stays one-to-one.
    //
    // A `.svelte` file another island imports (`DemoTabs.svelte`, the tab
    // chrome the screen and Pricing demos share) is bundled into its parent's
    // chunk and never hydrates on its own, so it has no `component-url` to find;
    // it is covered through the island that mounts it.
    const islandDirs = ["islands", "examples"];
    const files = islandDirs.flatMap((dir) =>
      (readdirSync(resolve(srcDir, dir), { recursive: true }) as string[])
        .filter((f) => f.endsWith(".svelte"))
        .map((f) => resolve(srcDir, dir, f)),
    );
    const children = new Set(
      files.flatMap((file) =>
        [...readFileSync(file, "utf8").matchAll(/from\s+["'](\.{1,2}\/[^"']+\.svelte)["']/g)].map(
          (m) => resolve(dirname(file), m[1]!),
        ),
      ),
    );
    const islands = files
      .filter((f) => !children.has(f))
      .map((f) => basename(f, ".svelte"))
      .sort();
    expect(islands.length, "no islands found").toBeGreaterThan(0);

    const rendered = previewPages()
      .map((p) => readFileSync(p.file, "utf8"))
      .join("\n");
    const missing = islands.filter(
      (name) => !new RegExp(`component-url="[^"]*/${name}\\.[^"]*"`).test(rendered),
    );
    expect(missing, "islands that no preview page hydrates").toEqual([]);
  });

  test("the registry deploy serves registry.json, not the item.json it is generated from", () => {
    // `pnpm gen` expands each unit's `item.json` into `registry.json`; the CLI
    // reads only the latter, so the copy to `/r/` leaves the sources behind.
    const published = readdirSync(resolve(distDir, "r"), { recursive: true }) as string[];
    expect(published, "/r/ has no registry.json").toContain("registry.json");
    expect(published.filter((path) => basename(path) === "item.json")).toEqual([]);
  });
});
