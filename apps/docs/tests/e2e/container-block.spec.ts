/**
 * The container block, checked on the built docs page at the three widths of
 * the responsive policy (375 / 768 / 1280) in both colour schemes. It asserts
 * text and computed styles, never pixels (see `playwright.config.ts`).
 *
 * Three claims:
 *
 * 1. **Its width is a contract step**: `sm`, `md` and `lg` cap the content at
 *    `--container-sm|md|lg`, `full` does not cap it, and the content is
 *    centred with equal room on both sides.
 * 2. **Container, not viewport**: the gutter is `--spacing` × 4 below
 *    `--container-sm`, × 6 from it and × 8 from `--container-md`; the room
 *    above and below grows from × 6 to × 10 at `--container-lg`. Each copy is
 *    measured against its own container width.
 * 3. **It holds what it is given**: with no content it shows its sample card,
 *    with content it shows that instead; both clear AA contrast per scheme.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/container/";

const STATES = ["default", "sm", "md", "lg", "full", "narrow", "panel", "wide", "content"] as const;
type State = (typeof STATES)[number];

const SIZES: Partial<Record<State, "sm" | "md" | "lg" | "full">> = {
  sm: "sm",
  md: "md",
  lg: "lg",
  full: "full",
};

interface BlockMetrics {
  /** Width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** The content column's computed `max-width`, in px, or `none`. */
  maxWidth: string;
  /** Each contract step's width in px, resolved in the page. */
  steps: Record<"sm" | "md" | "lg", string>;
  /** The content column's width. */
  contentWidth: number;
  /** Room left and right of the content column, inside the root. */
  sideRoom: [number, number];
  /** Horizontal and vertical padding of the content column, as `--spacing` multiples. */
  gutter: number;
  room: number;
  /** Whether the sample card renders. */
  sample: boolean;
}

async function showState(page: Page, state: State): Promise<void> {
  const block = page.locator(`[data-demo-state="${state}"] .moderno-block-container`).first();
  await block.scrollIntoViewIfNeeded();
  await block.waitFor({ state: "visible" });
}

async function blockMetrics(page: Page, state: State): Promise<BlockMetrics[]> {
  return page.evaluate((state) => {
    const panel = document.querySelector(`[data-demo-state="${state}"]`);
    if (!panel) throw new Error(`no preview for the ${state} state on the page`);
    return [...panel.querySelectorAll(".moderno-block-container")].map((root) => {
      const column = root.firstElementChild as HTMLElement | null;
      if (!column) throw new Error("the container block did not render its own markup");

      const probe = document.createElement("div");
      root.append(probe);
      const resolve = (value: string) => {
        probe.style.width = value;
        return getComputedStyle(probe).width;
      };
      const unit = parseFloat(resolve("var(--spacing)"));
      const steps = {
        sm: resolve("var(--container-sm)"),
        md: resolve("var(--container-md)"),
        lg: resolve("var(--container-lg)"),
      };
      probe.remove();

      const style = getComputedStyle(column);
      const rootBox = root.getBoundingClientRect();
      const box = column.getBoundingClientRect();
      return {
        containerWidth: rootBox.width,
        maxWidth: style.maxWidth,
        steps,
        contentWidth: box.width,
        sideRoom: [box.left - rootBox.left, rootBox.right - box.right] as [number, number],
        gutter: parseFloat(style.paddingLeft) / unit,
        room: parseFloat(style.paddingTop) / unit,
        sample: column.textContent?.includes("Page content") === true,
      };
    });
  }, state);
}

async function textRatios(page: Page, state: "default" | "content"): Promise<number[]> {
  return page.evaluate((state) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("no 2d context");

    // Colours are resolved through a canvas: the contract's values are OKLCH,
    // and the browser is the only thing that converts them the way it painted.
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

    function surfaceOf(el: Element): string {
      let node: Element | null = el;
      while (node) {
        const bg = getComputedStyle(node).backgroundColor;
        if (toRgba(bg)[3] > 0) return bg;
        node = node.parentElement;
      }
      return getComputedStyle(document.body).backgroundColor;
    }

    const block = document.querySelector(`[data-demo-state="${state}"] .moderno-block-container`);
    if (!block) throw new Error(`the ${state} container demo did not render`);
    return ['[data-part="title"]', '[data-part="description"]'].map((selector) => {
      const el = block.querySelector(`[data-scope="card"]${selector}`);
      if (!el) throw new Error(`${state}: missing ${selector}`);
      const a = luminance(getComputedStyle(el).color);
      const b = luminance(surfaceOf(el));
      const [hi, lo] = a > b ? [a, b] : [b, a];
      return (hi + 0.05) / (lo + 0.05);
    });
  }, state);
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`container — ${scheme}`, () => {
    test.use({ colorScheme: scheme });

    for (const width of WIDTHS) {
      test(`sizes and pads itself from its container at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1200 });
        await page.goto(PAGE, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready.then(() => true));

        expect(await page.evaluate(() => document.documentElement.classList.contains("dark"))).toBe(
          scheme === "dark",
        );

        const widths: number[] = [];
        for (const state of STATES) {
          await showState(page, state);
          const mounted = await blockMetrics(page, state);
          expect(mounted, `${state}: mounted copies`).toHaveLength(1);
          const block = mounted[0]!;
          widths.push(block.containerWidth);
          const where = `${scheme} ${width}px, ${state} (${block.containerWidth}px)`;

          const size = SIZES[state] ?? (state === "content" ? "md" : "lg");
          expect(block.maxWidth, `${where}: max width`).toBe(
            size === "full" ? "none" : block.steps[size],
          );
          const cap = size === "full" ? Infinity : parseFloat(block.steps[size]);
          expect(block.contentWidth, `${where}: content width`).toBeCloseTo(
            Math.min(block.containerWidth, cap),
            0,
          );
          expect(Math.abs(block.sideRoom[0] - block.sideRoom[1]), `${where}: centred`).toBeLessThan(
            1,
          );

          expect(block.gutter, `${where}: gutter`).toBe(
            block.containerWidth >= CONTAINER_MD ? 8 : block.containerWidth >= CONTAINER_SM ? 6 : 4,
          );
          expect(block.room, `${where}: room above and below`).toBe(
            block.containerWidth >= CONTAINER_LG ? 10 : 6,
          );
          expect(block.sample, `${where}: sample content`).toBe(state !== "content");

          const panel = await page.evaluate((state) => {
            const el = document
              .querySelector(`[data-demo-state="${state}"]`)!
              .closest(".preview-panel--demo") as HTMLElement;
            return { scroll: el.scrollWidth, client: el.clientWidth };
          }, state);
          expect(panel.scroll, `${where}: demo panel overflow`).toBeLessThanOrEqual(panel.client);
        }

        // Each step is exercised on both sides at every viewport.
        for (const step of [CONTAINER_SM, CONTAINER_MD, CONTAINER_LG]) {
          expect(
            widths.some((w) => w < step),
            `a copy under ${step}px`,
          ).toBe(true);
          expect(
            widths.some((w) => w >= step),
            `a copy over ${step}px`,
          ).toBe(true);
        }
      });
    }

    test("clears AA contrast on the sample and on content it is given", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      for (const state of ["default", "content"] as const) {
        await showState(page, state);
        for (const ratio of await textRatios(page, state)) {
          expect(ratio, `${scheme}: ${state} contrast`).toBeGreaterThanOrEqual(4.5);
        }
      }
    });
  });
}
