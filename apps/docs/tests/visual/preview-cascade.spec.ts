/**
 * What actually wins inside a live `<Preview>` panel.
 *
 * The docs compile the utilities a block is written with (`scripts/tailwind.ts`)
 * and scope Tailwind's preflight to the panel, but neither of those is worth
 * anything unless it beats `docs.css`'s prose typography — element selectors
 * under `main` that match a block's own `<h2>` just as readily. That is a
 * *cascade* fact, and the only way to check it is to render the page and ask
 * the browser: a test that greps the emitted CSS passes just as happily when
 * every rule it found is being overridden.
 *
 * So this spec asserts computed styles, not pixels. It is a peer of the
 * screenshot baselines rather than a replacement: a baseline says "something
 * moved", this says *which rule lost*, in the one place where a block is shown
 * to a reader as proof the mechanism works.
 */
import { expect, test, type Page } from "@playwright/test";

/** `--container-md`, the block's `@md` step, in px at the default root size. */
const CONTAINER_MD = 576;

/** The type scale the pricing block asks for, resolved from the preset. */
const TEXT_LG = "18px";
const TEXT_XL = "20px";
const TEXT_SM = "14px";
/** `p-6` — what a plan card's padding alone should put above its title. */
const CARD_PADDING = 24;

interface FigureMetrics {
  containerWidth: number;
  headingFontSize: string;
  headingMarginTop: string;
  headingMarginBottom: string;
  planNameFontSize: string;
  planNameMarginTop: string;
  priceMarginTop: string;
  /** Distance from a plan card's top edge to its title's, in px. */
  titleOffsetInCard: number;
}

async function figureMetrics(page: Page): Promise<FigureMetrics[]> {
  return page.evaluate(() => {
    const panel = document.querySelector(".preview-panel--demo");
    if (!panel) throw new Error("no .preview-panel--demo on the page");
    return [...panel.querySelectorAll("figure.demo-container")].map((figure) => {
      const section = figure.querySelector("section");
      const heading = figure.querySelector("h2");
      const card = figure.querySelector("li");
      const planName = card?.querySelector("h3") ?? null;
      const price = card?.querySelector("p") ?? null;
      if (!section || !heading || !card || !planName || !price) {
        throw new Error("the pricing block did not render its own markup");
      }
      const h = getComputedStyle(heading);
      return {
        containerWidth: section.getBoundingClientRect().width,
        headingFontSize: h.fontSize,
        headingMarginTop: h.marginTop,
        headingMarginBottom: h.marginBottom,
        planNameFontSize: getComputedStyle(planName).fontSize,
        planNameMarginTop: getComputedStyle(planName).marginTop,
        priceMarginTop: getComputedStyle(price).marginTop,
        titleOffsetInCard: planName.getBoundingClientRect().top - card.getBoundingClientRect().top,
      };
    });
  });
}

test.describe("the preview panel renders a block the way a consumer would see it", () => {
  for (const path of ["/en/blocks/", "/es/blocks/"]) {
    test(`block preview cascade — ${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready.then(() => true));
      const figures = await figureMetrics(page);
      // Two containers, one above the other — the page's whole argument.
      expect(figures).toHaveLength(2);

      for (const [index, figure] of figures.entries()) {
        const where = `${path} figure ${index + 1} (${figure.containerWidth}px)`;

        // The block's own type step, and nothing inherited from the prose.
        // `@md:text-xl` fires from the *container's* width, so which of the two
        // sizes is correct depends on the figure, not on the viewport — that
        // asymmetry is what the page exists to demonstrate.
        const expected = figure.containerWidth >= CONTAINER_MD ? TEXT_XL : TEXT_LG;
        expect(figure.headingFontSize, `${where}: heading size`).toBe(expected);
        expect(figure.planNameFontSize, `${where}: plan name size`).toBe(TEXT_SM);

        // Preflight is scoped to this panel precisely so the prose margins
        // (`main h2` 3rem, `main h3` 2rem, `main p` 0.9rem) stop at its edge.
        expect(figure.headingMarginTop, `${where}: heading margin-top`).toBe("0px");
        expect(figure.headingMarginBottom, `${where}: heading margin-bottom`).toBe("0px");
        expect(figure.planNameMarginTop, `${where}: plan name margin-top`).toBe("0px");
        // `mt-1`, the block's own spacing between plan name and price.
        expect(figure.priceMarginTop, `${where}: price margin-top`).toBe("4px");

        // The visible consequence of all of the above: a `p-6` card whose title
        // sits exactly its padding from the top edge.
        expect(figure.titleOffsetInCard, `${where}: title offset in card`).toBeCloseTo(
          CARD_PADDING,
          1,
        );
      }
    });
  }

  test("the two containers disagree about the type step when the panel is wide enough", async ({
    page,
  }) => {
    await page.goto("/en/blocks/", { waitUntil: "networkidle" });
    const [narrow, wide] = await figureMetrics(page);
    // `max-w-sm` caps the first figure below `--container-md` at every viewport.
    expect(narrow!.containerWidth).toBeLessThan(CONTAINER_MD);
    expect(narrow!.headingFontSize).toBe(TEXT_LG);
    // Above the step the second figure must differ; below it, both stack and
    // both read `text-lg` — the demo is width-honest either way.
    if (wide!.containerWidth >= CONTAINER_MD) {
      expect(wide!.headingFontSize).toBe(TEXT_XL);
    } else {
      expect(wide!.headingFontSize).toBe(TEXT_LG);
    }
  });

  test("the docs prose outside the panel keeps its own scale", async ({ page }) => {
    await page.goto("/en/blocks/", { waitUntil: "networkidle" });
    // The other half of the contract: scoping the preview must not reach out
    // and flatten the page around it.
    const prose = await page.evaluate(() => {
      const heading = [...document.querySelectorAll("main h2")].find(
        (el) => !el.closest(".preview-panel--demo"),
      );
      if (!heading) throw new Error("no prose heading on the page");
      const s = getComputedStyle(heading);
      return { fontSize: s.fontSize, marginTop: s.marginTop };
    });
    expect(prose.fontSize).toBe("22px"); // docs.css `main h2`, 1.375rem
    expect(prose.marginTop).toBe("48px"); // docs.css `main h2`, 3rem
  });
});
