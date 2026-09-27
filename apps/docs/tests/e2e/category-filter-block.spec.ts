/**
 * The category-filter block, checked on the built docs page at the three
 * widths of the responsive policy (375 / 768 / 1280) in both colour schemes.
 * It asserts text and computed styles; no screenshot baseline is committed.
 *
 * Seven claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` the Filters button
 *    fills its row under the heading; from `--container-sm` it sits beside the
 *    heading; from `--container-md` the sidebar replaces it beside the
 *    products and the heading steps up a size; from `--container-lg` the
 *    sidebar widens and the block gets more room above and below. Each copy on
 *    the page is measured against its own container width.
 * 2. **Every state renders what it claims**, at every width: the facets, their
 *    options with counts and the price range by default; the empty message;
 *    placeholders in one busy region while loading; an error Alert with a retry;
 *    every control off when disabled. The consumer's products sit beside or
 *    under the filters in every copy.
 * 3. **The drawer slides in from the left** below `--container-md`: pinned to
 *    the viewport's left edge, as tall as the viewport, as wide as it up to
 *    `--container-sm`, holding the same filters and each state, with Clear all
 *    and Show results at its foot.
 * 4. **Centred** in every Preview.
 * 5. **AA contrast** in both schemes on every text the block paints, the
 *    drawer included, and 3:1 on each chevron.
 * 6. **Hover and focus-visible** on a facet, a checkbox, a price thumb, Clear
 *    all and the Filters button.
 * 7. **Filtering works end to end**: checking options and moving the price
 *    narrows the demo's products, the Filters button counts what is active,
 *    Clear all resets everything, the drawer and the sidebar share one state,
 *    the drawer hands focus back when it closes, and a retry clears the error.
 */
import { expect, test, type Locator, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The sidebar's two widths, `w-48` and `w-60` on the spacing scale, in px. */
const SIDEBAR_MD = 192;
const SIDEBAR_LG = 240;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/category-filter/";

const BLOCK = "section.moderno-block-category-filter";
const SIDEBAR = 'aside[aria-label="Filters"]';

/** The copy the block ships with, and the demo's facets. */
const HEADING = "New arrivals";
const DESCRIPTION = "Stoneware, porcelain and glass, made by hand in small batches.";
const FACETS = ["Category", "Colour", "Material", "Price"];
const OPTIONS = [
  "Mugs",
  "Bowls",
  "Plates",
  "Vases",
  "Sage",
  "Oat",
  "Charcoal",
  "Clay",
  "Stoneware",
  "Porcelain",
  "Glass",
];
const COUNTS = ["3", "3", "3", "3", "4", "3", "3", "2", "5", "4", "3"];
const FULL_RANGE = "€0 – €200";
const EMPTY = "No filters for this category.";
const ERROR = "We could not load the filters.";
const DRAWER = "Filters";

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  heading: string | null;
  headingSize: number | null;
  serifHeading: boolean | null;
  description: string | null;
  /** The header row's display: `grid` stacked, `flex` with the button beside the heading. */
  headerDisplay: string;
  /** The Filters button's display (`none` once the sidebar shows), text and state. */
  buttonDisplay: string;
  buttonText: string;
  buttonDisabled: boolean;
  buttonOpensDialog: boolean;
  /** Whether the Filters button spans the header row's content box. */
  buttonFillsRow: boolean;
  sidebarDisplay: string;
  sidebarWidth: number;
  /** Whether the sidebar sits beside the products (same top, to its left). */
  sidebarBeside: boolean;
  paddingTop: number;
  facets: string[];
  headedFacets: number;
  chevrons: number;
  openFacets: number;
  options: string[];
  counts: string[];
  valueText: string | null;
  thumbs: string[];
  allOptionsDisabled: boolean;
  allOptionsLive: boolean;
  thumbsDisabled: boolean;
  clearDisabled: boolean;
  placeholders: number;
  alert: string | null;
  retry: string | null;
  empty: string | null;
  /** The consumer's products, read from the demo's count line. */
  results: string | null;
}

