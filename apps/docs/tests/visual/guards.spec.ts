/**
 * Non-pixel guards over the built docs.
 *
 * The per-page baselines no longer render the sidebar and the chrome baseline
 * renders a *fixture* sidebar, so nothing in the pixel seam can still answer
 * "did the new page actually reach the navigation, in the right place?". These
 * assertions do, in text rather than pixels — which also means they commit no
 * artifact and can never conflict between parallel branches.
 *
 * They read `dist/`, which the suite already requires, and run under a single
 * project because none of them depends on the width or the colour scheme.
 */
import { readdirSync, readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { allPages, previewPages } from "./pages.ts";

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
  // Pure text assertions over the build: nothing here depends on the width or
  // the colour scheme, so one project runs them and the other five skip rather
  // than reporting the same failure six times.
  test.beforeEach((_fixtures, testInfo) => {
    test.skip(testInfo.project.name !== "1280-light", "width- and scheme-independent");
  });

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

  test("every island is on a captured page", () => {
    // `pages.ts` derives the matrix from `<astro-island` markers in `dist/`, so
    // a demo whose page fails to hydrate drops out of the seam without a single
    // red test. Astro names the island bundle after its source file, which is
    // enough to tie the two ends together.
    const islands = readdirSync(resolve(srcDir, "islands"))
      .filter((f) => f.endsWith(".svelte"))
      .map((f) => basename(f, ".svelte"))
      .sort();
    expect(islands.length, "no islands found").toBeGreaterThan(0);

    const captured = previewPages()
      .map((p) => readFileSync(p.file, "utf8"))
      .join("\n");
    const missing = islands.filter(
      (name) => !new RegExp(`component-url="[^"]*/${name}\\.[^"]*"`).test(captured),
    );
    expect(missing, "islands that no captured page hydrates").toEqual([]);
  });
});
