/**
 * The login-form block, checked where it is actually shown to a reader: the
 * built docs page, at the three widths of the responsive policy (375 / 768 /
 * 1280) in both colour schemes.
 *
 * This is the seam that replaces a screenshot baseline for this block. The
 * pixel baselines were dropped from this repo (see `playwright.config.ts`)
 * because almost every PR invalidated them; what those PNGs were actually
 * guarding — "does the container step fire at the right width, and is the text
 * still legible in both schemes?" — is a computed-style fact, and asking the
 * browser for it directly is both cheaper and more precise than diffing images.
 * It commits no artifact and cannot conflict between branches.
 *
 * Two claims, per width and per scheme:
 *
 * 1. **Container, not viewport.** The block's secondary row (remember-me + the
 *    recovery link) stacks below `--container-sm` and sits on one line at or
 *    above it — decided by the width of the element the block was mounted in,
 *    which is why the page's narrow sidebar figure stays stacked at 1280 while
 *    the wide figure crosses the step on its own.
 * 2. **AA contrast.** The card's own text, the submit's label on its fill, and
 *    the error alert's text all clear 4.5:1 against the surface behind them, in
 *    light and in dark.
 */
import { expect, test, type Page } from "@playwright/test";

/** `--container-sm`, the block's `@sm` step, in px at the default root size. */
const CONTAINER_SM = 384;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/login-form/";

interface BlockMetrics {
  /** Width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** `display` of the row holding remember-me and the recovery link. */
  secondaryRowDisplay: string;
  /** Whether the card is capped at `--container-sm` however wide its container. */
  cardWidth: number;
}

/** Every mounted copy of the block on the page, in document order. */
async function blockMetrics(page: Page): Promise<BlockMetrics[]> {
  return page.evaluate(() => {
    const panel = document.querySelector(".preview-panel--demo");
    if (!panel) throw new Error("no .preview-panel--demo on the page");
    return [...panel.querySelectorAll("section.moderno-block-login")].map((section) => {
      const link = section.querySelector<HTMLAnchorElement>("form a[href]");
      const row = link?.parentElement;
      const card = section.querySelector<HTMLElement>('[data-scope="card"][data-part="root"]');
      if (!row || !card) throw new Error("the login-form block did not render its own markup");
      return {
        containerWidth: section.getBoundingClientRect().width,
        secondaryRowDisplay: getComputedStyle(row).display,
        cardWidth: card.getBoundingClientRect().width,
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

    function toRgb(color: string): [number, number, number] {
      ctx!.clearRect(0, 0, 1, 1);
      ctx!.fillStyle = "#000";
      ctx!.fillStyle = color;
      ctx!.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx!.getImageData(0, 0, 1, 1).data;
      return [r!, g!, b!];
    }

    function luminance(color: string): number {
      const channel = (v: number) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      };
      const [r, g, b] = toRgb(color);
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
        const [, , , alpha] = toRgbaAlpha(bg);
        if (alpha > 0) return bg;
        node = node.parentElement;
      }
      return getComputedStyle(document.body).backgroundColor;
    }

    function toRgbaAlpha(color: string): [number, number, number, number] {
      ctx!.clearRect(0, 0, 1, 1);
      ctx!.fillStyle = color;
      ctx!.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx!.getImageData(0, 0, 1, 1).data;
      return [r!, g!, b!, a! / 255];
    }

    const panel = document.querySelector(".preview-panel--demo");
    if (!panel) throw new Error("no .preview-panel--demo on the page");
    const first = panel.querySelector("section.moderno-block-login");
    const withError = [...panel.querySelectorAll("section.moderno-block-login")].find((section) =>
      section.querySelector('[data-scope="alert"][data-part="root"]'),
    );
    if (!first || !withError) throw new Error("the login-form demo did not render its states");

    const pick = <T extends Element>(root: Element, selector: string): T => {
      const el = root.querySelector<T>(selector);
      if (!el) throw new Error(`missing ${selector}`);
      return el;
    };

    const title = pick(first, '[data-scope="card"][data-part="title"]');
    const description = pick(first, '[data-scope="card"][data-part="description"]');
    const label = pick(first, '[data-scope="field"][data-part="label"]');
    const submit = pick(first, '[data-scope="button"][data-part="root"]');
    const alertTitle = pick(withError, '[data-scope="alert"][data-part="title"]');

    const against = (el: Element) => ratio(getComputedStyle(el).color, surfaceOf(el));

    return {
      cardTitle: against(title),
      cardDescription: against(description),
      fieldLabel: against(label),
      submitLabel: ratio(getComputedStyle(submit).color, getComputedStyle(submit).backgroundColor),
      alertTitle: against(alertTitle),
    };
  });
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`login-form — ${scheme}`, () => {
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
        // The demo mounts the block five times: two container widths, then the
        // error, loading and disabled states.
        expect(blocks).toHaveLength(5);

        for (const [index, block] of blocks.entries()) {
          const where = `${scheme} ${width}px, copy ${index + 1} (${block.containerWidth}px)`;
          // The @sm step is read off the block's own container, so the answer
          // differs between the sidebar figure and the full-width ones at the
          // same viewport — which is the whole point of ADR-0005.
          expect(block.secondaryRowDisplay, `${where}: secondary row`).toBe(
            block.containerWidth >= CONTAINER_SM ? "flex" : "grid",
          );
          // The card never grows past --container-sm, whatever room it is given.
          expect(block.cardWidth, `${where}: card width`).toBeLessThanOrEqual(CONTAINER_SM);
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