/**
 * The page's previews (islands/CategoryFilterBlockDemo.svelte): the main
 * preview mounts the live default; the Examples frame the same block at
 * 18rem, 30rem, 40rem and 50rem, then mount the empty, loading, error and
 * disabled states. Every copy is found by the `data-demo-state` its wrapper
 * carries.
 */
const STATES = [
  "default",
  "narrow",
  "compact",
  "panel",
  "wide",
  "empty",
  "loading",
  "error",
  "disabled",
] as const;
type State = (typeof STATES)[number];

function block(page: Page, state: State): Locator {
  return page.locator(`[data-demo-state="${state}"] ${BLOCK}`);
}

async function showState(page: Page, state: State): Promise<void> {
  const copy = block(page, state);
  await copy.scrollIntoViewIfNeeded();
  await copy.waitFor({ state: "visible" });
}

async function blockMetrics(page: Page, state: State): Promise<BlockMetrics[]> {
  return page.evaluate(
    ({ state, selector, sidebarSelector }) => {
      const wrapper = document.querySelector(`[data-demo-state="${state}"]`);
      if (!wrapper) throw new Error(`no preview for the ${state} state on the page`);
      const normalise = (family: string) => family.replace(/["'\s]/g, "");
      const serif = normalise(
        getComputedStyle(document.documentElement).getPropertyValue("--font-serif"),
      );
      const text = (el: Element | null | undefined) =>
        el?.textContent?.replace(/\s+/g, " ").trim() ?? "";

      return [...wrapper.querySelectorAll<HTMLElement>(selector)].map((section) => {
        const inner = section.firstElementChild as HTMLElement;
        const header = inner.children[0] as HTMLElement;
        const body = inner.children[1] as HTMLElement;
        const heading = section.querySelector("h2");
        const description = header.querySelector("h2 + p");
        const button = header.querySelector<HTMLButtonElement>('button[aria-haspopup="dialog"]')!;
        const sidebar = section.querySelector<HTMLElement>(sidebarSelector)!;
        const results = body.lastElementChild as HTMLElement;
        const triggers = [
          ...sidebar.querySelectorAll<HTMLButtonElement>(
            '[data-scope="accordion"][data-part="item-trigger"]',
          ),
        ];
        const checkboxes = [
          ...sidebar.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'),
        ];
        const thumbs = [...sidebar.querySelectorAll<HTMLElement>('[role="slider"]')];
        const busy = sidebar.querySelector('[role="status"][aria-busy="true"]');
        const alert = sidebar.querySelector('[data-scope="alert"][role="alert"]');
        const clear = [...sidebar.querySelectorAll<HTMLButtonElement>("button")].find(
          (b) => text(b) === "Clear all",
        )!;
        const headerStyle = getComputedStyle(header);
        const headerContent =
          header.clientWidth -
          parseFloat(headerStyle.paddingLeft) -
          parseFloat(headerStyle.paddingRight);
        const sidebarBox = sidebar.getBoundingClientRect();
        const resultsBox = results.getBoundingClientRect();

        return {
          containerWidth: section.offsetWidth,
          heading: heading ? text(heading) : null,
          headingSize: heading ? parseFloat(getComputedStyle(heading).fontSize) : null,
          serifHeading: heading ? normalise(getComputedStyle(heading).fontFamily) === serif : null,
          description: description ? text(description) : null,
          headerDisplay: headerStyle.display,
          buttonDisplay: getComputedStyle(button).display,
          buttonText: text(button),
          buttonDisabled: button.disabled,
          buttonOpensDialog: button.getAttribute("aria-haspopup") === "dialog",
          buttonFillsRow: Math.abs(button.offsetWidth - headerContent) < 1,
          sidebarDisplay: getComputedStyle(sidebar).display,
          sidebarWidth: sidebarBox.width,
          sidebarBeside:
            sidebarBox.width > 0 &&
            Math.abs(sidebarBox.top - resultsBox.top) < 1 &&
            sidebarBox.right <= resultsBox.left,
          paddingTop: parseFloat(getComputedStyle(inner).paddingTop),
          facets: triggers.map((t) => text(t)),
          headedFacets: triggers.filter((t) => t.parentElement?.tagName === "H3").length,
          chevrons: triggers.filter((t) =>
            t.querySelector('[data-part="item-indicator"] svg[aria-hidden="true"] path'),
          ).length,
          openFacets: triggers.filter((t) => t.getAttribute("aria-expanded") === "true").length,
          options: [...sidebar.querySelectorAll('[data-scope="checkbox"][data-part="label"]')].map(
            (l) => text(l),
          ),
          counts: [
            ...sidebar.querySelectorAll(
              '[data-scope="checkbox"][data-part="root"] > .tabular-nums',
            ),
          ].map((c) => text(c)),
          valueText:
            text(sidebar.querySelector('[data-scope="slider"][data-part="value-text"]')) || null,
          thumbs: thumbs.map((t) => t.getAttribute("aria-label") ?? ""),
          allOptionsDisabled: checkboxes.length > 0 && checkboxes.every((c) => c.disabled),
          allOptionsLive: checkboxes.length > 0 && checkboxes.every((c) => !c.disabled),
          thumbsDisabled:
            thumbs.length > 0 && thumbs.every((t) => t.getAttribute("aria-disabled") === "true"),
          clearDisabled: clear.disabled,
          placeholders: busy ? busy.querySelectorAll('[data-scope="skeleton"]').length : 0,
          alert: alert ? text(alert.querySelector('[data-part="title"]')) : null,
          retry: alert ? text(alert.querySelector("button")) : null,
          empty: text(sidebar.querySelector("p.border-dashed")) || null,
          results: text(results.querySelector('[aria-live="polite"]')) || null,
        };
      });
    },
    { state, selector: BLOCK, sidebarSelector: SIDEBAR },
  );
}

/**
 * Contrast ratios read off the rendered page. Colours are resolved through a
 * canvas: the contract's values are OKLCH, and the browser is the only thing
 * that converts them exactly the way it painted them.
 */
async function textRatios(
  root: Locator,
  targets: Record<string, string>,
): Promise<Record<string, number>> {
  return root.evaluate((element, targets) => {
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

    const ratios: Record<string, number> = {};
    for (const [name, css] of Object.entries(targets)) {
      const matches = [...element.querySelectorAll(css)];
      if (matches.length === 0) throw new Error(`missing ${css}`);
      for (const [index, el] of matches.entries()) {
        const label = el.textContent?.replace(/\s+/g, " ").trim() || String(index);
        ratios[`${name} "${label}"`] = ratio(getComputedStyle(el).color, surfaceOf(el));
      }
    }
    return ratios;
  }, targets);
}

/** The Filters button of the copy mounted for `state`. */
function filtersButton(page: Page, state: State): Locator {
  return block(page, state).locator('button[aria-haspopup="dialog"]');
}

/** Open the drawer of the copy mounted for `state` and return it. */
async function openDrawer(page: Page, state: State): Promise<Locator> {
  await showState(page, state);
  await filtersButton(page, state).click();
  const drawer = page.getByRole("dialog", { name: DRAWER });
  await expect(drawer).toBeVisible();
  return drawer;
}

async function closeDrawer(page: Page, drawer: Locator): Promise<void> {
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`category-filter — ${scheme}`, () => {
    test.use({ colorScheme: scheme });

    for (const width of WIDTHS) {
      test(`lays itself out from its container at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1200 });
        await page.goto(PAGE, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready.then(() => true));

        expect(await page.evaluate(() => document.documentElement.classList.contains("dark"))).toBe(
          scheme === "dark",
        );

        const blocks: Array<BlockMetrics & { state: State }> = [];
        for (const state of STATES) {
          await showState(page, state);
          const mounted = await blockMetrics(page, state);
          expect(mounted, `${state}: mounted copies`).toHaveLength(1);
          const copy = mounted[0]!;
          blocks.push({ ...copy, state });
          const where = `${scheme} ${width}px, ${state} (${copy.containerWidth}px)`;
          const sidebarShown = copy.containerWidth >= CONTAINER_MD;

          expect(copy.heading, `${where}: heading`).toBe(HEADING);
          expect(copy.serifHeading, `${where}: serif heading`).toBe(true);
          expect(copy.description, `${where}: description`).toBe(DESCRIPTION);
          expect(copy.headerDisplay, `${where}: button beside the heading`).toBe(
            copy.containerWidth >= CONTAINER_SM ? "flex" : "grid",
          );
          expect(copy.buttonDisplay === "none", `${where}: Filters button hidden`).toBe(
            sidebarShown,
          );
          expect(copy.sidebarDisplay === "none", `${where}: sidebar hidden`).toBe(!sidebarShown);
          if (!sidebarShown) {
            expect(copy.buttonOpensDialog, `${where}: Filters opens a dialog`).toBe(true);
            expect(copy.buttonText, `${where}: Filters text`).toBe("Filters");
            expect(copy.buttonFillsRow, `${where}: Filters fills its row`).toBe(
              copy.containerWidth < CONTAINER_SM,
            );
          } else {
            expect(copy.sidebarBeside, `${where}: sidebar beside the products`).toBe(true);
            expect(copy.sidebarWidth, `${where}: sidebar width`).toBeCloseTo(
              copy.containerWidth >= CONTAINER_LG ? SIDEBAR_LG : SIDEBAR_MD,
              0,
            );
          }
          expect(copy.paddingTop, `${where}: room above`).toBe(
            copy.containerWidth >= CONTAINER_LG ? 64 : 48,
          );
          expect(copy.results, `${where}: the consumer's products`).toMatch(/^\d+ products?$/);
          expect(copy.buttonDisabled, `${where}: Filters disabled`).toBe(state === "disabled");

          if (state === "loading") {
            expect(copy.placeholders, `${where}: placeholders`).toBe(9);
            expect(copy.facets, `${where}: no facets while loading`).toEqual([]);
          } else if (state === "empty") {
            expect(copy.empty, `${where}: empty message`).toBe(EMPTY);
            expect(copy.facets, `${where}: no facets`).toEqual([]);
          } else if (state === "error") {
            expect(copy.alert, `${where}: error title`).toBe(ERROR);
            expect(copy.retry, `${where}: retry`).toBe("Try again");
            expect(copy.facets, `${where}: no facets`).toEqual([]);
          } else {
            expect(copy.facets, `${where}: facets`).toEqual(FACETS);
            expect(copy.headedFacets, `${where}: every facet is an h3`).toBe(FACETS.length);
            expect(copy.chevrons, `${where}: one hidden chevron per facet`).toBe(FACETS.length);
            expect(copy.openFacets, `${where}: every facet starts open`).toBe(FACETS.length);
            expect(copy.options, `${where}: options`).toEqual(OPTIONS);
            expect(copy.counts, `${where}: counts`).toEqual(COUNTS);
            expect(copy.valueText, `${where}: price range`).toBe(FULL_RANGE);
            expect(copy.thumbs, `${where}: thumbs named`).toEqual([
              "Minimum price",
              "Maximum price",
            ]);
            expect(copy.clearDisabled, `${where}: nothing to clear`).toBe(true);
            expect(copy.empty, `${where}: no empty message`).toBeNull();
            expect(copy.alert, `${where}: no alert`).toBeNull();
          }

          const panel = await page.evaluate((state) => {
            const el = document
              .querySelector(`[data-demo-state="${state}"]`)!
              .closest(".preview-panel--demo") as HTMLElement;
            return { scroll: el.scrollWidth, client: el.clientWidth };
          }, state);
          expect(panel.scroll, `${where}: demo panel overflow`).toBeLessThanOrEqual(panel.client);
        }

        expect(
          blocks.filter((b) => b.allOptionsDisabled).map((b) => b.state),
          "the disabled render",
        ).toEqual(["disabled"]);
        expect(
          blocks.filter((b) => b.thumbsDisabled).map((b) => b.state),
          "disabled price",
        ).toEqual(["disabled"]);
        expect(
          blocks.filter((b) => b.allOptionsLive).map((b) => b.state),
          "every other render with options",
        ).toEqual(["default", "narrow", "compact", "panel", "wide"]);

        // The heading steps up at `--container-md`.
        const below = new Set(
          blocks.filter((b) => b.containerWidth < CONTAINER_MD).map((b) => b.headingSize),
        );
        const above = new Set(
          blocks.filter((b) => b.containerWidth >= CONTAINER_MD).map((b) => b.headingSize),
        );
        expect(below.size, "one heading size below @md").toBe(1);
        expect(above.size, "one heading size from @md").toBe(1);
        expect([...above][0]!, "heading steps up at @md").toBeGreaterThan([...below][0]!);

        // Each step is exercised on both sides at every viewport, so a step that
        // silently stopped firing cannot pass this file.
        const containerWidths = blocks.map((b) => b.containerWidth);
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

        // Below `--container-md` the filters live in a Drawer from the left:
        // pinned to the left edge, full height, as wide as the viewport up to
        // `--container-sm`, with Clear all and Show results in a row at its foot.
        const drawer = await openDrawer(page, "narrow");
        await expect(drawer).toHaveAttribute("data-placement", "left");
        await expect.poll(() => drawer.evaluate((el) => el.getBoundingClientRect().left)).toBe(0);
        const layout = await drawer.evaluate((content) => {
          const rect = content.getBoundingClientRect();
          const buttons = [...content.querySelectorAll<HTMLElement>('[data-scope="button"]')];
          const clear = buttons.find((b) => b.textContent?.trim() === "Clear all")!;
          const show = buttons.find((b) => b.textContent?.trim() === "Show results")!;
          return {
            width: rect.width,
            top: rect.top,
            height: rect.height,
            viewport: window.innerHeight,
            facets: [
              ...content.querySelectorAll('[data-scope="accordion"][data-part="item-trigger"]'),
            ].map((t) => t.textContent?.trim()),
            inRow:
              Math.abs(clear.getBoundingClientRect().top - show.getBoundingClientRect().top) < 1,
            showLast: show.getBoundingClientRect().left >= clear.getBoundingClientRect().right,
            showVariant: show.getAttribute("data-variant"),
          };
        });
        const where = `${scheme} ${width}px, drawer`;
        expect(layout.width, `${where}: width`).toBeCloseTo(Math.min(width, CONTAINER_SM), 0);
        expect(layout.top, `${where}: top`).toBeCloseTo(0, 0);
        expect(layout.height, `${where}: full height`).toBeCloseTo(layout.viewport, 0);
        expect(layout.facets, `${where}: the same facets`).toEqual(FACETS);
        expect(layout.inRow, `${where}: buttons in a row`).toBe(true);
        expect(layout.showLast, `${where}: Show results last`).toBe(true);
        expect(layout.showVariant, `${where}: Show results is primary`).toBe("primary");
        await closeDrawer(page, drawer);
      });
    }

    test("renders each state inside its drawer", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 900 });
      await page.goto(PAGE, { waitUntil: "networkidle" });

      const loading = await openDrawer(page, "loading");
      const status = loading.locator('[role="status"][aria-busy="true"]');
      await expect(status).toContainText("Loading filters");
      await expect(status.locator('[data-scope="skeleton"]')).toHaveCount(9);
      await expect(loading.locator('[data-scope="accordion"]')).toHaveCount(0);
      await closeDrawer(page, loading);

      const empty = await openDrawer(page, "empty");
      await expect(empty.locator("p.border-dashed")).toHaveText(EMPTY);
      await closeDrawer(page, empty);

      const failed = await openDrawer(page, "error");
      await expect(failed.getByRole("alert")).toContainText(ERROR);
      await expect(failed.getByRole("button", { name: "Try again" })).toBeEnabled();
      await closeDrawer(page, failed);

      await showState(page, "disabled");
      await expect(filtersButton(page, "disabled")).toBeDisabled();
    });

    test("sits in the middle of its preview", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      for (const state of ["default", "empty", "loading", "error", "disabled"] as const) {
        await showState(page, state);
        const gaps = await page.evaluate(
          ({ state, selector }) => {
            const wrapper = document.querySelector(`[data-demo-state="${state}"]`)!;
            const panel = wrapper.closest(".preview-panel--demo")!.getBoundingClientRect();
            const section = wrapper.querySelector(selector)!;
            const content = [...section.firstElementChild!.children].map((el) =>
              el.getBoundingClientRect(),
            );
            const top = Math.min(...content.map((r) => r.top));
            const bottom = Math.max(...content.map((r) => r.bottom));
            const left = Math.min(...content.map((r) => r.left));
            const right = Math.max(...content.map((r) => r.right));
            return {
              above: top - panel.top,
              below: panel.bottom - bottom,
              before: left - panel.left,
              after: panel.right - right,
            };
          },
          { state, selector: BLOCK },
        );
        expect(Math.abs(gaps.above - gaps.below), `${scheme} ${state}: vertical`).toBeLessThan(2);
        expect(Math.abs(gaps.before - gaps.after), `${scheme} ${state}: horizontal`).toBeLessThan(
          2,
        );
      }
    });

    test("clears AA contrast on every text it paints", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const main = block(page, "default");
      // Something checked, so Clear all is live and measured as it reads.
      await main.locator(SIDEBAR).getByText("Mugs", { exact: true }).click();
      let ratios = await textRatios(main, {
        heading: "h2",
        description: "h2 + p",
        "sidebar label": `${SIDEBAR} > div > p`,
        facet: `${SIDEBAR} [data-part="item-trigger"]`,
        option: `${SIDEBAR} [data-scope="checkbox"][data-part="label"]`,
        count: `${SIDEBAR} [data-scope="checkbox"][data-part="root"] > .tabular-nums`,
        "price range": `${SIDEBAR} [data-scope="slider"][data-part="value-text"]`,
        "clear button": `${SIDEBAR} [data-variant="ghost"]`,
      });
      const chevrons = await textRatios(main, {
        chevron: `${SIDEBAR} [data-part="item-indicator"]`,
      });

      await showState(page, "narrow");
      ratios = {
        ...ratios,
        ...(await textRatios(block(page, "narrow"), {
          "filters button": 'button[aria-haspopup="dialog"]',
        })),
      };
      await showState(page, "empty");
      ratios = {
        ...ratios,
        ...(await textRatios(block(page, "empty"), { "empty message": "p.border-dashed" })),
      };
      await showState(page, "error");
      ratios = {
        ...ratios,
        ...(await textRatios(block(page, "error"), {
          "error title": `${SIDEBAR} [data-scope="alert"][data-part="title"]`,
          "error description": `${SIDEBAR} [data-scope="alert"][data-part="description"]`,
          "retry button": `${SIDEBAR} [data-scope="alert"] [data-scope="button"]`,
        })),
      };

      const drawer = await openDrawer(page, "narrow");
      await drawer.getByText("Oat", { exact: true }).click();
      ratios = {
        ...ratios,
        ...(await textRatios(drawer, {
          "drawer title": '[data-part="title"]',
          "drawer facet": '[data-part="item-trigger"]',
          "drawer option": '[data-scope="checkbox"][data-part="label"]',
          "drawer button": '[data-scope="button"]',
          "close button": '[data-scope="drawer"][data-part="close-trigger"]',
        })),
      };
      await closeDrawer(page, drawer);

      for (const label of [
        `heading "${HEADING}"`,
        `description "${DESCRIPTION}"`,
        'sidebar label "Filters"',
        ...FACETS.map((facet) => `facet "${facet}"`),
        ...OPTIONS.map((option) => `option "${option}"`),
        `price range "${FULL_RANGE}"`,
        'clear button "Clear all"',
        'filters button "Filters"',
        `empty message "${EMPTY}"`,
        `error title "${ERROR}"`,
        'retry button "Try again"',
        `drawer title "${DRAWER}"`,
        'drawer button "Clear all"',
        'drawer button "Show results"',
      ]) {
        expect(ratios[label], `${scheme}: ${label} measured`).toBeDefined();
      }
      for (const [what, ratio] of Object.entries(ratios)) {
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
      }
      expect(Object.keys(chevrons), `${scheme}: chevrons measured`).toHaveLength(FACETS.length);
      for (const [what, ratio] of Object.entries(chevrons)) {
        // Non-text contrast (WCAG 1.4.11): the chevron's stroke against its surface.
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(3);
      }
    });

    test("shows hover and focus-visible on a facet, a checkbox, a thumb and the buttons", async ({
      page,
    }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const sidebar = block(page, "default").locator(SIDEBAR);

      const keyboardFocus = async (target: Locator) => {
        await target.focus();
        await page.keyboard.press("Shift+Tab");
        await page.keyboard.press("Tab");
      };

      // A facet's chevron turns from the muted colour to the foreground on hover.
      const facet = sidebar.getByRole("button", { name: "Colour" });
      const chevron = () =>
        facet.evaluate(
          (el) => getComputedStyle(el.querySelector('[data-part="item-indicator"]')!).color,
        );
      await page.mouse.move(0, 0);
      const resting = await chevron();
      await facet.hover();
      await expect.poll(chevron, { message: `${scheme}: facet hover` }).not.toBe(resting);
      await page.mouse.move(0, 0);
      await keyboardFocus(facet);
      expect(
        await facet.evaluate((el) => ({
          focused: el.matches(":focus-visible"),
          ring: getComputedStyle(el).outlineStyle,
        })),
        `${scheme}: facet focus ring`,
      ).toEqual({ focused: true, ring: "solid" });

      // The checkbox's focus lives on its hidden input; the ring is drawn on the control.
      const sage = sidebar.getByRole("checkbox", { name: /Sage/ });
      await keyboardFocus(sage);
      const control = sidebar
        .locator('[data-scope="checkbox"][data-part="root"]')
        .filter({ hasText: "Sage" })
        .locator('[data-part="control"]');
      await expect(control).toHaveAttribute("data-focus-visible", "");
      expect(await control.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe("solid");

      const thumb = sidebar.getByRole("slider", { name: "Maximum price" });
      await keyboardFocus(thumb);
      expect(
        await thumb.evaluate((el) => ({
          focused: el.matches(":focus-visible"),
          ring: getComputedStyle(el).outlineStyle,
        })),
        `${scheme}: thumb focus ring`,
      ).toEqual({ focused: true, ring: "solid" });

      // Clear all is live once something is checked: the ghost Button takes a fill on hover.
      await sidebar.getByText("Sage", { exact: true }).click();
      const clear = sidebar.getByRole("button", { name: "Clear all" });
      await expect(clear).toBeEnabled();
      const fill = (target: Locator) =>
        target.evaluate((el) => getComputedStyle(el).backgroundColor);
      await page.mouse.move(0, 0);
      const clearResting = await fill(clear);
      await clear.hover();
      await expect
        .poll(() => fill(clear), { message: `${scheme}: clear hover` })
        .not.toBe(clearResting);
      await keyboardFocus(clear);
      expect(await clear.evaluate((el) => el.matches(":focus-visible"))).toBe(true);
      await clear.click();

      await showState(page, "narrow");
      const button = filtersButton(page, "narrow");
      await page.mouse.move(0, 0);
      const buttonResting = await fill(button);
      await button.hover();
      await expect
        .poll(() => fill(button), { message: `${scheme}: Filters hover` })
        .not.toBe(buttonResting);
      await page.mouse.move(0, 0);
      await keyboardFocus(button);
      expect(
        await button.evaluate((el) => ({
          focused: el.matches(":focus-visible"),
          none: getComputedStyle(el).outlineStyle === "none",
        })),
        `${scheme}: Filters focus ring`,
      ).toEqual({ focused: true, none: false });
    });

    test("filters the products from the sidebar and clears them again", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const main = block(page, "default");
      const sidebar = main.locator(SIDEBAR);
      const count = main.locator('[aria-live="polite"]');
      const range = sidebar.locator('[data-scope="slider"][data-part="value-text"]');
      await expect(count).toHaveText("12 products");

      await sidebar.getByText("Mugs", { exact: true }).click();
      await expect(sidebar.getByRole("checkbox", { name: /Mugs/ })).toBeChecked();
      await expect(count).toHaveText("3 products");

      await sidebar.getByText("Porcelain", { exact: true }).click();
      await expect(count).toHaveText("2 products");

      // Moving the lowest price reports once the thumb settles.
      const min = sidebar.getByRole("slider", { name: "Minimum price" });
      await min.focus();
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await expect(range).toHaveText("€30 – €200");
      await expect(min).toHaveAttribute("aria-valuetext", "€30");
      await expect(count).toHaveText("1 product");

      await sidebar.getByRole("button", { name: "Clear all" }).click();
      await expect(count).toHaveText("12 products");
      await expect(range).toHaveText(FULL_RANGE);
      await expect(sidebar.getByRole("checkbox", { checked: true })).toHaveCount(0);
      await expect(sidebar.getByRole("button", { name: "Clear all" })).toBeDisabled();
    });

    test("filters from the drawer, counts what is active and hands focus back", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 900 });
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const main = block(page, "default");
      const count = main.locator('[aria-live="polite"]');
      const button = filtersButton(page, "default");
      await expect(button).toBeVisible();

      const drawer = await openDrawer(page, "default");
      expect(
        await drawer.evaluate((el) => el.contains(document.activeElement)),
        `${scheme}: focus moves into the drawer`,
      ).toBe(true);
      await drawer.getByText("Oat", { exact: true }).click();
      await drawer.getByText("Stoneware", { exact: true }).click();
      await expect(count).toHaveText("1 product");
      await drawer.getByRole("button", { name: "Show results" }).click();
      await expect(drawer).toBeHidden();
      await expect(button).toHaveText("Filters (2)");
      await expect(button).toBeFocused();

      // The drawer opens on the same filters, and the hidden sidebar holds them too.
      const again = await openDrawer(page, "default");
      await expect(again.getByRole("checkbox", { checked: true })).toHaveCount(2);
      await again.getByRole("button", { name: "Close filters" }).click();
      await expect(again).toBeHidden();
      await expect(button).toBeFocused();
      await expect(
        main.locator(`${SIDEBAR} input[type="checkbox"]:checked`),
        `${scheme}: the sidebar shares the state`,
      ).toHaveCount(2);

      const last = await openDrawer(page, "default");
      await last.getByRole("button", { name: "Clear all" }).click();
      await expect(count).toHaveText("12 products");
      await closeDrawer(page, last);
      await expect(button).toHaveText("Filters");
      await expect(button).toBeFocused();
    });

    test("keeps the disabled filters off", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "disabled");
      const sidebar = block(page, "disabled").locator(SIDEBAR);
      const mugs = sidebar.getByRole("checkbox", { name: /Mugs/ });
      await expect(mugs).toBeDisabled();
      await sidebar.getByText("Mugs", { exact: true }).click({ force: true });
      await expect(mugs).not.toBeChecked();
      await expect(sidebar.getByRole("slider", { name: "Minimum price" })).toHaveAttribute(
        "aria-disabled",
        "true",
      );
      await expect(sidebar.getByRole("button", { name: "Clear all" })).toBeDisabled();
    });

    test("announces the loading filters once and clears the error on retry", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const loading = block(page, "loading");
      // The drawer is not mounted until it opens, so there is one busy region.
      await expect(loading.getByRole("status")).toHaveCount(1);
      const hidden = await loading
        .locator('[role="status"]')
        .evaluate((el) =>
          [...el.querySelectorAll('[data-scope="skeleton"]')].every(
            (placeholder) => placeholder.closest('[aria-hidden="true"]') !== null,
          ),
        );
      expect(hidden).toBe(true);

      await showState(page, "error");
      const failed = block(page, "error");
      await expect(failed.locator(`${SIDEBAR} [role="alert"]`)).toContainText(ERROR);
      // The demo's retry clears its message to "", the way a consumer holding
      // the error as a string does once the load succeeds.
      await failed.locator(SIDEBAR).getByRole("button", { name: "Try again" }).click();
      await expect(failed.locator('[data-scope="alert"]')).toHaveCount(0);
      await expect(failed.locator(`${SIDEBAR} h3 > [data-part="item-trigger"]`)).toHaveText(FACETS);
    });
  });
}
