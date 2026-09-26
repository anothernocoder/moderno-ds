/**
 * The description-list block, checked on the built docs page at the three
 * widths of the responsive policy (375 / 768 / 1280) in both colour schemes. It
 * asserts text and computed styles; no screenshot baseline is committed.
 *
 * Four claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` everything stacks; at
 *    `--container-sm` a row's action moves beside its value; at
 *    `--container-md` the term moves beside its value (three tracks); at
 *    `--container-lg` the term column narrows (four tracks). Each copy on the
 *    page is measured against its own container width, so the narrow frame
 *    stays stacked at 1280 while the wide frame is already on four tracks.
 * 2. **Every state renders what it claims**, at every width: the rows as a real
 *    `<dl>` with a status Badge, a card when empty, skeleton rows in a busy
 *    region while loading, one alert with a retry on a failed load, and rows
 *    whose every action is inert when disabled.
 * 3. **AA contrast** in both schemes on every text the block paints.
 * 4. **Hover and focus-visible** reach the row actions, and each action's
 *    accessible name carries its visible label and its term.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/description-list/";

const BLOCK = "section.moderno-block-description-list";

/** The sample record the block ships with, in order. */
const TERMS = ["Full name", "Email", "Company", "Plan", "Status", "Customer since", "Notes"];

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** Whether a Divider sits between the header and what follows it. */
  divider: boolean;
  /** The `<dt>` texts, in order. */
  terms: string[];
  /** Grid tracks of the first row (or first skeleton row while loading). */
  rowTracks: number | null;
  /** Whether the first row's term shares a line with its value. */
  termBesideValue: boolean | null;
  /** `display` of the first value that carries an action: `grid` stacked, `flex` beside. */
  actionValueDisplay: string | null;
  /** Whether that action sits on its value's line rather than below it. */
  actionBesideValue: boolean | null;
  /** The badge variants the values render, in order. */
  badges: string[];
  /** Number of row actions. */
  actions: number;
  /** Whether every button in this copy is disabled. */
  allControlsInert: boolean;
  /** Skeleton rows inside a busy status region, each hidden from assistive tech. */
  skeletonRows: number;
  /** Whether this copy renders the "No details yet" card. */
  emptyCard: boolean;
  /** Whether this copy renders an alert in place of the list. */
  listLevelAlert: boolean;
}

