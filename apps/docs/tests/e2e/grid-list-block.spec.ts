/**
 * The grid-list block, checked on the built docs page at the three widths of
 * the responsive policy (375 / 768 / 1280) in both colour schemes. It asserts
 * text and computed styles; no screenshot baseline is committed.
 *
 * Three claims:
 *
 * 1. **Container, not viewport.** The header lines up at `--container-sm`, the
 *    grid goes to two columns at `--container-md` and to three at
 *    `--container-lg`. Each copy on the page is measured against its own
 *    container width, so the narrow frame stays one column at 1280 while the
 *    wide frame is already three.
 * 2. **Every state renders what it claims**, at every width: the cards with all
 *    five badge variants, a card when empty, skeleton cards in a busy region
 *    while loading, one alert with a retry on a failed load, and cards whose
 *    every button is inert when disabled.
 * 3. **AA contrast** in both schemes on every text the block paints.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/grid-list/";

const BLOCK = "section.moderno-block-grid-list";

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** `display` of the header row: `grid` stacked, `flex` once it lines up. */
  headerDisplay: string;
  /** Column count of the card grid, or of the skeleton grid while loading. */
  columns: number | null;
  /** Number of cards the grid renders. */
  cards: number;
  /** The badge variants the cards render, in order. */
  badges: string[];
  /** Whether every button in this copy is disabled. */
  allControlsInert: boolean;
  /** Skeleton cards inside a busy status region. */
  skeletonCards: number;
  /** Whether this copy renders the "No projects yet" card. */
  emptyCard: boolean;
  /** Whether this copy renders a grid-level alert (the failed-load stand-in). */
  gridLevelAlert: boolean;
}

/**
 * The page's previews (islands/GridListBlockDemo.svelte): the main preview
 * mounts the default; the Examples frame the same block at 18rem, 40rem and
 * 50rem, then mount the empty, loading, error and disabled states. Every copy
 * is found by the `data-demo-state` its wrapper carries.
 */
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

async function showState(page: Page, state: State): Promise<void> {
  const block = page.locator(`[data-demo-state="${state}"] ${BLOCK}`);
  await block.scrollIntoViewIfNeeded();
  await block.waitFor({ state: "visible" });
}

async function blockMetrics(page: Page, state: State): Promise<BlockMetrics[]> {
  return page.evaluate(
    ({ state, selector }) => {
      const panel = document.querySelector(`[data-demo-state="${state}"]`);
      if (!panel) throw new Error(`no preview for the ${state} state on the page`);
      return [...panel.querySelectorAll<HTMLElement>(selector)].map((section) => {
        const shell = section.firstElementChild;
        const header = shell?.firstElementChild;
        if (!shell || !header) throw new Error("the grid-list block did not render its own markup");

        const list = shell.querySelector("ul");
        const busy = shell.querySelector('[role="status"][aria-busy="true"]');
        const grid = list ?? busy;
        const columns = grid
          ? getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length
          : null;
        const cards = list
          ? [...list.querySelectorAll(':scope > li [data-scope="card"][data-part="root"]')]
          : [];
        const buttons = [...section.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];

        return {
          containerWidth: section.offsetWidth,
          headerDisplay: getComputedStyle(header).display,
          columns,
          cards: cards.length,
          badges: cards.map(
            (card) =>
              card
                .querySelector('[data-scope="badge"][data-part="root"]')
                ?.getAttribute("data-variant") ?? "",
          ),
          allControlsInert: buttons.length > 0 && buttons.every((button) => button.disabled),
          skeletonCards: busy
            ? [...busy.querySelectorAll(':scope > [data-scope="card"][data-part="root"]')].filter(
                (card) => card.querySelector('[data-scope="skeleton"]') !== null,
              ).length
            : 0,
          emptyCard:
            !list &&
            section
              .querySelector('[data-scope="card"][data-part="title"]')
              ?.textContent?.includes("No projects yet") === true,
          gridLevelAlert:
            !list && section.querySelector('[data-scope="alert"][data-part="root"]') !== null,
        };
      });
    },
    { state, selector: BLOCK },
  );
}

/** The column count each contract step promises. */
function expectedColumns(containerWidth: number): number {
  if (containerWidth >= CONTAINER_LG) return 3;
  if (containerWidth >= CONTAINER_MD) return 2;
  return 1;
}

/**
 * Contrast ratios read off the rendered page. Colours are resolved through a
 * canvas: the contract's values are OKLCH, and the browser is the only thing
 * that converts them exactly the way it painted them.
 */
