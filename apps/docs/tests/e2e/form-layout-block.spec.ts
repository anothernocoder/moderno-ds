/**
 * The form-layout block, checked where it is actually shown to a reader: the
 * built docs page, at the three widths of the responsive policy (375 / 768 /
 * 1280) in both colour schemes.
 *
 * This is the seam that replaces a screenshot baseline for this block. The
 * pixel baselines were dropped from this repo (see `playwright.config.ts`)
 * because almost every PR invalidated them; what those PNGs were actually
 * guarding — "does each container step fire at the right width, and is the text
 * still legible in both schemes?" — is a computed-style fact, and asking the
 * browser for it directly is both cheaper and more precise than diffing images.
 * It commits no artifact and cannot conflict between branches.
 *
 * form-layout is the block that leans hardest on ADR-0005: it makes three
 * layout decisions, one per contract step, and each is read off the width of
 * the element it was mounted in rather than the window. So the assertions below
 * are stated as a function of that container width and checked against every
 * copy on the page at once — which is why the narrow sidebar figure stays
 * stacked at 1280 while the wide figure has already crossed all three steps.
 *
 * Two claims:
 *
 * 1. **Container, not viewport** — per scheme *and* per viewport width, because
 *    the whole claim is that the viewport does not decide. The actions row
 *    lines up at `--container-sm`, the field grid pairs off at
 *    `--container-md`, and each group's heading moves beside its fields at
 *    `--container-lg`.
 * 2. **AA contrast** — per scheme only, at the default viewport: the headings,
 *    the field labels, the helper text, both actions' labels and every error
 *    message clear 4.5:1 against the surface behind them. Contrast is a colour
 *    fact, so it does not vary with width.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/form-layout/";

interface BlockMetrics {
  /** Width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** `display` of the actions row: `grid` stacked, `flex` once it lines up. */
  actionsDisplay: string;
  /** Whether the first two fields of the Profile group share a row. */
  fieldsPaired: boolean;
  /** Whether the Profile group's heading sits beside its fields rather than above. */
  headingBeside: boolean;
}

/** Every mounted copy of the block on the page, in document order. */
async function blockMetrics(page: Page): Promise<BlockMetrics[]> {
  return page.evaluate(() => {
    const panel = document.querySelector(".preview-panel--demo");
    if (!panel) throw new Error("no .preview-panel--demo on the page");
    return [...panel.querySelectorAll("section.moderno-block-form-layout")].map((section) => {
      const form = section.querySelector("form");
      if (!form) throw new Error("the form-layout block did not render its own markup");

      // A group is a direct child of the form that carries its own heading;
      // the dividers and the actions row do not.
      const groups = [...form.children].filter((el) => el.querySelector(":scope > header"));
      const group = groups[0];
      const actions = form.lastElementChild;
      if (!group || !actions) throw new Error("the form-layout block rendered no groups");

      const heading = group.children[0]!.getBoundingClientRect();
      const fields = group.children[1]!.getBoundingClientRect();
      const rows = [...group.querySelectorAll('[data-scope="field"][data-part="root"]')].map((el) =>
        el.getBoundingClientRect(),
      );
      if (rows.length < 2) throw new Error("the Profile group rendered fewer than two fields");

      return {
        containerWidth: section.getBoundingClientRect().width,
        actionsDisplay: getComputedStyle(actions).display,
        fieldsPaired: Math.abs(rows[0]!.top - rows[1]!.top) < 1,
        headingBeside: heading.right <= fields.left + 1,
      };
    });
  });
}

/**
 * Contrast ratios read off the rendered page.
 *
 * Colours are resolved through a canvas rather than parsed: the contract's
 * values are OKLCH, `getComputedStyle` hands them back in whatever space they
 * were authored in, and the browser is the only thing that converts them
 * exactly the way it painted them.
 */
