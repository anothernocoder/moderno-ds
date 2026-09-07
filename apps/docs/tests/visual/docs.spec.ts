/**
 * Visual regression seam: every built preview page, at three widths and both
 * colour schemes, compared pixel-for-pixel against a committed baseline.
 *
 * The docs are where every primitive, block and theme is rendered for real, so
 * a diff here is the cheapest signal that a token, a stylesheet or a component's
 * markup moved. The width × scheme matrix comes from `playwright.config.ts`
 * (one project per combination); this file only decides *what* is on screen and
 * *when* it has settled.
 */
import { expect, test } from "@playwright/test";
import { previewPages } from "./pages.ts";

const pages = previewPages();

test.describe("docs preview pages", () => {
  // A silently empty matrix would turn the whole seam green. It only happens
  // when `dist/` is missing or stale, which is worth failing loudly over.
  test("has pages to capture", () => {
    expect(pages.length).toBeGreaterThan(0);
  });

  test.beforeEach(async ({ page }, testInfo) => {
    // `BaseLayout` picks the scheme from localStorage first and only then from
    // `prefers-color-scheme`. Writing the key makes the capture independent of
    // that precedence, so a change to the fallback can't silently repaint every
    // baseline.
    const scheme = testInfo.project.use.colorScheme === "dark" ? "dark" : "light";
    await page.addInitScript((value) => {
      try {
        localStorage.setItem("moderno-scheme", value);
      } catch {
        /* storage disabled — `prefers-color-scheme` still applies */
      }
    }, scheme);
  });

  for (const doc of pages) {
    test(doc.name, async ({ page }) => {
      // `networkidle` covers the Pagefind UI bundle, which is imported lazily
      // and injects the search input — a late layout shift otherwise.
      await page.goto(doc.path, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(`${doc.name}.png`, { fullPage: true });
    });
  }
});
