/**
 * The list-container block, checked on the built docs page at the three widths
 * of the responsive policy (375 / 768 / 1280) in both colour schemes. It
 * asserts text and computed styles, never pixels (see `playwright.config.ts`).
 *
 * Four claims:
 *
 * 1. **Container, not viewport**: below `--container-sm` a row's status and
 *    time sit under its title; from it they move to a trailing column, one
 *    above the other; from `--container-md` they sit side by side and the
 *    heading grows; from `--container-lg` the times line up, right-aligned.
 *    Each copy is measured against its own container width.
 * 2. **Only the body scrolls**: the rows overflow a bounded, focusable,
 *    labelled region, and scrolling it leaves the header and footer in place.
 *    Its focus ring is drawn inside its edge.
 * 3. **Every state renders what it claims**: six rows tinted by status, a
 *    message when there are none, placeholders in a busy region while loading,
 *    one alert with a retry when the load failed, and inert buttons when
 *    disabled.
 * 4. **AA contrast** on every text the block paints, per scheme.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/list-container/";

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

type Placement = "under" | "stacked" | "inline";

interface BlockMetrics {
  /** Width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** Whether the heading is set at `--text-heading-sm` rather than `--text-body-lg`. */
  largeHeading: boolean;
  /** Where the first row's status and time sit, when rows render. */
  placement: Placement | null;
  /** Whether the first row's time is right-aligned in a fixed column. */
  alignedTimes: boolean | null;
  /** The Badge status of each row, in order. */
  statuses: string[];
  /** The footer's summary line, if any. */
  count: string | null;
  /** Whether every button in this copy is disabled. */
  allButtonsInert: boolean;
  /** Skeletons inside a busy `status` region. */
  busyPlaceholders: number;
  /** Whether this copy renders the "No tasks yet" message. */
  emptyMessage: boolean;
  /** Whether this copy renders the failed-load alert with its retry. */
  failedLoad: boolean;
}

async function showState(page: Page, state: State): Promise<void> {
  const block = page.locator(`[data-demo-state="${state}"] section.moderno-block-list-container`);
  await block.scrollIntoViewIfNeeded();
  await block.waitFor({ state: "visible" });
}

