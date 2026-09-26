/**
 * The hero block, checked on the built docs page at the three widths of the
 * responsive policy (375 / 768 / 1280) in both colour schemes. It asserts text
 * and computed styles; no screenshot baseline is committed.
 *
 * Four claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` the actions stack,
 *    each as wide as the block; at `--container-sm` they sit side by side; at
 *    `--container-md` the title and the subtitle step up a size; at
 *    `--container-lg` the block takes more room above and below. Each copy on
 *    the page is measured against its own container width, so the narrow frame
 *    stays stacked at 1280 while the wide frame has crossed every step.
 * 2. **Every state renders what it claims**, at every width: kicker, serif
 *    title, subtitle and both actions by default, the title alone when every
 *    other text is empty, placeholders in a busy region while loading, an
 *    error Alert with a retry in place of the actions, and inert buttons when
 *    disabled. Every copy is centred in its box.
 * 3. **AA contrast** in both schemes on every text the block paints.
 * 4. **Hover and focus-visible** on both actions.
 *
 * It also checks that an empty `error` string counts as no error: the actions
 * come back, with no alert.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/hero/";

const BLOCK = "section.moderno-block-hero";

/** The copy the block ships with. */
const KICKER = "Now in public beta";
const TITLE = "Run your business, not your books";
const ACTIONS = ["Start free trial", "Book a demo"];
const ERROR = "We could not load the trial plans.";

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** The kicker's text, or null when there is none. */
  kicker: string | null;
  /** The heading's text, or null while loading. */
  title: string | null;
  /** The heading's font size, in px, or null while loading. */
  titleSize: number | null;
  /** Whether the heading is set in the contract's `--font-serif`. */
  serifTitle: boolean | null;
  /** The subtitle's font size, in px, or null when there is none. */
  subtitleSize: number | null;
  /** The block's padding above its content, in px. */
  paddingTop: number;
  /** The action labels, in order, including the retry inside an error. */
  actions: string[];
  /** The `data-variant` of every action, in order. */
  actionVariants: string[];
  /** Whether the second action sits beside the first rather than under it. */
  actionsBeside: boolean | null;
  /** Whether a lone or first call to action spans the whole content width. */
  actionFullWidth: boolean | null;
  /** Whether every action in this copy is disabled. */
  allActionsInert: boolean;
  /** Skeleton placeholders inside a busy status region. */
  placeholders: number;
  /** Whether an error Alert is announced. */
  alert: boolean;
  /** Horizontal offset between the first child's centre and the block's, in px. */
  offCentre: number;
}

/**
 * The page's previews (islands/HeroBlockDemo.svelte): the main preview mounts
 * the default; the Examples frame the same block at 18rem, 30rem, 40rem and
 * 50rem, then mount the title-only, loading, error and disabled states. Every
 * copy is found by the `data-demo-state` its wrapper carries.
 */