/**
 * The page's previews (islands/DescriptionListBlockDemo.svelte): the main
 * preview mounts the default; the Examples frame the same block at 18rem,
 * 30rem, 40rem and 50rem, then mount the empty, loading, error and disabled
 * states. Every copy is found by the `data-demo-state` its wrapper carries.
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
        if (!shell || !header) {
          throw new Error("the description-list block did not render its own markup");
        }

        const list = shell.querySelector("dl");
        const busy = shell.querySelector('[role="status"][aria-busy="true"]');
        const rows = list ? [...list.querySelectorAll<HTMLElement>(":scope > div")] : [];
        const skeletons = busy
          ? [...busy.querySelectorAll<HTMLElement>(':scope > [aria-hidden="true"]')].filter(
              (row) => row.querySelector('[data-scope="skeleton"]') !== null,
            )
          : [];
        const firstRow = rows[0] ?? skeletons[0] ?? null;
        const tracks = (el: Element) =>
          getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean).length;

        const firstTerm = rows[0]?.querySelector("dt");
        const firstValue = rows[0]?.querySelector("dd");
        const termBesideValue =
          firstTerm && firstValue
            ? firstValue.getBoundingClientRect().left >= firstTerm.getBoundingClientRect().right
            : null;

        const actionRow = rows.find((row) => row.querySelector("dd [data-scope='button']"));
        const actionValue = actionRow?.querySelector("dd") ?? null;
        const action = actionValue?.querySelector("[data-scope='button']");
        const valueText = actionValue?.firstElementChild;
        const actionBesideValue =
          action && valueText
            ? action.getBoundingClientRect().top < valueText.getBoundingClientRect().bottom
            : null;

        const buttons = [...section.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];
        const next = header.nextElementSibling;

        return {
          containerWidth: section.offsetWidth,
          divider: next?.getAttribute("data-scope") === "divider",
          terms: rows.map((row) => row.querySelector("dt")?.textContent?.trim() ?? ""),
          rowTracks: firstRow ? tracks(firstRow) : null,
          termBesideValue,
          actionValueDisplay: actionValue ? getComputedStyle(actionValue).display : null,
          actionBesideValue,
          badges: rows.flatMap((row) => {
            const badge = row.querySelector('dd [data-scope="badge"][data-part="root"]');
            return badge ? [badge.getAttribute("data-variant") ?? ""] : [];
          }),
          actions: rows.filter((row) => row.querySelector("dd [data-scope='button']")).length,
          allControlsInert: buttons.length > 0 && buttons.every((button) => button.disabled),
          skeletonRows: skeletons.length,
          emptyCard:
            !list &&
            section
              .querySelector('[data-scope="card"][data-part="title"]')
              ?.textContent?.includes("No details yet") === true,
          listLevelAlert:
            !list && section.querySelector('[data-scope="alert"][data-part="root"]') !== null,
        };
      });
    },
    { state, selector: BLOCK },
  );
}

/** The grid tracks each contract step promises a row. */
function expectedTracks(containerWidth: number): number {
  if (containerWidth >= CONTAINER_LG) return 4;
  if (containerWidth >= CONTAINER_MD) return 3;
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

      // One entry per row, so a term, value, badge or action that is too faint
      // fails by name.
      for (const row of block.querySelectorAll("dl > div")) {
        const term = pick(row, "dt");
        const name = term.textContent?.trim() ?? "row";
        ratios[`${name} term`] = against(term);
        const value = pick(row, "dd > :first-child");
        ratios[`${name} value`] = against(value);
        const action = row.querySelector('dd [data-scope="button"]');
        if (action) ratios[`${name} action`] = against(action);
      }
      return ratios;
    },
    { state, selector: BLOCK },
  );
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`description-list — ${scheme}`, () => {
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

          expect(block.divider, `${where}: divider under the header`).toBe(true);
          if (block.rowTracks !== null) {
            expect(block.rowTracks, `${where}: row tracks`).toBe(
              expectedTracks(block.containerWidth),
            );
          }
          if (block.termBesideValue !== null) {
            expect(block.termBesideValue, `${where}: term beside value`).toBe(
              block.containerWidth >= CONTAINER_MD,
            );
          }
          if (block.actionValueDisplay !== null) {
            expect(block.actionValueDisplay, `${where}: action row`).toBe(
              block.containerWidth >= CONTAINER_SM ? "flex" : "grid",
            );
            expect(block.actionBesideValue, `${where}: action beside value`).toBe(
              block.containerWidth >= CONTAINER_SM,
            );
          }
          if (block.terms.length > 0) {
            expect(block.terms, `${where}: terms`).toEqual(TERMS);
            expect(block.badges, `${where}: status badge`).toEqual(["success"]);
            expect(block.actions, `${where}: row actions`).toBe(3);
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

        const lists = blocks.filter((block) => block.terms.length > 0);
        expect(lists.length, `${scheme} ${width}px: copies rendering the list`).toBe(6);
        expect(blocks.filter((block) => block.emptyCard).length, "the empty render").toBe(1);
        expect(
          blocks.filter((block) => block.skeletonRows === 4).length,
          "the loading render",
        ).toBe(1);
        expect(
          blocks.filter((block) => block.listLevelAlert).length,
          "the failed-load render",
        ).toBe(1);
        expect(lists.filter((block) => block.allControlsInert).length, "the disabled render").toBe(
          1,
        );

        // Each step is exercised on both sides at every viewport, so a step that
        // silently stopped firing cannot pass this file.
        const containerWidths = lists.map((b) => b.containerWidth);
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
      for (const term of TERMS) {
        expect(ratios[`${term} value`], `${scheme}: ${term} measured`).toBeDefined();
      }
      for (const [what, ratio] of Object.entries(ratios)) {
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
      }
    });

    test("shows hover and focus-visible on a row action", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const change = page
        .locator(`[data-demo-state="default"] ${BLOCK} dl > div`)
        .first()
        .locator('[data-scope="button"]');

      const background = () => change.evaluate((el) => getComputedStyle(el).backgroundColor);
      const resting = await background();
      await change.hover();
      expect(await background(), `${scheme}: hover background`).not.toBe(resting);

      await page.mouse.move(0, 0);
      await change.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const outline = await change.evaluate((el) => ({
        focused: el.matches(":focus-visible"),
        style: getComputedStyle(el).outlineStyle,
      }));
      expect(outline.focused, `${scheme}: keyboard focus`).toBe(true);
      expect(outline.style, `${scheme}: focus ring`).not.toBe("none");
    });

    test("names the term in every row action's accessible name", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const actions = await page.evaluate((selector) => {
        const block = document.querySelector(`[data-demo-state="default"] ${selector}`)!;
        return [...block.querySelectorAll("dl > div")].flatMap((row) => {
          const button = row.querySelector('[data-scope="button"]');
          if (!button) return [];
          return [
            {
              name: button.getAttribute("aria-label") ?? "",
              label: button.textContent?.trim() ?? "",
              term: row.querySelector("dt")?.textContent?.trim() ?? "",
            },
          ];
        });
      }, BLOCK);
      expect(actions).toHaveLength(3);
      for (const { name, label, term } of actions) {
        expect(name).toBe(`${label} ${term}`);
      }
    });

    test("announces the loading list once, not each skeleton row", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const region = page.locator(`[data-demo-state="loading"] ${BLOCK} [role="status"]`);
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region).toContainText("Loading details");
      const hidden = await region.evaluate((el) =>
        [...el.querySelectorAll(":scope > div")].every(
          (row) => row.getAttribute("aria-hidden") === "true",
        ),
      );
      expect(hidden).toBe(true);
    });
  });
}
