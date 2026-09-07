/**
 * Visual regression seam: every built preview page, at three widths and both
 * colour schemes, compared pixel-for-pixel against a committed baseline.
 *
 * The docs are where every primitive, block and theme is rendered for real, so
 * a diff here is the cheapest signal that a token, a stylesheet or a component's
 * markup moved. The width × scheme matrix comes from `playwright.config.ts`
 * (one project per combination); this file only decides *what* is on screen and
 * *when* it has settled.
 *
 * ## The sidebar is not on screen
 *
 * `BaseLayout.astro` renders `<aside class="sidebar">` from
 * `getCollection("docs")`, so it lists *every* page of the locale on *every*
 * page. Captured as-is, adding one docs page repaints all 84 baselines: two
 * tickets adding a page in parallel then collide on every one of them, and
 * whichever merges second is stale on arrival. So the sidebar is collapsed here
 * (`NEUTRALISE_SIDEBAR_CSS`) and watched once, from a frozen fixture, in
 * `chrome.spec.ts`. Everything else the layout renders — header, search, TOC
 * rail, grid geometry, prose — is page-count-independent and stays in every
 * capture. See `chrome.ts` for the rule that decides which is which.
 *
 * The rule is scoped to the *layout's* aside, and the last test in this file
 * exists to keep it that way: a `.sidebar` a block or screen demo renders
 * inside `<main>` is page content, must appear in that page's own baseline, and
 * an unscoped rule would blank it with every guard still green.
 */
import { expect, test } from "@playwright/test";
import { NEUTRALISE_SIDEBAR_CSS, SIDEBAR_SELECTOR } from "./chrome.ts";
import { previewPages } from "./pages.ts";
import { settled } from "./settle.ts";

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
      // ORDER IS LOAD-BEARING: this stylesheet changes the page height (at
      // 375/768 it removes the stacked sidebar entirely), so it must be applied
      // *before* `settled` below. Reorder these and `settled` certifies a
      // height the style is about to invalidate, and the capture races the
      // reflow again.
      await page.addStyleTag({ content: NEUTRALISE_SIDEBAR_CSS });
      // Self-hosted Geist: a screenshot taken mid-swap is the one flaky thing
      // left. Resolve to a plain value — a FontFaceSet isn't serializable.
      await page.evaluate(() => document.fonts.ready.then(() => true));
      // Neither of the waits above sees an island that reflows *after* it
      // hydrates. The Theme Builder is `client:only` and re-runs its WCAG check
      // against the state it hydrates in `onMount`, so the contrast verdict
      // switches between a one-line "✓" and a paragraph plus a warning list —
      // ~78px of page height, and a full-page screenshot that disagrees with
      // its baseline about the image size. Settle on a height that survives
      // consecutive frames instead of racing it.
      await settled(page);
      // The neutralising rule is `!important` CSS aimed at one selector. If
      // `BaseLayout.astro` renames the aside or moves it out of `.layout`, or
      // `docs.css` gives it an `!important` height of its own, the rule stops
      // applying and the per-page height drift comes back — silently, because
      // the baselines would simply be regenerated with a sidebar in them. Fail
      // here instead. Read the box directly rather than through
      // `boundingBox()`, which reports `null` for anything Playwright considers
      // invisible — and `visibility: hidden` is exactly that. Same constant the
      // rule is built from, so the two cannot drift apart.
      const sidebarHeight = await page.evaluate(
        (selector) => document.querySelector(selector)?.getBoundingClientRect().height ?? -1,
        SIDEBAR_SELECTOR,
      );
      expect(
        sidebarHeight,
        `expected ${SIDEBAR_SELECTOR} to exist and be collapsed to 0 — NEUTRALISE_SIDEBAR_CSS has rotted, see chrome.ts`,
      ).toBe(0);
      await expect(page).toHaveScreenshot(`${doc.name}.png`, { fullPage: true });
    });
  }

  // The other half of the rule: what it must *not* reach. Width- and
  // scheme-independent, so one project runs it.
  test("the rule cannot reach a demo's own sidebar", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "1280-light", "width- and scheme-independent");
    await page.goto(pages[0].path, { waitUntil: "networkidle" });
    await page.addStyleTag({ content: NEUTRALISE_SIDEBAR_CSS });

    // Stand in for the thing this seam exists to unblock: a block or screen
    // demo that renders its own `class="sidebar"` inside `.preview-panel--demo`.
    // There is none in the docs today, so the collision has to be constructed —
    // the alternative is discovering it when the first app-shell screen lands
    // with a blank rectangle in its own baseline and a green suite.
    const boxes = await page.evaluate((selector) => {
      const demo = document.createElement("aside");
      demo.className = "sidebar";
      demo.textContent = "a demo's own sidebar";
      document.getElementById("main")?.prepend(demo);
      const layout = document.querySelector(selector);
      return {
        layoutHeight: layout ? layout.getBoundingClientRect().height : -1,
        demo: {
          attached: demo.isConnected,
          painted: demo.getBoundingClientRect().height > 0,
          visibility: getComputedStyle(demo).visibility,
        },
      };
    }, SIDEBAR_SELECTOR);

    expect(
      boxes.layoutHeight,
      `${SIDEBAR_SELECTOR} was not collapsed — the rule did not apply at all`,
    ).toBe(0);
    expect(
      boxes.demo,
      "NEUTRALISE_SIDEBAR_CSS reached a .sidebar inside <main> — scope it to the layout aside, see SIDEBAR_SELECTOR in chrome.ts",
    ).toEqual({ attached: true, painted: true, visibility: "visible" });
  });
});