const STATES = [
  "default",
  "narrow",
  "compact",
  "panel",
  "wide",
  "title-only",
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
      const wrapper = document.querySelector(`[data-demo-state="${state}"]`);
      if (!wrapper) throw new Error(`no preview for the ${state} state on the page`);
      const normalise = (family: string) => family.replace(/["'\s]/g, "");
      const serif = normalise(
        getComputedStyle(document.documentElement).getPropertyValue("--font-serif"),
      );

      return [...wrapper.querySelectorAll<HTMLElement>(selector)].map((section) => {
        const body = section.firstElementChild as HTMLElement | null;
        const first = body?.firstElementChild as HTMLElement | null;
        if (!body || !first) throw new Error("the hero block did not render its own markup");

        const kicker = section.querySelector('[data-scope="badge"]');
        const heading = section.querySelector("h1");
        const subtitle = section.querySelector("h1 + p");
        const buttons = [...section.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];
        const calls = buttons.filter((b) => !b.closest('[data-scope="alert"]'));
        const busy = section.querySelector('[role="status"][aria-busy="true"]');
        const [one, two] = calls.map((b) => b.getBoundingClientRect());
        const contentWidth =
          body.clientWidth -
          parseFloat(getComputedStyle(body).paddingInlineStart) -
          parseFloat(getComputedStyle(body).paddingInlineEnd);
        const blockBox = section.getBoundingClientRect();
        const firstBox = first.getBoundingClientRect();

        return {
          containerWidth: section.offsetWidth,
          kicker: kicker?.textContent?.trim() ?? null,
          title: heading?.textContent?.trim() ?? null,
          titleSize: heading ? parseFloat(getComputedStyle(heading).fontSize) : null,
          serifTitle: heading ? normalise(getComputedStyle(heading).fontFamily) === serif : null,
          subtitleSize: subtitle ? parseFloat(getComputedStyle(subtitle).fontSize) : null,
          paddingTop: parseFloat(getComputedStyle(body).paddingTop),
          actions: buttons.map((b) => b.textContent?.trim() ?? ""),
          actionVariants: buttons.map((b) => b.getAttribute("data-variant") ?? ""),
          actionsBeside: one && two ? two.top < one.bottom : null,
          actionFullWidth: one ? Math.abs(one.width - contentWidth) < 1 : null,
          allActionsInert: buttons.length > 0 && buttons.every((b) => b.disabled),
          placeholders: busy ? busy.querySelectorAll('[data-scope="skeleton"]').length : 0,
          alert: section.querySelector('[data-scope="alert"][role="alert"]') !== null,
          offCentre: Math.abs(
            firstBox.left + firstBox.width / 2 - (blockBox.left + blockBox.width / 2),
          ),
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
async function textRatios(page: Page, state: "default" | "error"): Promise<Record<string, number>> {
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

      const block = document.querySelector(`[data-demo-state="${state}"] ${selector}`);
      if (!block) throw new Error(`the ${state} preview did not render`);

      const against = (el: Element) => ratio(getComputedStyle(el).color, surfaceOf(el));
      const parts: Array<[string, Element | null]> = [
        ["kicker", block.querySelector('[data-scope="badge"]')],
        ["title", block.querySelector("h1")],
        ["subtitle", block.querySelector("h1 + p")],
        ["alert title", block.querySelector('[data-scope="alert"] [data-part="title"]')],
        [
          "alert description",
          block.querySelector('[data-scope="alert"] [data-part="description"]'),
        ],
      ];

      const ratios: Record<string, number> = {};
      for (const [name, el] of parts) {
        if (el) ratios[`${state} ${name}`] = against(el);
      }
      for (const button of block.querySelectorAll('[data-scope="button"]')) {
        ratios[`${state} ${button.textContent?.trim() ?? "button"} button`] = against(button);
      }
      return ratios;
    },
    { state, selector: BLOCK },
  );
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`hero — ${scheme}`, () => {
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
          if (block.actionsBeside !== null) {
            expect(block.actionsBeside, `${where}: actions side by side`).toBe(sm);
          }
          if (block.actionFullWidth !== null) {
            expect(block.actionFullWidth, `${where}: action as wide as the block`).toBe(!sm);
          }
          expect(block.paddingTop, `${where}: room above`).toBe(
            block.containerWidth >= CONTAINER_LG ? 96 : 48,
          );
          expect(block.offCentre, `${where}: centred`).toBeLessThan(1);
          expect(block.alert, `${where}: error announced`).toBe(state === "error");

          if (state === "loading") {
            expect(block.title, `${where}: no title while loading`).toBeNull();
            expect(block.kicker, `${where}: no kicker while loading`).toBeNull();
            expect(block.placeholders, `${where}: placeholders`).toBe(6);
            expect(block.actions, `${where}: no actions while loading`).toEqual([]);
            continue;
          }

          expect(block.serifTitle, `${where}: serif title`).toBe(true);
          if (state === "title-only") {
            expect(block.title, `${where}: title`).toBe("Built for the way small teams work");
            expect(block.kicker, `${where}: no kicker`).toBeNull();
            expect(block.subtitleSize, `${where}: no subtitle`).toBeNull();
            expect(block.actions, `${where}: no actions`).toEqual([]);
          } else if (state === "error") {
            expect(block.title, `${where}: title stays`).toBe(TITLE);
            expect(block.actions, `${where}: retry only`).toEqual(["Try again"]);
            expect(block.actionVariants, `${where}: retry variant`).toEqual(["outline"]);
          } else {
            expect(block.kicker, `${where}: kicker`).toBe(KICKER);
            expect(block.title, `${where}: title`).toBe(TITLE);
            expect(block.actions, `${where}: actions`).toEqual(ACTIONS);
            expect(block.actionVariants, `${where}: variants`).toEqual(["primary", "outline"]);
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

        expect(
          blocks.filter((block) => block.allActionsInert).map((block) => block.state),
          "the disabled render",
        ).toEqual(["disabled"]);

        // The title and the subtitle step up at `--container-md`: one size
        // below it, one larger size from it on.
        for (const metric of ["titleSize", "subtitleSize"] as const) {
          const below = new Set(
            blocks
              .filter((b) => b.containerWidth < CONTAINER_MD && b[metric] !== null)
              .map((b) => b[metric]),
          );
          const above = new Set(
            blocks
              .filter((b) => b.containerWidth >= CONTAINER_MD && b[metric] !== null)
              .map((b) => b[metric]),
          );
          expect(below.size, `one ${metric} below @md`).toBe(1);
          expect(above.size, `one ${metric} from @md`).toBe(1);
          expect([...above][0]!, `${metric} steps up at @md`).toBeGreaterThan([...below][0]!);
        }

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

    test("sits in the middle of its preview", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      for (const state of ["default", "title-only", "loading", "error", "disabled"] as const) {
        await showState(page, state);
        const gaps = await page.evaluate(
          ({ state, selector }) => {
            const wrapper = document.querySelector(`[data-demo-state="${state}"]`)!;
            const panel = wrapper.closest(".preview-panel--demo")!.getBoundingClientRect();
            const block = wrapper.querySelector(selector)!;
            const content = [...block.firstElementChild!.children]
              .filter((el) => !el.classList.contains("sr-only"))
              .map((el) => el.getBoundingClientRect());
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
      const ratios = {
        ...(await textRatios(page, "default")),
        ...(await textRatios(page, "error")),
      };
      for (const label of [
        "default kicker",
        "default title",
        "default subtitle",
        "error alert title",
        "error alert description",
        ...ACTIONS.map((action) => `default ${action} button`),
        "error Try again button",
      ]) {
        expect(Object.keys(ratios), `${scheme}: ${label} measured`).toContain(label);
      }
      for (const [what, ratio] of Object.entries(ratios)) {
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
      }
    });

    test("shows hover and focus-visible on both actions", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const buttons = page.locator(`[data-demo-state="default"] ${BLOCK} [data-scope="button"]`);
      await expect(buttons).toHaveCount(2);

      for (const index of [0, 1]) {
        const button = buttons.nth(index);
        const name = ACTIONS[index]!;
        await expect(button).toHaveAccessibleName(name);

        // The primary action darkens through a filter; the outline one takes
        // the --accent fill.
        const surface = () =>
          button.evaluate((el) => {
            const style = getComputedStyle(el);
            return `${style.backgroundColor} ${style.filter}`;
          });
        await page.mouse.move(0, 0);
        const resting = await surface();
        await button.hover();
        expect(await surface(), `${scheme}: ${name} hover`).not.toBe(resting);

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

    test("announces the loading block once and the failed load as an alert", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const region = page.locator(`[data-demo-state="loading"] ${BLOCK} [role="status"]`);
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region).toContainText("Loading");
      const hidden = await region.evaluate((el) =>
        [...el.querySelectorAll('[data-scope="skeleton"]')].every(
          (placeholder) => placeholder.closest('[aria-hidden="true"]') !== null,
        ),
      );
      expect(hidden).toBe(true);

      await showState(page, "error");
      const alert = page.locator(`[data-demo-state="error"] ${BLOCK} [role="alert"]`);
      await expect(alert).toContainText(ERROR);
      await expect(alert.getByRole("button", { name: "Try again" })).toBeVisible();
    });

    test("treats an empty error string as no error", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "error");
      const block = page.locator(`[data-demo-state="error"] ${BLOCK}`);

      // The demo's retry clears its message to "", the way a consumer holding
      // the error as a string does once the load succeeds.
      await block.getByRole("button", { name: "Try again" }).click();

      await expect(block.locator('[data-scope="alert"]')).toHaveCount(0);
      await expect(block.locator('[data-scope="button"]')).toHaveText(ACTIONS);
    });
  });
}
