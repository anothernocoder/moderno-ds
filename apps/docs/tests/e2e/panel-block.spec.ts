/**
 * The panel block, checked on the built docs page at the three widths of the
 * responsive policy (375 / 768 / 1280) in both colour schemes. It asserts text
 * and computed styles, never pixels (see `playwright.config.ts`).
 *
 * Three claims:
 *
 * 1. **Container, not viewport**: below `--container-sm` each action spans its
 *    panel, from it the action shrinks to its label; from `--container-md` two
 *    panels share a row and the heading grows; from `--container-lg` the gaps
 *    widen. Each copy is measured against its own container width.
 * 2. **Every state renders what it claims**: four panels, each action naming
 *    its panel; a card when there are none; placeholders in a busy region
 *    while loading; one alert with a retry when the load failed; and inert
 *    buttons when disabled.
 * 3. **AA contrast** on every text the block paints, per scheme.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/panel/";

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
  /** Whether the heading is set at `--text-heading-sm` rather than `--text-body-lg`. */
  largeHeading: boolean;
  /** How many panels (or placeholders) share the first row of the grid. */
  perRow: number | null;
  /** Whether the first panel's action spans its footer. */
  fullWidthAction: boolean | null;
  /** Whether the grid's gap is the wide step (`--spacing` × 4) rather than × 3. */
  wideGap: boolean | null;
  /** Each panel's action label, in order. */
  actions: string[];
  /** Whether every button in this copy is disabled. */
  allButtonsInert: boolean;
  /** Placeholder panels inside a busy `status` region. */
  busyPlaceholders: number;
  /** Whether this copy renders the "Nothing to set up yet" card. */
  emptyCard: boolean;
  /** Whether this copy renders the failed-load alert with its retry. */
  failedLoad: boolean;
}

async function showState(page: Page, state: State): Promise<void> {
  const block = page.locator(`[data-demo-state="${state}"] section.moderno-block-panel`);
  await block.scrollIntoViewIfNeeded();
  await block.waitFor({ state: "visible" });
}

async function blockMetrics(page: Page, state: State): Promise<BlockMetrics[]> {
  return page.evaluate((state) => {
    const panel = document.querySelector(`[data-demo-state="${state}"]`);
    if (!panel) throw new Error(`no preview for the ${state} state on the page`);
    return [...panel.querySelectorAll("section.moderno-block-panel")].map((section) => {
      const heading = section.querySelector("h2");
      if (!heading) throw new Error("the panel block did not render its own markup");

      const probe = document.createElement("span");
      probe.style.cssText = "font-size:var(--text-heading-sm);column-gap:calc(var(--spacing) * 4)";
      section.append(probe);
      const large = getComputedStyle(probe).fontSize;
      const wide = getComputedStyle(probe).columnGap;
      probe.remove();

      const list = section.querySelector("ul");
      const busy = section.querySelector('[role="status"][aria-busy="true"]');
      const grid = list ?? busy;
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

      let fullWidthAction: boolean | null = null;
      const footer = list?.querySelector('[data-scope="card"][data-part="footer"]');
      const action = footer?.querySelector('[data-scope="button"]');
      if (footer && action) {
        const style = getComputedStyle(footer);
        const inner =
          footer.getBoundingClientRect().width -
          parseFloat(style.paddingLeft) -
          parseFloat(style.paddingRight);
        fullWidthAction = Math.abs(action.getBoundingClientRect().width - inner) < 1;
      }

      const buttons = [...section.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];
      const alert = section.querySelector('[data-scope="alert"][data-part="root"]');

      return {
        containerWidth: section.getBoundingClientRect().width,
        largeHeading: getComputedStyle(heading).fontSize === large,
        perRow,
        fullWidthAction,
        wideGap: grid ? getComputedStyle(grid).rowGap === wide : null,
        actions: list
          ? [...list.querySelectorAll('[data-scope="button"]')].map(
              (button) => button.textContent?.trim() ?? "",
            )
          : [],
        allButtonsInert: buttons.length > 0 && buttons.every((button) => button.disabled),
        busyPlaceholders: busy ? busy.querySelectorAll(':scope > [data-scope="card"]').length : 0,
        emptyCard:
          !list &&
          section
            .querySelector('[data-scope="card"][data-part="title"]')
            ?.textContent?.includes("Nothing to set up yet") === true,
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
      `[data-demo-state="${state}"] section.moderno-block-panel`,
    );
    if (!block) throw new Error(`the ${state} panel demo did not render`);

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
    };
    for (const item of block.querySelectorAll("ul li")) {
      const title = pick(item, '[data-scope="card"][data-part="title"]');
      const name = title.textContent?.trim() ?? "panel";
      ratios[`${name} title`] = against(title);
      ratios[`${name} description`] = against(
        pick(item, '[data-scope="card"][data-part="description"]'),
      );
      ratios[`${name} action`] = against(pick(item, '[data-scope="button"]'));
    }
    return ratios;
  }, state);
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`panel — ${scheme}`, () => {
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

          expect(block.largeHeading, `${where}: heading size`).toBe(
            block.containerWidth >= CONTAINER_MD,
          );
          if (block.perRow !== null) {
            expect(block.perRow, `${where}: panels a row`).toBe(
              block.containerWidth >= CONTAINER_MD ? 2 : 1,
            );
          }
          if (block.wideGap !== null) {
            expect(block.wideGap, `${where}: gap`).toBe(block.containerWidth >= CONTAINER_LG);
          }
          if (block.fullWidthAction !== null) {
            expect(block.fullWidthAction, `${where}: action width`).toBe(
              block.containerWidth < CONTAINER_SM,
            );
            // A screen reader lists the buttons without their cards, so each
            // label names its panel.
            expect(block.actions, `${where}: actions`).toEqual([
              "Edit profile",
              "Manage notifications",
              "View billing",
              "Review security",
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

        const lists = blocks.filter((block) => block.actions.length > 0);
        expect(lists.length, `${scheme} ${width}px: copies rendering the panels`).toBe(5);
        expect(blocks.filter((block) => block.emptyCard).length, "the empty render").toBe(1);
        expect(
          blocks.filter((block) => block.busyPlaceholders === 4).length,
          "the loading render: four placeholder panels",
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

    test("shows a focus ring on a panel's action from the keyboard", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      await page.locator('[data-demo-state="default"] section.moderno-block-panel h2').click();
      await page.keyboard.press("Tab");
      const focused = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        const style = getComputedStyle(el);
        return {
          label: el.textContent?.trim(),
          visible: el.matches(":focus-visible"),
          outline: style.outlineStyle,
        };
      });
      expect(focused).toEqual({ label: "Edit profile", visible: true, outline: "solid" });
    });

    test("clears AA contrast on every text it paints", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      const ratios = await contrastRatios(page);
      for (const label of ["Profile", "Notifications", "Billing", "Security"]) {
        expect(ratios[`${label} action`], `${scheme}: ${label} measured`).toBeDefined();
      }
      for (const [what, ratio] of Object.entries(ratios)) {
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
      }
    });
  });
}
