/**
 * The stat-row block, checked on the built docs page at the three widths of
 * the responsive policy (375 / 768 / 1280) in both colour schemes. It asserts
 * text and computed styles, never pixels (see `playwright.config.ts`).
 *
 * Three claims:
 *
 * 1. **Container, not viewport**: one stat a row below `--container-sm`, two
 *    from it, four from `--container-lg`; the header lines up at
 *    `--container-sm`; the values step up to `--text-heading-lg` at
 *    `--container-md`. Each copy is measured against its own container width,
 *    so the narrow frame stays one-up at 1280 while the wide one is four-up.
 * 2. **Every state renders what it claims**: four stats tinted by their tone,
 *    a card when there are none, placeholders in a busy region while loading,
 *    one alert with a retry when the load failed, and inert buttons when
 *    disabled.
 * 3. **AA contrast** on every text the block paints, per scheme.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/stat-row/";

const STATES = [
  "default",
  "narrow",
  "panel",
  "wide",
  "empty",
  "loading",
  "error",
  "disabled",
] as const;
type State = (typeof STATES)[number];

interface BlockMetrics {
  /** Width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** `display` of the header row: `grid` stacked, `flex` once it lines up. */
  headerDisplay: string;
  /** How many stats (or placeholders) share the first row of the grid. */
  perRow: number | null;
  /** Whether the values are set at `--text-heading-lg` rather than `--text-heading`. */
  largeValues: boolean | null;
  /** The Badge status of each stat's change, in order. */
  tones: string[];
  /** Whether every button in this copy is disabled. */
  allButtonsInert: boolean;
  /** Placeholders inside a busy `status` region. */
  busyPlaceholders: number;
  /** Whether this copy renders the "No numbers yet" card. */
  emptyCard: boolean;
  /** Whether this copy renders the failed-load alert with its retry. */
  failedLoad: boolean;
}

async function showState(page: Page, state: State): Promise<void> {
  const block = page.locator(`[data-demo-state="${state}"] section.moderno-block-stat-row`);
  await block.scrollIntoViewIfNeeded();
  await block.waitFor({ state: "visible" });
}

async function blockMetrics(page: Page, state: State): Promise<BlockMetrics[]> {
  return page.evaluate((state) => {
    const panel = document.querySelector(`[data-demo-state="${state}"]`);
    if (!panel) throw new Error(`no preview for the ${state} state on the page`);
    return [...panel.querySelectorAll("section.moderno-block-stat-row")].map((section) => {
      const shell = section.firstElementChild;
      const header = shell?.firstElementChild;
      if (!shell || !header) throw new Error("the stat-row block did not render its own markup");

      const list = shell.querySelector("ul");
      const busy = shell.querySelector('[role="status"][aria-busy="true"]');
      const cells = list
        ? [...list.children]
        : busy
          ? [...busy.querySelectorAll(':scope > [data-scope="card"]')]
          : [];

      let perRow: number | null = null;
      if (cells.length > 0) {
        const top = cells[0]!.getBoundingClientRect().top;
        perRow = cells.filter(
          (cell) => Math.abs(cell.getBoundingClientRect().top - top) < 1,
        ).length;
      }

      let largeValues: boolean | null = null;
      const value = list?.querySelector("li p.font-serif");
      if (value) {
        const probe = document.createElement("span");
        probe.style.fontSize = "var(--text-heading-lg)";
        section.append(probe);
        const large = getComputedStyle(probe).fontSize;
        probe.remove();
        largeValues = getComputedStyle(value).fontSize === large;
      }

      const buttons = [...section.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];
      const alert = section.querySelector('[data-scope="alert"][data-part="root"]');

      return {
        containerWidth: section.getBoundingClientRect().width,
        headerDisplay: getComputedStyle(header).display,
        perRow,
        largeValues,
        tones: list
          ? [...list.querySelectorAll('[data-scope="badge"][data-part="root"]')].map(
              (badge) => badge.getAttribute("data-variant") ?? "",
            )
          : [],
        allButtonsInert: buttons.length > 0 && buttons.every((button) => button.disabled),
        busyPlaceholders: busy ? busy.querySelectorAll('[data-scope="skeleton"]').length : 0,
        emptyCard:
          !list &&
          section
            .querySelector('[data-scope="card"][data-part="title"]')
            ?.textContent?.includes("No numbers yet") === true,
        failedLoad:
          !list &&
          alert?.getAttribute("data-variant") === "error" &&
          alert.querySelector('[data-scope="button"]')?.textContent?.includes("Try again") === true,
      };
    });
  }, state);
}

async function contrastRatios(page: Page): Promise<Record<string, number>> {
  let ratios: Record<string, number> = {};
  for (const state of ["default", "empty", "error"] as const) {
    await showState(page, state);
    ratios = { ...ratios, ...(await textRatios(page, state)) };
  }
  return ratios;
}

