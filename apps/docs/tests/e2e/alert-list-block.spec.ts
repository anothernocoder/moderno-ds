/**
 * The alert-list block, checked where it is actually shown to a reader: the
 * built docs page, at the three widths of the responsive policy (375 / 768 /
 * 1280) in both colour schemes.
 *
 * This is the seam that replaces a screenshot baseline for this block. The
 * pixel baselines were dropped from this repo (see `playwright.config.ts`)
 * because almost every PR invalidated them; what those PNGs were actually
 * guarding — "does each container step fire at the right width, is every state
 * on screen, and is the text still legible in both schemes?" — is a
 * computed-style fact, and asking the browser for it directly is both cheaper
 * and more precise than diffing images. It commits no artifact and cannot
 * conflict between branches.
 *
 * Three claims:
 *
 * 1. **Container, not viewport** — per scheme *and* per viewport width, because
 *    the whole claim is that the viewport does not decide. The header lines up
 *    at `--container-sm`, each dismiss control grows its label at
 *    `--container-md`, and each timestamp moves to the trailing edge at
 *    `--container-lg`. Every mounted copy is measured against its own container
 *    width, so the drawer figure stays stacked at 1280 while the wide figure has
 *    already crossed all three steps.
 * 2. **Every state renders what it claims**, at every width: the four status
 *    variants in the default list, a card instead of a list when it is empty, a
 *    busy region instead of the list while it loads, one alert with a retry when
 *    the list failed, and a list whose every control is inert when disabled.
 * 3. **AA contrast** — per scheme only, at the default viewport: the heading,
 *    the alert titles and descriptions, the timestamps, every control label and
 *    the empty/loading/error copy clear 4.5:1 against the surface behind them.
 *    Contrast is a colour fact, so it does not vary with width.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/alert-list/";

interface BlockMetrics {
  /** Width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** `display` of the header row: `grid` stacked, `flex` once it lines up. */
  headerDisplay: string;
  /** Whether this copy renders the list (rather than the empty/loading/error stand-in). */
  hasList: boolean;
  /** Whether the first row's dismiss control shows its text label. */
  dismissLabelShown: boolean | null;
  /** Whether the first row's timestamp sits after its title rather than under it. */
  metaBeside: boolean | null;
  /** The status variants the rows render, in order. */
  variants: string[];
  /** Whether every control in this copy is disabled. */
  allControlsInert: boolean;
  /** Whether this copy stands in a busy region for the list. */
  busyRegion: boolean;
  /** Whether this copy renders the "caught up" card. */
  emptyCard: boolean;
  /** Whether this copy renders a list-level alert (the failed-load stand-in). */
  listLevelAlert: boolean;
}