async function blockMetrics(page: Page, state: State): Promise<BlockMetrics[]> {
  return page.evaluate((state) => {
    const panel = document.querySelector(`[data-demo-state="${state}"]`);
    if (!panel) throw new Error(`no preview for the ${state} state on the page`);
    return [...panel.querySelectorAll("section.moderno-block-list-container")].map((section) => {
      const heading = section.querySelector("h2");
      if (!heading) throw new Error("the list-container block did not render its own markup");

      const probe = document.createElement("span");
      probe.style.fontSize = "var(--text-heading-sm)";
      section.append(probe);
      const large = getComputedStyle(probe).fontSize;
      probe.remove();

      const list = section.querySelector('[role="region"] ul');
      const busy = section.querySelector('[role="status"][aria-busy="true"]');
      const firstRow = list?.querySelector("li");

      let placement: Placement | null = null;
      let alignedTimes: boolean | null = null;
      if (firstRow) {
        const [, text, trailing] = [...firstRow.children];
        if (!text || !trailing) throw new Error("a row rendered no text or trailing column");
        const textBox = text.getBoundingClientRect();
        const trailingBox = trailing.getBoundingClientRect();
        if (trailingBox.left >= textBox.right - 1) {
          placement = getComputedStyle(trailing).flexDirection === "column" ? "stacked" : "inline";
        } else if (trailingBox.top >= textBox.bottom - 1) {
          placement = "under";
        }
        const time = trailing.querySelector("span:not([data-scope])");
        if (time) {
          const probeWidth = document.createElement("span");
          probeWidth.style.cssText = "display:block;width:calc(var(--spacing) * 24)";
          section.append(probeWidth);
          const column = probeWidth.getBoundingClientRect().width;
          probeWidth.remove();
          alignedTimes =
            getComputedStyle(time).textAlign === "right" &&
            Math.abs(time.getBoundingClientRect().width - column) < 1;
        }
      }

      const buttons = [...section.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];
      const alert = section.querySelector('[data-scope="alert"][data-part="root"]');
      const footer = section.querySelector('[data-scope="card"][data-part="footer"]');

      return {
        containerWidth: section.getBoundingClientRect().width,
        largeHeading: getComputedStyle(heading).fontSize === large,
        placement,
        alignedTimes,
        statuses: list
          ? [...list.querySelectorAll('[data-scope="badge"][data-part="root"]')].map(
              (badge) => badge.getAttribute("data-variant") ?? "",
            )
          : [],
        count: footer?.querySelector("p")?.textContent?.trim() ?? null,
        allButtonsInert: buttons.length > 0 && buttons.every((button) => button.disabled),
        busyPlaceholders: busy ? busy.querySelectorAll('[data-scope="skeleton"]').length : 0,
        emptyMessage: !list && section.textContent?.includes("No tasks yet") === true,
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
      `[data-demo-state="${state}"] section.moderno-block-list-container`,
    );
    if (!block) throw new Error(`the ${state} list-container demo did not render`);

    const pick = (root: Element, selector: string): Element => {
      const el = root.querySelector(selector);
      if (!el) throw new Error(`${state}: missing ${selector}`);
      return el;
    };
    const against = (el: Element) => ratio(getComputedStyle(el).color, surfaceOf(el));

    if (state === "empty") {
      const [title, body] = [...block.querySelectorAll('[class*="border-y"] p')];
      if (!title || !body) throw new Error("empty: missing the message");
      return { emptyTitle: against(title), emptyBody: against(body) };
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
      headingDescription: against(pick(block, '[data-scope="card"][data-part="description"]')),
      count: against(pick(block, '[data-scope="card"][data-part="footer"] p')),
      footerAction: against(
        pick(block, '[data-scope="card"][data-part="footer"] [data-scope="button"]'),
      ),
    };
    // One entry per row, so a status whose tint is too light for its own text
    // fails by name rather than hiding behind the others.
    for (const row of block.querySelectorAll('[role="region"] li')) {
      const [avatar, text, trailing] = [...row.children];
      const [title, subtitle] = text ? [...text.children] : [];
      if (!avatar || !title || !subtitle || !trailing) throw new Error("a row is missing a part");
      const name = title.textContent?.trim() ?? "row";
      ratios[`${name} initials`] = against(pick(avatar, '[data-part="fallback"]'));
      ratios[`${name} title`] = against(title);
      ratios[`${name} subtitle`] = against(subtitle);
      ratios[`${name} status`] = against(pick(trailing, '[data-scope="badge"]'));
      ratios[`${name} time`] = against(pick(trailing, "span:not([data-scope])"));
    }
    return ratios;
  }, state);
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`list-container — ${scheme}`, () => {
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
          if (block.placement !== null) {
            const expected: Placement =
              block.containerWidth >= CONTAINER_MD
                ? "inline"
                : block.containerWidth >= CONTAINER_SM
                  ? "stacked"
                  : "under";
            expect(block.placement, `${where}: status and time`).toBe(expected);
            expect(block.alignedTimes, `${where}: time column`).toBe(
              block.containerWidth >= CONTAINER_LG,
            );
            expect(block.statuses, `${where}: statuses`).toEqual([
              "info",
              "warning",
              "success",
              "error",
              "success",
              "info",
            ]);
            expect(block.count, `${where}: footer count`).toBe("6 tasks");
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
        expect(
          blocks.filter((block) => block.busyPlaceholders === 12).length,
          "the loading render: four placeholder rows of three skeletons",
        ).toBe(1);
        expect(blocks.filter((block) => block.failedLoad).length, "the failed-load render").toBe(1);
        expect(lists.filter((block) => block.allButtonsInert).length, "the disabled render").toBe(
          1,
        );
        // With nothing to list, the footer has no count and its action is inert.
        const empty = blocks.find((block) => block.emptyMessage)!;
        expect(empty.count, "the empty footer's count").toBeNull();
        expect(empty.allButtonsInert, "the empty footer's action").toBe(true);

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

    test("scrolls only its body, which is labelled and focusable", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const region = page.locator(
        '[data-demo-state="default"] section.moderno-block-list-container [role="region"]',
      );
      await expect(region).toHaveAttribute("aria-label", "Sprint tasks");
      await expect(region).toHaveAttribute("tabindex", "0");

      const scroll = await region.evaluate((el) => {
        const section = el.closest("section")!;
        const header = section.querySelector('[data-scope="card"][data-part="header"]')!;
        const footer = section.querySelector('[data-scope="card"][data-part="footer"]')!;
        const before = [header.getBoundingClientRect().top, footer.getBoundingClientRect().top];
        const overflows = el.scrollHeight > el.clientHeight;
        el.scrollTop = el.scrollHeight;
        const after = [header.getBoundingClientRect().top, footer.getBoundingClientRect().top];
        return {
          overflowY: getComputedStyle(el).overflowY,
          overflows,
          scrolled: el.scrollTop > 0,
          before,
          after,
        };
      });
      expect(scroll.overflowY).toBe("auto");
      expect(scroll.overflows, "six rows overflow the body").toBe(true);
      expect(scroll.scrolled, "the body scrolls").toBe(true);
      expect(scroll.after, "the header and footer stay put").toEqual(scroll.before);

      // Keyboard focus lands on the region and draws its ring inside the edge.
      await page
        .locator('[data-demo-state="default"] section.moderno-block-list-container h2')
        .click();
      await page.keyboard.press("Tab");
      const ring = await region.evaluate((el) => {
        const probe = document.createElement("span");
        probe.style.color = "var(--ring)";
        el.append(probe);
        const ringColor = getComputedStyle(probe).color;
        probe.remove();
        const style = getComputedStyle(el);
        return {
          focused: el.matches(":focus-visible"),
          style: style.outlineStyle,
          width: style.outlineWidth,
          offset: style.outlineOffset,
          matchesRing: style.outlineColor === ringColor,
        };
      });
      expect(ring).toEqual({
        focused: true,
        style: "solid",
        width: "2px",
        offset: "-2px",
        matchesRing: true,
      });
    });

    test("clears AA contrast on every text it paints", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      const ratios = await contrastRatios(page);
      expect(
        ratios["Run the accessibility audit status"],
        `${scheme}: rows measured`,
      ).toBeDefined();
      for (const [what, ratio] of Object.entries(ratios)) {
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
      }
    });
  });
}
