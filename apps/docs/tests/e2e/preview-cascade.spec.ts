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
 * So this spec asserts computed styles, not pixels. It says *which rule wins*,
 * in the one place where a block is shown to a reader as proof the mechanism
 * works.
 */
import { expect, test, type Page } from "@playwright/test";

/** `--container-md`, the block's `@md` step, in px at the default root size. */
const CONTAINER_MD = 576;

/** The type steps the pricing block asks for, resolved from the contract. */
const TEXT_BODY_LG = "18px";
const TEXT_HEADING_SM = "20px";
const TEXT_UI_MD = "14px";
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

/**
 * The demo's two tabs (islands/PricingBlockDemo.svelte), in order: the block
 * framed at 24rem, then the same block at the stage's full width. Only the
 * active tab's copy is mounted.
 */
const STATES = ["narrow", "wide"] as const;

/** Select a tab of the demo and wait for its copy of the block to mount. */
async function showState(page: Page, state: (typeof STATES)[number]): Promise<void> {
  // The island is `client:visible`: bring it on screen so it hydrates, and
  // click only once Astro has dropped `ssr` — a click on the server-rendered
  // tab would land before the handler exists and be lost.
  await page.locator(".preview-panel--demo [role='tablist']").scrollIntoViewIfNeeded();
  await page
    .locator(`.preview-panel--demo astro-island:not([ssr]) [data-demo-tab="${state}"]`)
    .click();
  await page
    .locator(`[data-demo-state="${state}"] section.moderno-block-pricing`)
    .waitFor({ state: "visible" });
}

/** One copy of the block per tab, reached by selecting each tab in turn. */
async function figureMetrics(page: Page): Promise<FigureMetrics[]> {
  const figures: FigureMetrics[] = [];
  for (const state of STATES) {
    await showState(page, state);
    figures.push(...(await mountedMetrics(page)));
  }
  return figures;
}

/** The copy of the block the active tab mounted. */
async function mountedMetrics(page: Page): Promise<FigureMetrics[]> {
  return page.evaluate(() => {
    const panel = document.querySelector(".preview-panel--demo [data-demo-state]");
    if (!panel) throw new Error("no demo tab panel on the page");
    return [...panel.querySelectorAll("section.moderno-block-pricing")].map((section) => {
      const heading = section.querySelector("h2");
      const card = section.querySelector("li");
      const planName = card?.querySelector("h3") ?? null;
      const price = card?.querySelector("p") ?? null;
      if (!heading || !card || !planName || !price) {
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

/**
 * The guide that shows the Pricing block in two containers, one tab each. The
 * slug lives here once: renaming the page and forgetting this line would
 * otherwise land on a page without the pricing demo and fail with a missing
 * tab, several tests deep.
 */
const GUIDE = { en: "/en/blocks-and-containers/", es: "/es/blocks-and-containers/" };

test.describe("the preview panel renders a block the way a consumer would see it", () => {
  for (const path of [GUIDE.en, GUIDE.es]) {
    test(`block preview cascade — ${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready.then(() => true));
      const figures = await figureMetrics(page);
      // Two containers, one tab each — the page's whole argument.
      expect(figures).toHaveLength(2);

      for (const [index, figure] of figures.entries()) {
        const where = `${path} figure ${index + 1} (${figure.containerWidth}px)`;

        // The block's own type step, and nothing inherited from the prose.
        // `@md:text-heading-sm` fires from the *container's* width, so which of the two
        // sizes is correct depends on the tab, not on the viewport — that
        // asymmetry is what the page exists to demonstrate.
        const expected = figure.containerWidth >= CONTAINER_MD ? TEXT_HEADING_SM : TEXT_BODY_LG;
        expect(figure.headingFontSize, `${where}: heading size`).toBe(expected);
        expect(figure.planNameFontSize, `${where}: plan name size`).toBe(TEXT_UI_MD);

        // Preflight is scoped to this panel precisely so the prose margins
        // (`main h2` 3.5rem, `main h3` 2.25rem, `main p` 0.75rem) stop at its edge.
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
    await page.goto(GUIDE.en, { waitUntil: "networkidle" });
    const [narrow, wide] = await figureMetrics(page);
    // The 24rem frame caps the narrow tab below `--container-md` at every viewport.
    expect(narrow!.containerWidth).toBeLessThan(CONTAINER_MD);
    expect(narrow!.headingFontSize).toBe(TEXT_BODY_LG);
    // Above the step the wide tab must differ; below it, both stack and
    // both read `text-body-lg` — the demo is width-honest either way.
    if (wide!.containerWidth >= CONTAINER_MD) {
      expect(wide!.headingFontSize).toBe(TEXT_HEADING_SM);
    } else {
      expect(wide!.headingFontSize).toBe(TEXT_BODY_LG);
    }
  });

  test("the docs prose outside the panel keeps its own scale", async ({ page }) => {
    await page.goto(GUIDE.en, { waitUntil: "networkidle" });
    // The other half of the contract: scoping the preview must not reach out
    // and flatten the page around it.
    const prose = await page.evaluate(() => {
      // Not the section straight under the page header: that one drops its
      // top margin on purpose (docs.css `.page-header + h2`).
      const heading = [...document.querySelectorAll("main h2")].find(
        (el) =>
          !el.closest(".preview-panel--demo") &&
          !el.previousElementSibling?.classList.contains("page-header"),
      );
      if (!heading) throw new Error("no prose heading on the page");
      const s = getComputedStyle(heading);
      return { fontSize: s.fontSize, marginTop: s.marginTop };
    });
    expect(prose.fontSize).toBe("24px"); // docs.css `main h2`, 1.5rem
    expect(prose.marginTop).toBe("56px"); // docs.css `main h2`, 3.5rem
  });
});
