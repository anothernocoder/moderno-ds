/**
 * The stacked-list block, checked on the built docs page at the three widths of
 * the responsive policy (375 / 768 / 1280) in both colour schemes. It asserts
 * text and computed styles; no screenshot baseline is committed.
 *
 * Four claims:
 *
 * 1. **Container, not viewport.** At `--container-sm` the header lines up and
 *    each View button moves beside its record; at `--container-md` the badge
 *    and meta leave the text column for a trailing column, stacked, and the
 *    heading steps up; at `--container-lg` they share one line. Each copy on
 *    the page is measured against its own container width, so the narrow frame
 *    keeps its buttons under their records at 1280 while the wide frame is
 *    already on one line.
 * 2. **Every state renders what it claims**, at every width: the rows with all
 *    five badge variants, a message inside the card when empty, skeleton rows
 *    in a busy region while loading, one alert with a retry on a failed load,
 *    and rows whose every button is inert when disabled.
 * 3. **AA contrast** in both schemes on every text the block paints.
 * 4. **Hover, focus-visible and names**: a View button reacts to hover and to
 *    keyboard focus, and its accessible name carries its row's title.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/stacked-list/";

const BLOCK = "section.moderno-block-stacked-list";

/** The sample team ships one row per badge variant, in this order. */
const BADGES = ["success", "info", "warning", "error", "neutral"];

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** `display` of the header row: `grid` stacked, `flex` once it lines up. */
  headerDisplay: string;
  /** The heading's computed font size, in px. */
  headingSize: number;
  /** Per row: where its View button sits relative to its record. */
  buttonBeside: boolean[];
  /** Per row: whether the badge and meta sit after the name, in a trailing column. */
  detailsTrailing: boolean[];
  /** Per row: whether the badge and meta share one line. */
  detailsOneLine: boolean[];
  /** Number of rows the list renders. */
  rows: number;
  /** The badge variants the rows render, in order. */
  badges: string[];
  /** Whether every button in this copy is disabled. */
  allControlsInert: boolean;
  /** Skeleton rows inside a busy status region. */
  skeletonRows: number;
  /** Whether this copy renders the "No members yet" message inside the card. */
  emptyMessage: boolean;
  /** Whether this copy renders a list-level alert (the failed-load stand-in). */
  listLevelAlert: boolean;
}