async function textRatios(
  page: Page,
  state: "default" | "empty" | "error",
): Promise<Record<string, number>> {
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

    function ratio(fg: string, bg: string): number {
      const a = luminance(fg);
      const b = luminance(bg);
      const [hi, lo] = a > b ? [a, b] : [b, a];
      return (hi + 0.05) / (lo + 0.05);
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

    const block = document.querySelector(
      `[data-demo-state="${state}"] section.moderno-block-stat-row`,
    );
    if (!block) throw new Error(`the ${state} stat-row demo did not render`);

    const pick = (root: Element, selector: string): Element => {
      const el = root.querySelector(selector);
      if (!el) throw new Error(`${state}: missing ${selector}`);
      return el;
    };
    const against = (el: Element) => ratio(getComputedStyle(el).color, surfaceOf(el));

    if (state === "empty") {
      return {
        emptyTitle: against(pick(block, '[data-scope="card"][data-part="title"]')),
        emptyDescription: against(pick(block, '[data-scope="card"][data-part="description"]')),
      };
    }
    if (state === "error") {
      return {
        failedTitle: against(pick(block, '[data-scope="alert"][data-part="title"]')),
        failedDescription: against(pick(block, '[data-scope="alert"][data-part="description"]')),
        failedAction: against(pick(block, '[data-scope="alert"] [data-scope="button"]')),
      };
    }

    const ratios: Record<string, number> = {
      heading: against(pick(block, "h2")),
      headingDescription: against(pick(block, "h2 + p")),
      actionLabel: against(pick(block, '[data-scope="button"]')),
    };
    // One entry per stat, so a tone whose tint is too light for its own text
    // fails by name rather than hiding behind the others.
    for (const row of block.querySelectorAll("ul li")) {
      const [label, value, change] = [...row.querySelectorAll('[data-part="content"] > p')];
      if (!label || !value || !change) throw new Error("a stat rendered no label, value or change");
      const name = label.textContent?.trim() ?? "stat";
      ratios[`${name} label`] = against(label);
      ratios[`${name} value`] = against(value);
      ratios[`${name} change`] = against(pick(change, '[data-scope="badge"]'));
      ratios[`${name} caption`] = against(pick(change, "span:not([data-scope])"));
    }
    return ratios;
  }, state);
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`stat-row — ${scheme}`, () => {
    test.use({ colorScheme: scheme });

    for (const width of WIDTHS) {
      test(`lays itself out from its container at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1200 });
        await page.goto(PAGE, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready.then(() => true));

        expect(await page.evaluate(() => document.documentElement.classList.contains("dark"))).toBe(
          scheme === "dark",
        );

        const blocks: BlockMetrics[] = [];
        for (const state of STATES) {
          await showState(page, state);
          const mounted = await blockMetrics(page, state);
          expect(mounted, `${state}: mounted copies`).toHaveLength(1);
          const block = mounted[0]!;
          blocks.push(block);
          const where = `${scheme} ${width}px, ${state} (${block.containerWidth}px)`;

          expect(block.headerDisplay, `${where}: header row`).toBe(
            block.containerWidth >= CONTAINER_SM ? "flex" : "grid",
          );
          if (block.perRow !== null) {
            const expected =
              block.containerWidth >= CONTAINER_LG
                ? 4
                : block.containerWidth >= CONTAINER_SM
                  ? 2
                  : 1;
            expect(block.perRow, `${where}: stats a row`).toBe(expected);
          }
          if (block.largeValues !== null) {
            expect(block.largeValues, `${where}: value size`).toBe(
              block.containerWidth >= CONTAINER_MD,
            );
            // The tint follows what the change means, not its sign: the
            // sample's churn fell and that is good news.
            expect(block.tones, `${where}: tones`).toEqual([
              "success",
              "success",
              "success",
              "error",
            ]);
          }

          const panel = await page.evaluate((state) => {
            const el = document
              .querySelector(`[data-demo-state="${state}"]`)!
              .closest(".preview-panel--demo") as HTMLElement;
            return { scroll: el.scrollWidth, client: el.clientWidth };
          }, state);
          expect(panel.scroll, `${where}: demo panel overflow`).toBeLessThanOrEqual(panel.client);
        }

        const lists = blocks.filter((block) => block.tones.length > 0);
        expect(lists.length, `${scheme} ${width}px: copies rendering the stats`).toBe(5);
        expect(blocks.filter((block) => block.emptyCard).length, "the empty render").toBe(1);
        expect(
          blocks.filter((block) => block.busyPlaceholders === 12).length,
          "the loading render: four placeholder cards of three lines",
        ).toBe(1);
        expect(blocks.filter((block) => block.failedLoad).length, "the failed-load render").toBe(1);
        expect(lists.filter((block) => block.allButtonsInert).length, "the disabled render").toBe(
          1,
        );

        // Each step is exercised on both sides at every viewport.
        const widths = lists.map((block) => block.containerWidth);
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

    test("clears AA contrast on every text it paints", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      const ratios = await contrastRatios(page);
      for (const label of ["Revenue", "Active customers", "Churn rate", "Average order"]) {
        expect(ratios[`${label} value`], `${scheme}: ${label} measured`).toBeDefined();
      }
      for (const [what, ratio] of Object.entries(ratios)) {
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
      }
    });
  });
}
