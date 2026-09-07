/**
 * The site chrome, watched once per locale instead of once per page.
 *
 * `docs.spec.ts` collapses `<aside class="sidebar">` out of every per-page
 * capture, because it lists every page of the locale and therefore couples all
 * 84 baselines to the repo's page count. This is where that coverage comes
 * back: the real `BaseLayout` markup and the real `docs.css`, at the same six
 * width × scheme combinations, with only the *page-inventory-driven* content
 * swapped for a fixture. Twelve baselines whose subject is genuinely shared —
 * and, unlike the per-page ones, constant with respect to how many docs pages
 * exist.
 *
 * What that buys: `.sidebar-group h2`'s uppercase label, the row styling, the
 * `a[aria-current="page"]` current-row treatment, the `overflow-y: auto`
 * scroll box above 56rem versus the stacked static block below it, and the
 * 2rem grid gap between the sidebar and `<main>`.
 *
 * What it does *not* watch, deliberately: the plain `.layout` (no-TOC) variant,
 * since both anchors carry `h2` headings; and the locale index pages, which
 * `BaseLayout.astro` filters out of the sidebar so no row there is
 * `aria-current`. Another anchor costs six more baselines if that ever matters.
 */
import { expect, test } from "@playwright/test";
import { CHROME_ANCHORS, freezeChrome } from "./chrome.ts";
import { previewPages } from "./pages.ts";
import { settled } from "./settle.ts";

const captured = new Set(previewPages().map((p) => p.path));

test.describe("site chrome", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    const scheme = testInfo.project.use.colorScheme === "dark" ? "dark" : "light";
    await page.addInitScript((value) => {
      try {
        localStorage.setItem("moderno-scheme", value);
      } catch {
        /* storage disabled — `prefers-color-scheme` still applies */
      }
    }, scheme);
  });

  for (const anchor of CHROME_ANCHORS) {
    test(anchor.name, async ({ page }) => {
      // The anchor path is hardcoded, so a rename or a deletion would otherwise
      // silently delete all chrome coverage while CI stayed green: the capture
      // would 404, or land on a page that no longer renders what it claims to.
      expect(
        captured.has(anchor.path),
        `${anchor.path} is not a built preview page — pick another chrome anchor in chrome.ts`,
      ).toBe(true);

      await page.goto(anchor.path, { waitUntil: "networkidle" });
      // ORDER IS LOAD-BEARING, same as in `docs.spec.ts`: freezing the chrome
      // changes the page's height, so it has to happen before `settled` — which
      // then absorbs that reflow along with the island's.
      await page.evaluate(freezeChrome, anchor);
      await page.evaluate(() => document.fonts.ready.then(() => true));
      await settled(page);
      await expect(page).toHaveScreenshot(`${anchor.name}.png`, { fullPage: true });
    });
  }
});