/**
 * The page's previews (islands/StackedListBlockDemo.svelte): the main preview
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
        const heading = section.querySelector("h2");
        if (!shell || !header || !heading) {
          throw new Error("the stacked-list block did not render its own markup");
        }

        const list = shell.querySelector("ul");
        const busy = shell.querySelector('[role="status"][aria-busy="true"]');
        const rows = list ? [...list.querySelectorAll<HTMLElement>(":scope > li")] : [];
        const buttons = [...section.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];

        const layout = rows.map((row) => {
          const record = row.firstElementChild!;
          const button = row.querySelector('[data-scope="button"]')!;
          const text = record.querySelector("p")!.parentElement!;
          const badge = row.querySelector('[data-scope="badge"][data-part="root"]')!;
          const meta = badge.nextElementSibling!;
          const r = record.getBoundingClientRect();
          const b = button.getBoundingClientRect();
          const t = text.getBoundingClientRect();
          const g = badge.getBoundingClientRect();
          const m = meta.getBoundingClientRect();
          return {
            buttonBeside: b.left >= r.right - 1 && b.top < r.bottom,
            detailsTrailing: g.left >= t.right - 1 && m.left >= t.right - 1,
            detailsOneLine: m.left >= g.right - 1 && m.top < g.bottom,
            variant: badge.getAttribute("data-variant") ?? "",
          };
        });

        return {
          containerWidth: section.offsetWidth,
          headerDisplay: getComputedStyle(header).display,
          headingSize: parseFloat(getComputedStyle(heading).fontSize),
          buttonBeside: layout.map((row) => row.buttonBeside),
          detailsTrailing: layout.map((row) => row.detailsTrailing),
          detailsOneLine: layout.map((row) => row.detailsOneLine),
          rows: rows.length,
          badges: layout.map((row) => row.variant),
          allControlsInert: buttons.length > 0 && buttons.every((button) => button.disabled),
          skeletonRows: busy
            ? [...busy.querySelectorAll(':scope > [aria-hidden="true"]')].filter(
                (row) => row.querySelector('[data-scope="skeleton"]') !== null,
              ).length
            : 0,
          emptyMessage:
            !list &&
            section
              .querySelector('[data-scope="card"][data-part="content"]')
              ?.textContent?.includes("No members yet") === true,
          listLevelAlert:
            !list && section.querySelector('[data-scope="alert"][data-part="root"]') !== null,
        };
      });
    },
    { state, selector: BLOCK },
  );
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
        inviteLabel: against(pick(block, '[data-scope="button"]')),
      };

      if (state === "empty") {
        const content = pick(block, '[data-scope="card"][data-part="content"]');
        content.querySelectorAll("p").forEach((line, index) => {
          ratios[`empty line ${index + 1}`] = against(line);
        });
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
      for (const row of block.querySelectorAll("ul > li")) {
        const badge = pick(row, '[data-scope="badge"][data-part="root"]');
        const variant = badge.getAttribute("data-variant") ?? "unknown";
        const [title, subtitle] = [...row.querySelectorAll("p")];
        ratios[`${variant}Badge`] = against(badge);
        ratios[`${variant}Title`] = against(title!);
        ratios[`${variant}Subtitle`] = against(subtitle!);
        ratios[`${variant}Initials`] = against(
          pick(row, '[data-scope="avatar"][data-part="fallback"]'),
        );
        ratios[`${variant}Meta`] = against(badge.nextElementSibling!);
        ratios[`${variant}View`] = against(pick(row, '[data-scope="button"]'));
      }
      return ratios;
    },
    { state, selector: BLOCK },
  );
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`stacked-list — ${scheme}`, () => {
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
          const sm = block.containerWidth >= CONTAINER_SM;
          const md = block.containerWidth >= CONTAINER_MD;
          const lg = block.containerWidth >= CONTAINER_LG;

          expect(block.headerDisplay, `${where}: header row`).toBe(sm ? "flex" : "grid");
          if (block.rows > 0) {
            expect(block.badges, `${where}: badges`).toEqual(BADGES);
            for (const beside of block.buttonBeside) {
              expect(beside, `${where}: View beside its record`).toBe(sm);
            }
            for (const trailing of block.detailsTrailing) {
              expect(trailing, `${where}: badge and meta in a trailing column`).toBe(md);
            }
            // Below @md they wrap under the name as the width allows, so only the
            // trailing column is asserted: @md stacks them, @lg lines them up.
            if (md) {
              for (const oneLine of block.detailsOneLine) {
                expect(oneLine, `${where}: badge and meta on one line`).toBe(lg);
              }
            }
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

        // The heading steps up a size at @md.
        const narrowHeading = blocks.find((b) => b.containerWidth < CONTAINER_MD)!.headingSize;
        const wideHeading = blocks.find((b) => b.containerWidth >= CONTAINER_MD)!.headingSize;
        expect(wideHeading, `${scheme} ${width}px: heading steps up at @md`).toBeGreaterThan(
          narrowHeading,
        );

        const lists = blocks.filter((block) => block.rows > 0);
        expect(lists.length, `${scheme} ${width}px: copies rendering the rows`).toBe(5);
        for (const list of lists) expect(list.rows).toBe(5);
        expect(blocks.filter((block) => block.emptyMessage).length, "the empty render").toBe(1);
        expect(
          blocks.filter((block) => block.skeletonRows === 3).length,
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
      for (const variant of BADGES) {
        expect(ratios[`${variant}Badge`], `${scheme}: ${variant} row measured`).toBeDefined();
      }
      expect(ratios["empty line 2"], `${scheme}: empty message measured`).toBeDefined();
      for (const [what, ratio] of Object.entries(ratios)) {
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
      }
    });

    test("shows hover and focus-visible on a View button", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const view = page
        .locator(`[data-demo-state="default"] ${BLOCK} ul > li [data-scope="button"]`)
        .first();

      const background = () => view.evaluate((el) => getComputedStyle(el).backgroundColor);
      const resting = await background();
      await view.hover();
      expect(await background(), `${scheme}: hover background`).not.toBe(resting);

      await page.mouse.move(0, 0);
      await view.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const outline = await view.evaluate((el) => ({
        focused: el.matches(":focus-visible"),
        style: getComputedStyle(el).outlineStyle,
      }));
      expect(outline.focused, `${scheme}: keyboard focus`).toBe(true);
      expect(outline.style, `${scheme}: focus ring`).not.toBe("none");
    });

    test("names the row in every View button's accessible name", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const names = await page.evaluate((selector) => {
        const section = document.querySelector(`[data-demo-state="default"] ${selector}`)!;
        return [...section.querySelectorAll("ul > li")].map((row) => ({
          name: row.querySelector('[data-scope="button"]')?.getAttribute("aria-label") ?? "",
          title: row.querySelector("p")?.textContent?.trim() ?? "",
        }));
      }, BLOCK);
      expect(names).toHaveLength(5);
      for (const { name, title } of names) {
        expect(name).toBe(`View ${title}`);
      }
    });

    test("announces the loading list once, not each skeleton row", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const region = page.locator(`[data-demo-state="loading"] ${BLOCK} [role="status"]`);
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region).toContainText("Loading team members");
      const hidden = await region.evaluate((el) =>
        [...el.querySelectorAll(":scope > div")].every(
          (row) => row.getAttribute("aria-hidden") === "true",
        ),
      );
      expect(hidden).toBe(true);
    });
  });
}
