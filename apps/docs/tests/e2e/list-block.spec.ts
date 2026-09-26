/**
 * The list block, checked on the built docs page at the three widths of the
 * responsive policy (375 / 768 / 1280) in both colour schemes. It asserts text
 * and computed styles, never pixels (see `playwright.config.ts`).
 *
 * Four claims:
 *
 * 1. **Container, not viewport**: below `--container-sm` a row's status, fact
 *    and buttons sit under its name; from it the header lines up on one row
 *    and the buttons move to the row's end; from `--container-md` the status
 *    and fact get a column of their own, one above the other, and the heading
 *    grows; from `--container-lg` they sit side by side and the facts line up,
 *    right-aligned. Each copy is measured against its own container width.
 * 2. **Every state renders what it claims**: five rows tinted by status, a
 *    message when there are none, placeholders in a busy region while loading,
 *    one alert with a retry when the load failed, and inert buttons when
 *    disabled or loading.
 * 3. **Row actions**: every button is named after its record, reacts to hover
 *    and shows a ring on keyboard focus.
 * 4. **AA contrast** on every text the block paints, per scheme.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/list/";
const BLOCK = "section.moderno-block-list";

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

type Placement = "under" | "end";
type FactsPlacement = "under" | "stacked" | "inline";

interface BlockMetrics {
  /** Width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** Whether the heading is set at `--text-heading-sm` rather than `--text-body-lg`. */
  largeHeading: boolean;
  /** Whether "Invite member" sits beside the heading rather than under it. */
  headerRow: boolean;
  /** Where the first row's buttons sit, when rows render. */
  actions: Placement | null;
  /** Where the first row's status and fact sit, when rows render. */
  facts: FactsPlacement | null;
  /** Whether the first row's fact is right-aligned in a fixed column. */
  alignedFacts: boolean | null;
  /** The Badge status of each row, in order. */
  statuses: string[];
  /** Whether every button in this copy is disabled. */
  allButtonsInert: boolean;
  /** Whether "Invite member" is disabled. */
  inviteInert: boolean;
  /** Skeletons inside a busy `status` region. */
  busyPlaceholders: number;
  /** Whether this copy renders the "No members yet" message. */
  emptyMessage: boolean;
  /** Whether this copy renders the failed-load alert with its retry. */
  failedLoad: boolean;
}

async function showState(page: Page, state: State): Promise<void> {
  const block = page.locator(`[data-demo-state="${state}"] ${BLOCK}`);
  await block.scrollIntoViewIfNeeded();
  await block.waitFor({ state: "visible" });
}

