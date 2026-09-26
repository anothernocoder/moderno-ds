/**
 * The tier index pages (Blocks, Screens, Flows) list the other pages of their
 * own sidebar group, rendered by `<TierIndex />` from frontmatter. What each
 * page should list is read from the same frontmatter here, so a new block,
 * screen or flow page raises the expected count without touching this spec.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const contentDir = fileURLToPath(new URL("../../src/content/docs", import.meta.url));

interface Page {
  slug: string;
  title: string;
  group: string;
}

/** One locale's pages, from the frontmatter fields the list is built from. */
function pagesOf(locale: string): Page[] {
  const dir = join(contentDir, locale);
  return readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const frontmatter = /^---\n([\s\S]*?)\n---/.exec(readFileSync(join(dir, file), "utf8"))?.[1];
      const field = (name: string) =>
        new RegExp(`^${name}:\\s*(.+)$`, "m").exec(frontmatter ?? "")?.[1]?.trim() ?? "";
      return { slug: file.replace(/\.mdx$/, ""), title: field("title"), group: field("group") };
    });
}

for (const locale of ["en", "es"]) {
  for (const tier of ["blocks", "screens", "flows"]) {
    test(`${locale}/${tier} lists every other page of its group`, async ({ page }) => {
      const pages = pagesOf(locale);
      const group = pages.find((p) => p.slug === tier)!.group;
      const expected = pages.filter((p) => p.group === group && p.slug !== tier);
      expect(expected.length).toBeGreaterThan(0);

      await page.goto(`/${locale}/${tier}/`);
      const links = page.locator("main .tier-index li > a");
      await expect(links).toHaveCount(expected.length);
      const listed = await links.evaluateAll((anchors) =>
        anchors.map((a) => `${a.textContent?.trim()} ${a.getAttribute("href")}`),
      );
      expect(listed.sort()).toEqual(
        expected.map(({ slug, title }) => `${title} /${locale}/${slug}/`).sort(),
      );
    });
  }
}