async function contrastRatios(page: Page): Promise<Record<string, number>> {
  return page.evaluate(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("no 2d context");

    function toRgba(color: string): [number, number, number, number] {
      ctx!.clearRect(0, 0, 1, 1);
      ctx!.fillStyle = color;
      ctx!.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx!.getImageData(0, 0, 1, 1).data;
      return [r!, g!, b!, a! / 255];
    }

    function luminance(color: string): number {
      const channel = (v: number) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      };
      const [r, g, b] = toRgba(color);
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    }

    function ratio(fg: string, bg: string): number {
      const a = luminance(fg);
      const b = luminance(bg);
      const [hi, lo] = a > b ? [a, b] : [b, a];
      return (hi + 0.05) / (lo + 0.05);
    }

    /** The nearest ancestor that actually paints a background. */
    function surfaceOf(el: Element): string {
      let node: Element | null = el;
      while (node) {
        const bg = getComputedStyle(node).backgroundColor;
        if (toRgba(bg)[3] > 0) return bg;
        node = node.parentElement;
      }
      return getComputedStyle(document.body).backgroundColor;
    }

    const panel = document.querySelector(".preview-panel--demo");
    if (!panel) throw new Error("no .preview-panel--demo on the page");
    const blocks = [...panel.querySelectorAll("section.moderno-block-form-layout")];
    const first = blocks[0];
    const withError = blocks.find((section) =>
      section.querySelector('[data-scope="alert"][data-part="root"]'),
    );
    if (!first || !withError) throw new Error("the form-layout demo did not render its states");

    const pick = <T extends Element>(root: Element, selector: string): T => {
      const el = root.querySelector<T>(selector);
      if (!el) throw new Error(`missing ${selector}`);
      return el;
    };

    const against = (el: Element) => ratio(getComputedStyle(el).color, surfaceOf(el));

    return {
      formTitle: against(pick(first, "h2")),
      formDescription: against(pick(first, "header p")),
      groupTitle: against(pick(first, "h3")),
      fieldLabel: against(pick(first, '[data-scope="field"][data-part="label"]')),
      helperText: against(pick(first, '[data-scope="field"][data-part="helper-text"]')),
      checkboxLabel: against(pick(first, '[data-scope="checkbox"][data-part="label"]')),
      submitLabel: (() => {
        const submit = pick<HTMLElement>(first, 'button[type="submit"]');
        return ratio(getComputedStyle(submit).color, surfaceOf(submit));
      })(),
      cancelLabel: (() => {
        const cancel = pick<HTMLElement>(first, 'button[type="button"]');
        return ratio(getComputedStyle(cancel).color, surfaceOf(cancel));
      })(),
      alertTitle: against(pick(withError, '[data-scope="alert"][data-part="title"]')),
      fieldErrorText: against(pick(withError, '[data-scope="field"][data-part="error-text"]')),
    };
  });
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`form-layout — ${scheme}`, () => {
    test.use({ colorScheme: scheme });

    for (const width of WIDTHS) {
      test(`lays itself out from its container at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1200 });
        await page.goto(PAGE, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready.then(() => true));

        expect(await page.evaluate(() => document.documentElement.classList.contains("dark"))).toBe(
          scheme === "dark",
        );

        const blocks = await blockMetrics(page);
        // The demo mounts the block seven times: four container widths (a
        // sidebar, a panel, the page column and a wide stage, one on each side
        // of every step), then the error, loading and disabled states.
        expect(blocks).toHaveLength(7);

        for (const [index, block] of blocks.entries()) {
          const where = `${scheme} ${width}px, copy ${index + 1} (${block.containerWidth}px)`;
          // Every step is answered from the block's own container, so the
          // answers differ between the figures at one viewport — which is the
          // whole point of ADR-0005.
          expect(block.actionsDisplay, `${where}: actions row`).toBe(
            block.containerWidth >= CONTAINER_SM ? "flex" : "grid",
          );
          expect(block.fieldsPaired, `${where}: field grid`).toBe(
            block.containerWidth >= CONTAINER_MD,
          );
          expect(block.headingBeside, `${where}: group heading`).toBe(
            block.containerWidth >= CONTAINER_LG,
          );
        }

        // The `@lg` figure is a stage wider than the docs column, and it scrolls
        // inside its own figure: the panel holding the demo never does, so the
        // page is not pushed sideways by showing the widest layout.
        const panel = await page.evaluate(() => {
          const el = document.querySelector(".preview-panel--demo") as HTMLElement;
          return { scroll: el.scrollWidth, client: el.clientWidth };
        });
        expect(panel.scroll, `${scheme} ${width}px: demo panel overflow`).toBeLessThanOrEqual(
          panel.client,
        );

        // Each of the three steps is exercised on both sides at every viewport,
        // so a step that silently stopped firing cannot pass this file.
        const widths = blocks.map((b) => b.containerWidth);
        for (const step of [CONTAINER_SM, CONTAINER_MD, CONTAINER_LG]) {
          expect(
            widths.some((w) => w < step),
            `${scheme} ${width}px: a figure under ${step}px`,
          ).toBe(true);
          expect(
            widths.some((w) => w >= step),
            `${scheme} ${width}px: a figure over ${step}px`,
          ).toBe(true);
        }
      });
    }

    test("clears AA contrast on every text it paints", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      const ratios = await contrastRatios(page);
      for (const [what, ratio] of Object.entries(ratios)) {
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
      }
    });
  });
}
