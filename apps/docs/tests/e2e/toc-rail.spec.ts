/**
 * The on-this-page rail (`TableOfContents.astro` + `toc.ts`).
 *
 * Two facts worth a live browser rather than a static-HTML grep: the rail
 * must list exactly the page's own h2/h3, in the order they appear in the
 * document — not the order Astro's heading collector happens to hand back —
 * and the active marker (`aria-current`) must track whichever heading the
 * scroll-spy in `toc.ts` currently judges "in view", which only a real
 * `IntersectionObserver` can produce.
 */
import { expect, test } from "@playwright/test";

/**
 * `using-with-agents` has a real two-level outline — two top h2s, six h3s
 * nested under the third h2, then two more h2s — so it exercises both the
 * h2→h3 and h3→h2 rail transitions the connectors exist for.
 */
const PAGE = "/en/using-with-agents/";

test.describe("table-of-contents rail", () => {
  test("lists exactly the page's h2/h3, in document order", async ({ page }) => {
    await page.goto(PAGE, { waitUntil: "networkidle" });

    const headings = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("main :where(h2, h3)")].map((h) => ({
        slug: h.id,
        text: h.textContent?.trim() ?? "",
      })),
    );
    expect(headings.length).toBeGreaterThan(5);

    const tocLinks = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLAnchorElement>(".toc [data-toc-link]")].map((a) => ({
        slug: a.dataset.tocLink ?? "",
        text: a.textContent?.trim() ?? "",
      })),
    );

    expect(tocLinks).toEqual(headings);
  });

  test("marks the h2→h3 and h3→h2 transitions with a curved connector", async ({ page }) => {
    await page.goto(PAGE, { waitUntil: "networkidle" });

    // The page's outline has exactly one run of h3s (under "The agent loop"),
    // so exactly one connector bridges into it and one bridges back out.
    const counts = await page.evaluate(() => ({
      in: document.querySelectorAll(".toc .toc-connector--in").length,
      out: document.querySelectorAll(".toc .toc-connector--out").length,
    }));
    expect(counts).toEqual({ in: 1, out: 1 });
  });

  test("the active marker follows the heading scrolled into view", async ({ page }) => {
    await page.goto(PAGE, { waitUntil: "networkidle" });

    const currentSlug = () =>
      page.evaluate(
        () => document.querySelector('.toc [aria-current="true"]')?.getAttribute("data-toc-link") ?? null,
      );

    // A heading well into the page's middle run of h3s.
    const target = "5-write-the-code";
    await page.evaluate((slug) => {
      document.getElementById(slug)?.scrollIntoView({ block: "start" });
    }, target);

    await expect
      .poll(() => currentSlug(), { message: "aria-current did not move to the scrolled-to heading" })
      .toBe(target);

    // Exactly one link is marked current at a time.
    const activeCount = await page.evaluate(
      () => document.querySelectorAll('.toc [aria-current="true"]').length,
    );
    expect(activeCount).toBe(1);
  });
});
