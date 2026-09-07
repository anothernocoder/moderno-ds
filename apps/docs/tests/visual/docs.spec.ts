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
import { expect, test, type Page } from "@playwright/test";
import { previewPages } from "./pages.ts";

const pages = previewPages();

/**
 * Block until the full-page height stops moving.
 *
 * A hydrating island can reflow after both `networkidle` and `document.fonts
 * .ready` have resolved, and `toHaveScreenshot` fails on a size mismatch before
 * any pixel tolerance applies — so the height is the thing to stabilise. Two
 * consecutive frames at the same height is enough to clear a reflow driven by
 * `onMount` or an effect; the polling stops as soon as that holds, so a static
 * prose page pays two frames, not the timeout.
 */
async function settled(page: Page, stableFrames = 2, timeoutMs = 5000): Promise<void> {
  await page.waitForFunction(
    ([needed, deadlineAt]) => {
      const w = window as unknown as { __h?: number; __n?: number };
      const height = document.documentElement.scrollHeight;
      w.__n = height === w.__h ? (w.__n ?? 0) + 1 : 0;
      w.__h = height;
      // Give up quietly rather than failing the run: a page that genuinely
      // never settles should be caught by the pixel diff, not by a timeout
      // whose message says nothing about what moved.
      return w.__n >= needed || Date.now() > deadlineAt;
    },
    [stableFrames, Date.now() + timeoutMs] as const,
    { polling: "raf", timeout: timeoutMs + 1000 },
  );
}

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
      await expect(page).toHaveScreenshot(`${doc.name}.png`, { fullPage: true });
    });
  }
});