async function blockMetrics(page: Page, state: State): Promise<BlockMetrics[]> {
  return page.evaluate(
    ({ state, block }) => {
      const panel = document.querySelector(`[data-demo-state="${state}"]`);
      if (!panel) throw new Error(`no preview for the ${state} state on the page`);
      return [...panel.querySelectorAll(block)].map((section) => {
        const heading = section.querySelector("h2");
        const header = heading?.parentElement?.parentElement;
        const invite = header?.querySelector<HTMLButtonElement>('[data-scope="button"]');
        if (!heading || !header || !invite) {
          throw new Error("the list block did not render its own markup");
        }

        const probe = document.createElement("span");
        probe.style.fontSize = "var(--text-heading-sm)";
        section.append(probe);
        const large = getComputedStyle(probe).fontSize;
        probe.remove();

        const headingBox = heading.parentElement!.getBoundingClientRect();
        const inviteBox = invite.getBoundingClientRect();

        const list = section.querySelector("ul");
        const busy = section.querySelector('[role="status"][aria-busy="true"]');
        const firstRow = list?.querySelector("li");

        let actions: Placement | null = null;
        let facts: FactsPlacement | null = null;
        let alignedFacts: boolean | null = null;
        if (firstRow) {
          const [, text, factsBox, actionsBox] = [...firstRow.children];
          if (!text || !factsBox || !actionsBox) throw new Error("a row is missing a part");
          const textRect = text.getBoundingClientRect();
          const factsRect = factsBox.getBoundingClientRect();
          const actionsRect = actionsBox.getBoundingClientRect();

          if (actionsRect.left >= textRect.right - 1) actions = "end";
          else if (actionsRect.top >= textRect.bottom - 1) actions = "under";

          if (factsRect.left >= textRect.right - 1) {
            facts = getComputedStyle(factsBox).flexDirection === "column" ? "stacked" : "inline";
          } else if (factsRect.top >= textRect.bottom - 1) {
            facts = "under";
          }

          const fact = factsBox.querySelector("span:not([data-scope])");
          if (fact) {
            const probeWidth = document.createElement("span");
            probeWidth.style.cssText = "display:block;width:calc(var(--spacing) * 28)";
            section.append(probeWidth);
            const column = probeWidth.getBoundingClientRect().width;
            probeWidth.remove();
            alignedFacts =
              getComputedStyle(fact).textAlign === "right" &&
              Math.abs(fact.getBoundingClientRect().width - column) < 1;
          }
        }

        const buttons = [...section.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];
        const alert = section.querySelector('[data-scope="alert"][data-part="root"]');

        return {
          containerWidth: section.getBoundingClientRect().width,
          largeHeading: getComputedStyle(heading).fontSize === large,
          headerRow: inviteBox.left >= headingBox.right - 1,
          actions,
          facts,
          alignedFacts,
          statuses: list
            ? [...list.querySelectorAll('[data-scope="badge"][data-part="root"]')].map(
                (badge) => badge.getAttribute("data-variant") ?? "",
              )
            : [],
          allButtonsInert: buttons.length > 0 && buttons.every((button) => button.disabled),
          inviteInert: invite.disabled,
          busyPlaceholders: busy ? busy.querySelectorAll('[data-scope="skeleton"]').length : 0,
          emptyMessage: !list && section.textContent?.includes("No members yet") === true,
          failedLoad:
            !list &&
            alert?.getAttribute("data-variant") === "error" &&
            alert.querySelector('[data-scope="button"]')?.textContent?.includes("Try again") ===
              true,
        };
      });
    },
    { state, block: BLOCK },
  );
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
  return page.evaluate(
    ({ state, blockSelector }) => {
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

      const block = document.querySelector(`[data-demo-state="${state}"] ${blockSelector}`);
      if (!block) throw new Error(`the ${state} list demo did not render`);

      const pick = (root: Element, selector: string): Element => {
        const el = root.querySelector(selector);
        if (!el) throw new Error(`${state}: missing ${selector}`);
        return el;
      };
      const against = (el: Element) => ratio(getComputedStyle(el).color, surfaceOf(el));

      const ratios: Record<string, number> = {
        heading: against(pick(block, "h2")),
        headingDescription: against(pick(block, "h2 + p")),
        invite: against(pick(block, '[data-scope="button"]')),
      };

      if (state === "empty") {
        ratios.emptyTitle = against(pick(block, '[data-scope="card"][data-part="title"]'));
        ratios.emptyBody = against(pick(block, '[data-scope="card"][data-part="description"]'));
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

      // One entry per row, so a status whose tint is too light for its own text
      // fails by name rather than hiding behind the others.
      for (const row of block.querySelectorAll("ul > li")) {
        const [avatar, text, facts, actions] = [...row.children];
        const [title, subtitle] = text ? [...text.children] : [];
        if (!avatar || !title || !subtitle || !facts || !actions) {
          throw new Error("a row is missing a part");
        }
        const [edit, remove] = [...actions.querySelectorAll('[data-scope="button"]')];
        if (!edit || !remove) throw new Error("a row is missing a button");
        const name = title.textContent?.trim() ?? "row";
        ratios[`${name} initials`] = against(pick(avatar, '[data-part="fallback"]'));
        ratios[`${name} title`] = against(title);
        ratios[`${name} subtitle`] = against(subtitle);
        ratios[`${name} status`] = against(pick(facts, '[data-scope="badge"]'));
        ratios[`${name} fact`] = against(pick(facts, "span:not([data-scope])"));
        ratios[`${name} edit`] = against(edit);
        ratios[`${name} remove`] = against(remove);
      }
      return ratios;
    },
    { state, blockSelector: BLOCK },
  );
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`list — ${scheme}`, () => {
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
          expect(block.headerRow, `${where}: header row`).toBe(
            block.containerWidth >= CONTAINER_SM,
          );
          if (block.actions !== null) {
            expect(block.actions, `${where}: row buttons`).toBe(
              block.containerWidth >= CONTAINER_SM ? "end" : "under",
            );
            const expected: FactsPlacement =
              block.containerWidth >= CONTAINER_LG
                ? "inline"
                : block.containerWidth >= CONTAINER_MD
                  ? "stacked"
                  : "under";
            expect(block.facts, `${where}: status and fact`).toBe(expected);
            expect(block.alignedFacts, `${where}: fact column`).toBe(
              block.containerWidth >= CONTAINER_LG,
            );
            expect(block.statuses, `${where}: statuses`).toEqual([
              "success",
              "info",
              "success",
              "warning",
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

        const lists = blocks.filter((block) => block.statuses.length > 0);
        expect(lists.length, `${scheme} ${width}px: copies rendering the rows`).toBe(5);
        expect(blocks.filter((block) => block.emptyMessage).length, "the empty render").toBe(1);
        const loading = blocks.filter((block) => block.busyPlaceholders === 9);
        expect(loading.length, "the loading render: three rows of three skeletons").toBe(1);
        expect(loading[0]!.inviteInert, "loading disables Invite member").toBe(true);
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

    test("names every row button after its record", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      for (const name of ["Ana López", "Ben Okafor", "Chen Wei", "Dara Singh", "Eli Moreau"]) {
        await expect(block.getByRole("button", { name: `Edit ${name}` })).toHaveCount(1);
        await expect(block.getByRole("button", { name: `Remove ${name}` })).toHaveCount(1);
      }
      await expect(
        page.locator(`[data-demo-state="loading"] ${BLOCK} [role="status"]`),
      ).toContainText("Loading team members…");
    });

    test("shows hover and focus-visible on the row buttons", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);

      for (const name of ["Edit Ana López", "Remove Ana López"]) {
        const button = block.getByRole("button", { name });
        const background = () => button.evaluate((el) => getComputedStyle(el).backgroundColor);

        await page.mouse.move(0, 0);
        const resting = await background();
        await button.hover();
        expect(await background(), `${scheme}: ${name} hover background`).not.toBe(resting);

        await page.mouse.move(0, 0);
        await button.focus();
        await page.keyboard.press("Shift+Tab");
        await page.keyboard.press("Tab");
        const outline = await button.evaluate((el) => ({
          focused: el.matches(":focus-visible"),
          style: getComputedStyle(el).outlineStyle,
        }));
        expect(outline.focused, `${scheme}: ${name} keyboard focus`).toBe(true);
        expect(outline.style, `${scheme}: ${name} focus ring`).not.toBe("none");
      }
    });

    test("clears AA contrast on every text it paints", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      const ratios = await contrastRatios(page);
      expect(ratios["Eli Moreau status"], `${scheme}: rows measured`).toBeDefined();
      expect(ratios.emptyTitle, `${scheme}: empty message measured`).toBeDefined();
      expect(ratios.failedTitle, `${scheme}: failed load measured`).toBeDefined();
      for (const [what, ratio] of Object.entries(ratios)) {
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
      }
    });
  });
}