async function textRatios(
  page: Page,
  state: "default" | "empty" | "error",
): Promise<Record<string, number>> {
  await showState(page, state);
  return page.evaluate(
    ({ state, selector }) => {
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

      const panel = document.querySelector(`[data-demo-state="${state}"]`);
      const block = panel?.querySelector(selector);
      if (!block) throw new Error(`the ${state} preview did not render`);

      const pick = (root: Element, css: string): Element => {
        const el = root.querySelector(css);
        if (!el) throw new Error(`missing ${css}`);
        return el;
      };
      const against = (el: Element) => ratio(getComputedStyle(el).color, surfaceOf(el));

      const ratios: Record<string, number> = {
        heading: against(pick(block, "h2")),
        headingDescription: against(pick(block, "h2 + p")),
        createLabel: against(pick(block, '[data-scope="button"]')),
      };

      if (state === "empty") {
        ratios.emptyTitle = against(pick(block, '[data-scope="card"][data-part="title"]'));
        ratios.emptyDescription = against(
          pick(block, '[data-scope="card"][data-part="description"]'),
        );
        return ratios;
      }
      if (state === "error") {
        ratios.failedTitle = against(pick(block, '[data-scope="alert"][data-part="title"]'));
        ratios.failedDescription = against(
          pick(block, '[data-scope="alert"][data-part="description"]'),
        );
        ratios.failedAction = against(pick(block, '[data-scope="alert"] [data-scope="button"]'));
        return ratios;
      }

      // One entry per badge variant, so a status whose tint is too light for
      // its own text fails by name.
      for (const card of block.querySelectorAll('ul > li [data-scope="card"][data-part="root"]')) {
        const badge = pick(card, '[data-scope="badge"][data-part="root"]');
        const variant = badge.getAttribute("data-variant") ?? "unknown";
        ratios[`${variant}Badge`] = against(badge);
        ratios[`${variant}Title`] = against(pick(card, '[data-part="title"]'));
        ratios[`${variant}Subtitle`] = against(pick(card, '[data-part="description"]'));
        ratios[`${variant}Initials`] = against(
          pick(card, '[data-scope="avatar"][data-part="fallback"]'),
        );
        ratios[`${variant}Meta`] = against(
          pick(card, '[data-part="content"] > span:not([data-scope])'),
        );
        ratios[`${variant}Open`] = against(pick(card, '[data-scope="button"]'));
      }
      return ratios;
    },
    { state, selector: BLOCK },
  );
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`grid-list — ${scheme}`, () => {
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
          if (block.columns !== null) {
            expect(block.columns, `${where}: columns`).toBe(expectedColumns(block.containerWidth));
          }
          if (block.cards > 0) {
            // All five badge variants ship in the sample set.
            expect(block.badges, `${where}: badges`).toEqual([
              "info",
              "error",
              "warning",
              "success",
              "neutral",
              "info",
            ]);
          }

          // The 50rem frame scrolls inside itself; the panel holding the demo
          // never pushes the page sideways.
          const panel = await page.evaluate((state) => {
            const el = document
              .querySelector(`[data-demo-state="${state}"]`)!
              .closest(".preview-panel--demo") as HTMLElement;
            return { scroll: el.scrollWidth, client: el.clientWidth };
          }, state);
          expect(panel.scroll, `${where}: demo panel overflow`).toBeLessThanOrEqual(panel.client);
        }

        const grids = blocks.filter((block) => block.cards > 0);
        expect(grids.length, `${scheme} ${width}px: copies rendering the grid`).toBe(5);
        for (const grid of grids) expect(grid.cards).toBe(6);
        expect(blocks.filter((block) => block.emptyCard).length, "the empty render").toBe(1);
        expect(
          blocks.filter((block) => block.skeletonCards === 3).length,
          "the loading render",
        ).toBe(1);
        expect(
          blocks.filter((block) => block.gridLevelAlert).length,
          "the failed-load render",
        ).toBe(1);
        expect(grids.filter((block) => block.allControlsInert).length, "the disabled render").toBe(
          1,
        );

        // Each step is exercised on both sides at every viewport, so a step that
        // silently stopped firing cannot pass this file.
        const containerWidths = grids.map((b) => b.containerWidth);
        for (const step of [CONTAINER_SM, CONTAINER_MD, CONTAINER_LG]) {
          expect(
            containerWidths.some((w) => w < step),
            `a copy under ${step}px`,
          ).toBe(true);
          expect(
            containerWidths.some((w) => w >= step),
            `a copy over ${step}px`,
          ).toBe(true);
        }
      });
    }

    test("clears AA contrast on every text it paints", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      let ratios: Record<string, number> = {};
      for (const state of ["default", "empty", "error"] as const) {
        ratios = { ...ratios, ...(await textRatios(page, state)) };
      }
      for (const variant of ["neutral", "info", "success", "warning", "error"]) {
        expect(ratios[`${variant}Badge`], `${scheme}: ${variant} card measured`).toBeDefined();
      }
      for (const [what, ratio] of Object.entries(ratios)) {
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
      }
    });

    test("names the card in every Open button's accessible name", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const names = await page.evaluate((selector) => {
        const section = document.querySelector(`[data-demo-state="default"] ${selector}`)!;
        return [...section.querySelectorAll('ul > li [data-scope="card"][data-part="root"]')].map(
          (card) => ({
            name: card.querySelector('[data-scope="button"]')?.getAttribute("aria-label") ?? "",
            title: card.querySelector('[data-part="title"]')?.textContent?.trim() ?? "",
          }),
        );
      }, BLOCK);
      expect(names).toHaveLength(6);
      for (const { name, title } of names) {
        expect(name).toBe(`Open ${title}`);
      }
    });

    test("announces the loading grid once, not each skeleton", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const region = page.locator(`[data-demo-state="loading"] ${BLOCK} [role="status"]`);
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region).toContainText("Loading projects");
      const hidden = await region.evaluate((el) =>
        [...el.querySelectorAll(':scope > [data-scope="card"]')].every(
          (card) => card.getAttribute("aria-hidden") === "true",
        ),
      );
      expect(hidden).toBe(true);
    });
  });
}
