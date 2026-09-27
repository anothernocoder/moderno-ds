/**
 * The action-panel block, checked on the built docs page at the three widths
 * of the responsive policy (375 / 768 / 1280) in both colour schemes. It
 * asserts text and computed styles; no screenshot baseline is committed.
 *
 * Four claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` each control sits
 *    under its text; at `--container-sm` it moves beside its text and the
 *    panel's padding grows; at `--container-md` the heading steps up a size;
 *    at `--container-lg` the heading moves into a column beside the panel.
 *    Each copy on the page is measured against its own container width, so the
 *    narrow frame stays stacked at 1280 while the wide frame is already split.
 * 2. **Every state renders what it claims**, at every width: switch and button
 *    rows, a danger zone painted from --destructive, an empty message, skeleton
 *    rows in a busy region while loading, one alert with a retry on a failed
 *    load, and rows whose every control is inert when disabled.
 * 3. **AA contrast** in both schemes on every text the block paints.
 * 4. **Hover, focus-visible and the switch itself**: a row button reacts to
 *    hover and keyboard focus, a switch shows its ring on keyboard focus and
 *    flips when its row is clicked, and each switch is named by its title and
 *    described by its description.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/action-panel/";

const BLOCK = "section.moderno-block-action-panel";

/** The sample panel the block ships with, in order. */
const TITLES = ["Comments", "Mentions", "Weekly digest", "Export data"];

/** The danger zone the docs page passes to the destructive example. */
const DANGER_TITLES = ["Transfer ownership", "Delete workspace"];

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** The row titles, in order. */
  titles: string[];
  /** The `data-state` of every switch, in row order. */
  switchStates: string[];
  /** The `data-variant` of every row button, in row order. */
  buttonVariants: string[];
  /** Whether the first switch sits on its text's line rather than below it. */
  controlBesideText: boolean | null;
  /** The panel's inline padding, in px. */
  panelPadding: number;
  /** The heading's font size, in px. */
  headingSize: number;
  /** Whether the heading column sits beside the panel rather than above it. */
  headingBesidePanel: boolean;
  /** Whether the heading and the panel's edge are both painted --destructive. */
  destructiveTone: boolean;
  /** Whether every switch input and button in this copy is disabled. */
  allControlsInert: boolean;
  /** Skeleton rows inside a busy status region, each hidden from assistive tech. */
  skeletonRows: number;
  /** Whether this copy renders the "No settings yet" message. */
  emptyMessage: boolean;
  /** Whether this copy renders an alert in place of the rows. */
  panelAlert: boolean;
}

/**
 * The page's previews (islands/ActionPanelBlockDemo.svelte): the main preview
 * mounts the default; the Examples frame the same block at 18rem, 30rem, 40rem
 * and 50rem, then mount the destructive, empty, loading, error and disabled
 * states. Every copy is found by the `data-demo-state` its wrapper carries.
 */