/** Every mounted copy of the block on the page, in document order. */
async function blockMetrics(page: Page): Promise<BlockMetrics[]> {
  return page.evaluate(() => {
    const panel = document.querySelector(".preview-panel--demo");
    if (!panel) throw new Error("no .preview-panel--demo on the page");
    return [...panel.querySelectorAll("section.moderno-block-alert-list")].map((section) => {
      const shell = section.firstElementChild;
      const header = shell?.firstElementChild;
      if (!shell || !header) throw new Error("the alert-list block did not render its own markup");

      const list = shell.querySelector("ul");
      const rows = list ? [...list.querySelectorAll("li")] : [];
      const buttons = [...section.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];

      let dismissLabelShown: boolean | null = null;
      let metaBeside: boolean | null = null;
      const first = rows[0];
      if (first) {
        const alert = first.querySelector('[data-scope="alert"][data-part="root"]');
        if (!alert) throw new Error("a row rendered no Alert");
        // The dismiss control is the Alert root's own trailing child; the row's
        // action, when it has one, lives inside the content column instead.
        const dismiss = alert.querySelector(':scope > [data-scope="button"]');
        const label = dismiss?.lastElementChild;
        if (!label) throw new Error("the row rendered no dismiss control");
        dismissLabelShown = getComputedStyle(label).display !== "none";

        const titleRow = alert.querySelector('[data-part="content"] > div');
        const title = titleRow?.querySelector('[data-part="title"]');
        const meta = titleRow?.querySelector('[data-part="description"]');
        if (!title || !meta) throw new Error("the row rendered no title or timestamp");
        metaBeside = meta.getBoundingClientRect().left >= title.getBoundingClientRect().right - 1;
      }

      const alerts = [...section.querySelectorAll('[data-scope="alert"][data-part="root"]')];

      return {
        containerWidth: section.getBoundingClientRect().width,
        headerDisplay: getComputedStyle(header).display,
        hasList: rows.length > 0,
        dismissLabelShown,
        metaBeside,
        variants: rows.map((row) => {
          const alert = row.querySelector('[data-scope="alert"][data-part="root"]');
          return alert?.getAttribute("data-variant") ?? "";
        }),
        allControlsInert: buttons.length > 0 && buttons.every((button) => button.disabled),
        busyRegion: section.querySelector('[role="status"][aria-busy="true"]') !== null,
        emptyCard:
          !list &&
          section
            .querySelector('[data-scope="card"][data-part="title"]')
            ?.textContent?.includes("caught up") === true,
        listLevelAlert: !list && alerts.length > 0,
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
    const blocks = [...panel.querySelectorAll("section.moderno-block-alert-list")];
    const withList = blocks.find((section) => section.querySelector("ul li"));
    const empty = blocks.find((section) =>
      section
        .querySelector('[data-scope="card"][data-part="title"]')
        ?.textContent?.includes("caught up"),
    );
    const busy = blocks.find((section) => section.querySelector('[role="status"]'));
    const failed = blocks.find(
      (section) =>
        !section.querySelector("ul") &&
        section.querySelector('[data-scope="alert"][data-part="root"]'),
    );
    if (!withList || !empty || !busy || !failed) {
      throw new Error("the alert-list demo did not render all of its states");
    }

    const pick = <T extends Element>(root: Element, selector: string): T => {
      const el = root.querySelector<T>(selector);
      if (!el) throw new Error(`missing ${selector}`);
      return el;
    };

    const against = (el: Element) => ratio(getComputedStyle(el).color, surfaceOf(el));
    const rows = [...withList.querySelectorAll("ul li")];

    const ratios: Record<string, number> = {
      heading: against(pick(withList, "h2")),
      headingDescription: against(pick(withList, "p")),
      dismissAllLabel: against(pick(withList, '[data-scope="button"]')),
      emptyTitle: against(pick(empty, '[data-scope="card"][data-part="title"]')),
      emptyDescription: against(pick(empty, '[data-scope="card"][data-part="description"]')),
      loadingText: against(pick(busy, "p")),
      failedTitle: against(pick(failed, '[data-scope="alert"][data-part="title"]')),
      failedDescription: against(pick(failed, '[data-scope="alert"][data-part="description"]')),
      failedAction: against(pick(failed, '[data-scope="alert"] [data-scope="button"]')),
    };

    // One entry per status, so a variant whose tint is too light for its own
    // text fails by name rather than hiding behind the other three.
    for (const row of rows) {
      const alert = row.querySelector('[data-scope="alert"][data-part="root"]');
      if (!alert) continue;
      const status = alert.getAttribute("data-variant") ?? "unknown";
      ratios[`${status}Title`] = against(pick(alert, '[data-part="title"]'));
      ratios[`${status}Description`] = against(
        pick(alert, '[data-part="content"] > [data-part="description"]'),
      );
      ratios[`${status}Meta`] = against(
        pick(alert, '[data-part="content"] > div > [data-part="description"]'),
      );
      ratios[`${status}Dismiss`] = against(pick(alert, ':scope > [data-scope="button"]'));
      const action = alert.querySelector('[data-part="action"] [data-scope="button"]');
      if (action) ratios[`${status}Action`] = against(action);
    }

    return ratios;
  });
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`alert-list — ${scheme}`, () => {
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
        // The demo mounts the block eight times: four container widths (a
        // drawer, a panel, the page column and a wide stage, one on each side
        // of every step), then the empty, loading, error and disabled states.
        expect(blocks).toHaveLength(8);

        for (const [index, block] of blocks.entries()) {
          const where = `${scheme} ${width}px, copy ${index + 1} (${block.containerWidth}px)`;
          // Every step is answered from the block's own container, so the
          // answers differ between the figures at one viewport — which is the
          // whole point of ADR-0005.
          expect(block.headerDisplay, `${where}: header row`).toBe(
            block.containerWidth >= CONTAINER_SM ? "flex" : "grid",
          );
          if (block.hasList) {
            expect(block.dismissLabelShown, `${where}: dismiss label`).toBe(
              block.containerWidth >= CONTAINER_MD,
            );
            expect(block.metaBeside, `${where}: timestamp`).toBe(
              block.containerWidth >= CONTAINER_LG,
            );
            // A list is a list because the statuses differ: all four ship in
            // the sample feed, most urgent first.
            expect(block.variants, `${where}: statuses`).toEqual([
              "error",
              "warning",
              "info",
              "success",
            ]);
          }
        }

        // The states, each identified by what it renders rather than by its
        // position, so reordering the demo cannot quietly drop one.
        const lists = blocks.filter((block) => block.hasList);
        expect(lists.length, `${scheme} ${width}px: copies rendering the list`).toBe(5);
        expect(
          blocks.filter((block) => block.emptyCard).length,
          `${scheme} ${width}px: the empty render`,
        ).toBe(1);
        expect(
          blocks.filter((block) => block.busyRegion).length,
          `${scheme} ${width}px: the loading render`,
        ).toBe(1);
        expect(
          blocks.filter((block) => block.listLevelAlert).length,
          `${scheme} ${width}px: the failed-load render`,
        ).toBe(1);
        // Exactly one copy is `disabled`: the four container figures and the
        // states that render no list leave their controls live.
        expect(
          lists.filter((block) => block.allControlsInert).length,
          `${scheme} ${width}px: the disabled render`,
        ).toBe(1);

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
        const widths = lists.map((b) => b.containerWidth);
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
      // All four statuses reached the assertions, not just whichever came first.
      for (const status of ["info", "success", "warning", "error"]) {
        expect(ratios[`${status}Title`], `${scheme}: ${status} row measured`).toBeDefined();
      }
      for (const [what, ratio] of Object.entries(ratios)) {
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
      }
    });

    test("names the alert in every dismiss control's accessible name", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      // The label is a glyph below `--container-md` and a word above it, so the
      // only thing that identifies the row at every width is the accessible
      // name — and WCAG's "label in name" needs the visible word inside it.
      const names = await page.evaluate(() => {
        const panel = document.querySelector(".preview-panel--demo")!;
        const section = [...panel.querySelectorAll("section.moderno-block-alert-list")].find((el) =>
          el.querySelector("ul li"),
        )!;
        return [...section.querySelectorAll("ul li")].map((row) => {
          const alert = row.querySelector('[data-scope="alert"][data-part="root"]')!;
          const dismiss = alert.querySelector(':scope > [data-scope="button"]')!;
          return {
            name: dismiss.getAttribute("aria-label") ?? "",
            title: alert.querySelector('[data-part="title"]')?.textContent?.trim() ?? "",
          };
        });
      });
      expect(names).toHaveLength(4);
      for (const { name, title } of names) {
        expect(name).toContain("Dismiss");
        expect(name).toContain(title);
      }
    });
  });
}
