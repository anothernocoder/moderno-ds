/**
 * The site chrome, watched once per locale instead of once per page.
 *
 * `docs.spec.ts` collapses the layout's `<aside class="sidebar">` out of every
 * per-page capture, because it lists every page of the locale and therefore
 * couples all 84 baselines to the repo's page count. This is where that
 * coverage comes back: the real `BaseLayout` markup and the real `docs.css`, at
 * the same six width × scheme combinations, with only the *page-inventory-driven*
 * content swapped for a fixture. Twelve baselines whose subject is genuinely
 * shared — and, unlike the per-page ones, constant with respect to how many
 * docs pages exist.
 *
 * What the pixels buy: `.sidebar-group h2`'s uppercase label and the margins
 * that stack between consecutive sections, the row styling against the longest
 * label each locale actually ships (see `CHROME_ANCHORS`), the
 * `a[aria-current="page"]` current-row treatment, the sticky rail above 56rem
 * versus the stacked static block below it, and the 2rem grid gap between the
 * sidebar and `<main>`.
 *
 * What the pixels cannot buy, and what is asserted in geometry instead: the
 * `overflow-y: auto` scroll box. `docs.css` gives the sidebar
 * `height: calc(100vh - 6rem)` above 56rem — 804px at this suite's 900px
 * viewport — and neither this fixture (335px of rows) nor the real sidebar
 * (768px at 1280 with the repo's fifteen pages) fills it, so nothing is
 * clipped and deleting `overflow-y: auto` moves zero pixels here *and* on the
 * real site. Growing the fixture past 804px would buy the clip at the cost of
 * ~470px of stacked nav in the eight narrow baselines, for a property that is
 * inert in production until the page list outgrows the box. `sidebar box`
 * below asserts the box itself instead: same coverage, no image.
 *
 * What it does *not* watch, deliberately: the plain `.layout` (no-TOC) variant,
 * since both anchors carry `h2` headings; and the locale index pages, which
 * `BaseLayout.astro` filters out of the sidebar so no row there is
 * `aria-current`. Another anchor costs six more baselines if that ever matters.
 */
import { expect, test } from "@playwright/test";
import { CHROME_ANCHORS, CHROME_SECTIONS, SIDEBAR_SELECTOR, freezeChrome } from "./chrome.ts";
import { previewPages } from "./pages.ts";
import { settled } from "./settle.ts";

const captured = new Set(previewPages().map((p) => p.path));

/** The `max-width: 56rem` breakpoint, in px, where the sidebar stops sticking. */
const RESTACK_WIDTH = 896;

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
      const missing = await page.evaluate(freezeChrome, {
        anchor,
        sidebar: SIDEBAR_SELECTOR,
        sections: CHROME_SECTIONS,
      });

      // `freezeChrome` is all "replace it if it is still there" branches, so
      // without this it degrades into a no-op the day `BaseLayout.astro`
      // renames `#main` or `.toc-list`: the anchor page's own prose walks into
      // this baseline, the diff is accepted once as "the fixture changed", and
      // from then on every edit to `button.mdx` repaints twelve files — the
      // decoupling rotting silently on exactly the side that is supposed to be
      // page-independent.
      expect(
        missing,
        "freezeChrome could not find part of the chrome — BaseLayout.astro moved, see chrome.ts",
      ).toEqual([]);

      // ...and the same post-condition read back off the live page rather than
      // off what `freezeChrome` reports about itself.
      await expect(page.locator(`${SIDEBAR_SELECTOR} .sidebar-group`)).toHaveCount(
        anchor.sidebar.length,
      );
      await expect(page.locator(`${SIDEBAR_SELECTOR} a[aria-current="page"]`)).toHaveText(
        anchor.currentRow,
      );
      await expect(page.locator("#main > h1")).toHaveText(anchor.main.heading);
      await expect(page.locator(".toc-list > li a")).toHaveText([...CHROME_SECTIONS]);

      await page.evaluate(() => document.fonts.ready.then(() => true));
      await settled(page);
      await expect(page).toHaveScreenshot(`${anchor.name}.png`, { fullPage: true });
    });
  }

  // The half of the sidebar's own CSS no screenshot can see, because neither
  // the fixture nor the real page list overflows the box (see the file header).
  // One project is enough per width: the box is scheme-independent.
  test("sidebar box", async ({ page }, testInfo) => {
    test.skip(testInfo.project.use.colorScheme === "dark", "scheme-independent");
    const width = testInfo.project.use.viewport?.width ?? 0;
    const anchor = CHROME_ANCHORS[0];
    await page.goto(anchor.path, { waitUntil: "networkidle" });
    // On the fixture, not on the real sidebar: below the breakpoint the box is
    // `height: auto`, i.e. exactly its content, and the real content height is
    // a function of the page count — which would make "the box is not the
    // fixed 804px" an assertion that could flip on the day the docs happen to
    // have the wrong number of rows. The fixture cannot drift.
    await page.evaluate(freezeChrome, {
      anchor,
      sidebar: SIDEBAR_SELECTOR,
      sections: CHROME_SECTIONS,
    });

    const box = await page.evaluate((selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const style = getComputedStyle(el);
      return {
        position: style.position,
        overflowY: style.overflowY,
        // `height: calc(100vh - 6rem)` above the breakpoint, `auto` below it.
        // Compare against the formula rather than a literal so the assertion
        // survives a viewport change in `playwright.config.ts`.
        fixedHeight: Math.round(el.getBoundingClientRect().height) === window.innerHeight - 96,
      };
    }, SIDEBAR_SELECTOR);

    expect(
      box,
      `expected ${SIDEBAR_SELECTOR} to be the layout's scroll rail — docs.css changed, see chrome.ts`,
    ).toEqual(
      width > RESTACK_WIDTH
        ? { position: "sticky", overflowY: "auto", fixedHeight: true }
        : { position: "static", overflowY: "auto", fixedHeight: false },
    );
  });
});