const STATES = [
  "default",
  "narrow",
  "compact",
  "panel",
  "wide",
  "destructive",
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
        const heading = section.querySelector("h2");
        const header = heading?.parentElement;
        const card = section.querySelector<HTMLElement>('[data-scope="card"][data-part="root"]');
        const content = card?.querySelector<HTMLElement>(
          '[data-scope="card"][data-part="content"]',
        );
        if (!heading || !header || !card || !content) {
          throw new Error("the action-panel block did not render its own markup");
        }

        const rows = [...content.querySelectorAll<HTMLElement>("ul > li")];
        const busy = content.querySelector('[role="status"][aria-busy="true"]');
        const skeletons = busy
          ? [...busy.querySelectorAll<HTMLElement>(':scope > [aria-hidden="true"]')].filter(
              (row) => row.querySelector('[data-scope="skeleton"]') !== null,
            )
          : [];

        const firstSwitch = content.querySelector<HTMLElement>(
          '[data-scope="switch"][data-part="root"]',
        );
        const control = firstSwitch?.querySelector('[data-part="control"]');
        const text = firstSwitch?.firstElementChild;
        const controlBesideText =
          control && text
            ? control.getBoundingClientRect().top < text.getBoundingClientRect().bottom
            : null;

        const inputs = [...section.querySelectorAll<HTMLInputElement>("input")];
        const buttons = [...section.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];
        const controls = [...inputs, ...buttons];

        return {
          containerWidth: section.offsetWidth,
          titles: rows.map(
            (row) =>
              row.querySelector('[data-part="label"], p.font-medium')?.textContent?.trim() ?? "",
          ),
          switchStates: rows.flatMap((row) => {
            const root = row.querySelector('[data-scope="switch"][data-part="root"]');
            return root ? [root.getAttribute("data-state") ?? ""] : [];
          }),
          buttonVariants: rows.flatMap((row) => {
            const button = row.querySelector('[data-scope="button"]');
            return button ? [button.getAttribute("data-variant") ?? ""] : [];
          }),
          controlBesideText,
          panelPadding: parseFloat(getComputedStyle(content).paddingInlineStart),
          headingSize: parseFloat(getComputedStyle(heading).fontSize),
          headingBesidePanel:
            card.getBoundingClientRect().left >= header.getBoundingClientRect().right,
          destructiveTone:
            getComputedStyle(card).borderTopColor === getComputedStyle(heading).color &&
            getComputedStyle(heading).color !== getComputedStyle(section).color,
          allControlsInert: controls.length > 0 && controls.every((el) => el.disabled),
          skeletonRows: skeletons.length,
          emptyMessage:
            rows.length === 0 && content.textContent?.includes("No settings yet") === true,
          panelAlert:
            rows.length === 0 &&
            content.querySelector('[data-scope="alert"][data-part="root"]') !== null,
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
  state: "default" | "destructive" | "empty" | "error",
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
        [`${state} heading`]: against(pick(block, "h2")),
        [`${state} heading description`]: against(pick(block, "h2 + p")),
      };

      if (state === "empty") {
        const lines = block.querySelectorAll('[data-scope="card"][data-part="content"] p');
        for (const [index, line] of [...lines].entries()) {
          ratios[`empty line ${index}`] = against(line);
        }
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

      // One entry per row, so a title, description or button that is too
      // faint fails by name.
      for (const row of block.querySelectorAll("ul > li")) {
        const title = pick(row, '[data-part="label"], p.font-medium');
        const name = `${state} ${title.textContent?.trim() ?? "row"}`;
        ratios[`${name} title`] = against(title);
        ratios[`${name} description`] = against(pick(row, "[id$='-description']"));
        const button = row.querySelector('[data-scope="button"]');
        if (button) ratios[`${name} button`] = against(button);
      }
      return ratios;
    },
    { state, selector: BLOCK },
  );
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`action-panel — ${scheme}`, () => {
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
          const block = mounted[0]!;
          blocks.push({ ...block, state });
          const where = `${scheme} ${width}px, ${state} (${block.containerWidth}px)`;

          const sm = block.containerWidth >= CONTAINER_SM;
          if (block.controlBesideText !== null) {
            expect(block.controlBesideText, `${where}: control beside text`).toBe(sm);
          }
          expect(block.panelPadding, `${where}: panel padding`).toBe(sm ? 24 : 16);
          expect(block.headingBesidePanel, `${where}: heading beside panel`).toBe(
            block.containerWidth >= CONTAINER_LG,
          );
          expect(block.destructiveTone, `${where}: destructive tone`).toBe(state === "destructive");

          if (state === "destructive") {
            expect(block.titles, `${where}: danger rows`).toEqual(DANGER_TITLES);
            expect(block.buttonVariants, `${where}: danger buttons`).toEqual([
              "destructive",
              "destructive",
            ]);
            expect(block.switchStates, `${where}: no switches`).toEqual([]);
          } else if (block.titles.length > 0) {
            expect(block.titles, `${where}: titles`).toEqual(TITLES);
            expect(block.switchStates, `${where}: switches`).toEqual([
              "checked",
              "checked",
              "unchecked",
            ]);
            expect(block.buttonVariants, `${where}: row button`).toEqual(["outline"]);
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

        const lists = blocks.filter((block) => block.titles.length > 0);
        expect(lists.length, `${scheme} ${width}px: copies rendering rows`).toBe(7);
        expect(blocks.filter((block) => block.emptyMessage).length, "the empty render").toBe(1);
        expect(
          blocks.filter((block) => block.skeletonRows === 3).length,
          "the loading render",
        ).toBe(1);
        expect(blocks.filter((block) => block.panelAlert).length, "the failed-load render").toBe(1);
        expect(
          lists.filter((block) => block.allControlsInert).map((block) => block.state),
          "the disabled render",
        ).toEqual(["disabled"]);

        // The heading steps up at `--container-md`: one size below it, one
        // larger size from it on.
        const below = new Set(
          blocks.filter((b) => b.containerWidth < CONTAINER_MD).map((b) => b.headingSize),
        );
        const above = new Set(
          blocks.filter((b) => b.containerWidth >= CONTAINER_MD).map((b) => b.headingSize),
        );
        expect(below.size, "one heading size below @md").toBe(1);
        expect(above.size, "one heading size from @md").toBe(1);
        expect([...above][0]!, "the heading steps up at @md").toBeGreaterThan([...below][0]!);

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
      });
    }

    test("clears AA contrast on every text it paints", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      let ratios: Record<string, number> = {};
      for (const state of ["default", "destructive", "empty", "error"] as const) {
        ratios = { ...ratios, ...(await textRatios(page, state)) };
      }
      for (const title of TITLES) {
        expect(
          ratios[`default ${title} description`],
          `${scheme}: ${title} measured`,
        ).toBeDefined();
      }
      for (const title of DANGER_TITLES) {
        expect(ratios[`destructive ${title} button`], `${scheme}: ${title} measured`).toBeDefined();
      }
      expect(ratios["empty line 1"], `${scheme}: empty message measured`).toBeDefined();
      for (const [what, ratio] of Object.entries(ratios)) {
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
      }
    });

    test("shows hover and focus-visible on a row button", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const exportButton = page.locator(
        `[data-demo-state="default"] ${BLOCK} ul > li [data-scope="button"]`,
      );

      const background = () => exportButton.evaluate((el) => getComputedStyle(el).backgroundColor);
      const resting = await background();
      await exportButton.hover();
      expect(await background(), `${scheme}: hover background`).not.toBe(resting);

      await page.mouse.move(0, 0);
      await exportButton.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const outline = await exportButton.evaluate((el) => ({
        focused: el.matches(":focus-visible"),
        style: getComputedStyle(el).outlineStyle,
      }));
      expect(outline.focused, `${scheme}: keyboard focus`).toBe(true);
      expect(outline.style, `${scheme}: focus ring`).not.toBe("none");
    });

    test("rings a switch on keyboard focus and flips it from its row", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const row = page
        .locator(`[data-demo-state="default"] ${BLOCK} [data-scope="switch"][data-part="root"]`)
        .nth(2);
      const control = row.locator('[data-part="control"]');
      const input = row.locator("input");

      await input.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      await expect(control).toHaveAttribute("data-focus-visible", "");
      expect(
        await control.evaluate((el) => getComputedStyle(el).outlineStyle),
        `${scheme}: switch focus ring`,
      ).not.toBe("none");

      await expect(row).toHaveAttribute("data-state", "unchecked");
      await row.locator("[id$='-description']").click();
      await expect(row).toHaveAttribute("data-state", "checked");
      await expect(input).toBeChecked();
    });

    test("names each switch by its title and describes it by its description", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const rows = page.locator(
        `[data-demo-state="default"] ${BLOCK} [data-scope="switch"][data-part="root"]`,
      );
      await expect(rows).toHaveCount(3);
      for (const [index, title] of TITLES.slice(0, 3).entries()) {
        const input = rows.nth(index).locator("input");
        await expect(input).toHaveRole("switch");
        await expect(input).toHaveAccessibleName(title);
        const description = await rows.nth(index).locator("[id$='-description']").textContent();
        await expect(input).toHaveAccessibleDescription(description!.trim());
      }

      const exportButton = page.locator(
        `[data-demo-state="default"] ${BLOCK} ul > li [data-scope="button"]`,
      );
      await expect(exportButton).toHaveAccessibleName("Export");
      await expect(exportButton).toHaveAccessibleDescription(
        "Download every document and comment as one archive.",
      );
    });

    test("announces the loading panel once, not each skeleton row", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const region = page.locator(`[data-demo-state="loading"] ${BLOCK} [role="status"]`);
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region).toContainText("Loading settings");
      const hidden = await region.evaluate((el) =>
        [...el.querySelectorAll(":scope > div")].every(
          (row) => row.getAttribute("aria-hidden") === "true",
        ),
      );
      expect(hidden).toBe(true);
    });
  });
}
