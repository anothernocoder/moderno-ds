/**
 * The promo block, checked on the built docs page at the three widths of the
 * responsive policy (375 / 768 / 1280) in both colour schemes. It asserts text
 * and computed styles; no screenshot baseline is committed.
 *
 * Five claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` the offer and its
 *    detail stack, the code and action under them; at `--container-sm` the
 *    detail joins the offer's line; at `--container-md` the code and action
 *    move beside the text and the detail steps back under the offer to leave
 *    them room; at `--container-lg` the offer, detail, code and action share
 *    one line, centred in the bar.
 *    Each copy on the page is measured against its own container width.
 * 2. **Every state renders what it claims**, at every width: the bar with its
 *    offer, detail, code, action and dismiss; nothing at all when empty; one
 *    skeleton bar in a busy region while loading; one alert with a retry on a
 *    failed load; and every button inert when disabled.
 * 3. **AA contrast** in both schemes on every text the block paints.
 * 4. **Hover and focus-visible** on the code and action buttons.
 * 5. **Names, copying and dismissal**: the bar is a region named "Promotion";
 *    pressing the code puts it on the clipboard and announces it; pressing
 *    the dismiss hides the bar.
 */
import { expect, test, type Locator, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/promo/";

const BLOCK = ".moderno-block-promo";

/** The sample copy the block ships with. */
const OFFER = "20% off annual plans";
const DETAIL = "Ends Sunday";
const CODE = "MONTHEND20";
const ACTION = "Claim offer";
const COPY = `Copy code ${CODE}`;
const DISMISS = "Dismiss promotion";

const CODE_BUTTON = `[data-scope="button"][aria-label="${COPY}"]`;
const ACTION_BUTTON = '[data-scope="button"]:not([aria-label])';
const DISMISS_BUTTON = `[data-scope="button"][aria-label="${DISMISS}"]`;

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** The block's rendered height, in px. */
  height: number;
  /** The bar's offer, detail and code, or null when no bar renders. */
  copy: { offer: string; detail: string; code: string } | null;
  /** The action button's label. */
  action: string | null;
  /** Whether the bar carries a dismiss button. */
  dismissible: boolean;
  /** Whether the detail starts on the offer's line. */
  detailOnOfferLine: boolean | null;
  /** Whether the code and action sit beside the text rather than below it. */
  buttonsBesideText: boolean | null;
  /** Whether the text, code and action sit centred in the bar. */
  centred: boolean | null;
  /** Whether every button in this copy is disabled. */
  allButtonsInert: boolean;
  /** Skeleton bars inside a busy status region, each hidden from assistive tech. */
  skeletonBars: number;
  /** Whether this copy renders an error alert with a retry in place of the bar. */
  failedLoad: boolean;
}

/**
 * The page's previews (islands/PromoBlockDemo.svelte): the main preview mounts
 * the default; the Examples frame the same block at 18rem, 30rem, 40rem and
 * 50rem, then mount the empty, loading, error and disabled states. Every copy is
 * found by the `data-demo-state` its wrapper carries.
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
  const preview = page.locator(`[data-demo-state="${state}"]`).first();
  await preview.scrollIntoViewIfNeeded();
  await page.locator(`[data-demo-state="${state}"] ${BLOCK}`).waitFor({ state: "attached" });
}

async function blockMetrics(page: Page, state: State): Promise<BlockMetrics[]> {
  return page.evaluate(
    ({ state, selector, codeButton, actionButton, dismissButton }) => {
      const panel = document.querySelector(`[data-demo-state="${state}"]`);
      if (!panel) throw new Error(`no preview for the ${state} state on the page`);
      return [...panel.querySelectorAll<HTMLElement>(selector)].map((block) => {
        const bar = block.querySelector<HTMLElement>(':scope > section[aria-label="Promotion"]');
        const text = bar?.querySelector<HTMLElement>("p") ?? null;
        const offer = text?.querySelector<HTMLElement>("strong") ?? null;
        const detail = text?.querySelector<HTMLElement>(":scope > span:not([aria-hidden])") ?? null;
        const code = bar?.querySelector<HTMLButtonElement>(codeButton) ?? null;
        const action = bar?.querySelector<HTMLButtonElement>(actionButton) ?? null;
        const dismiss = bar?.querySelector<HTMLButtonElement>(dismissButton) ?? null;
        const buttons = code?.parentElement ?? null;
        const content = text?.parentElement ?? null;

        let centred: boolean | null = null;
        if (bar && content) {
          const s = bar.getBoundingClientRect();
          const c = content.getBoundingClientRect();
          centred = Math.abs(c.left - s.left - (s.right - c.right)) <= 1;
        }

        let detailOnOfferLine: boolean | null = null;
        if (offer && detail) {
          const o = offer.getClientRects()[0]!;
          const d = detail.getClientRects()[0]!;
          detailOnOfferLine = d.top < o.bottom && d.left > o.left;
        }

        const allButtons = [...block.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];
        const busy = block.querySelector('[role="status"][aria-busy="true"]');
        const skeletons = busy
          ? [...busy.querySelectorAll<HTMLElement>(':scope > [aria-hidden="true"]')].filter(
              (row) => row.querySelector('[data-scope="skeleton"]') !== null,
            )
          : [];
        const failed = block.querySelector<HTMLElement>(
          ':scope > [data-scope="alert"][data-part="root"][data-variant="error"]',
        );

        return {
          containerWidth: block.offsetWidth,
          height: block.offsetHeight,
          copy:
            offer && detail && code
              ? {
                  offer: offer.textContent?.trim() ?? "",
                  detail: detail.textContent?.trim() ?? "",
                  code: code.textContent?.trim() ?? "",
                }
              : null,
          action: action?.textContent?.trim() ?? null,
          dismissible: dismiss !== null,
          detailOnOfferLine,
          buttonsBesideText:
            buttons && text
              ? buttons.getBoundingClientRect().left >= text.getBoundingClientRect().right
              : null,
          centred,
          allButtonsInert: allButtons.length > 0 && allButtons.every((button) => button.disabled),
          skeletonBars: skeletons.length,
          failedLoad:
            failed !== null &&
            failed
              .querySelector('[data-part="action"] [data-scope="button"]')
              ?.textContent?.trim() === "Try again",
        };
      });
    },
    {
      state,
      selector: BLOCK,
      codeButton: CODE_BUTTON,
      actionButton: ACTION_BUTTON,
      dismissButton: DISMISS_BUTTON,
    },
  );
}

/**
 * Contrast ratios of every text under `root`, read off the rendered page.
 * Colours are resolved through a canvas: the contract's values are OKLCH, and
 * the browser is the only thing that converts them exactly the way it painted
 * them.
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
        const label = el.getAttribute("aria-label") || el.textContent?.trim() || String(index);
        ratios[`${name} "${label}"`] = ratio(getComputedStyle(el).color, surfaceOf(el));
      }
    }
    return ratios;
  }, targets);
}

/** A button of the default copy, by its accessible name. */
function defaultButton(page: Page, name: string): Locator {
  return page
    .locator(`[data-demo-state="default"] ${BLOCK}`)
    .getByRole("button", { name, exact: true });
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`promo — ${scheme}`, () => {
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

          if (block.copy) {
            expect(block.copy, `${where}: copy`).toEqual({
              offer: OFFER,
              detail: DETAIL,
              code: CODE,
            });
            expect(block.action, `${where}: action`).toBe(ACTION);
            expect(block.dismissible, `${where}: dismiss`).toBe(true);

            expect(block.detailOnOfferLine, `${where}: detail on the offer's line`).toBe(
              block.containerWidth >= CONTAINER_SM &&
                (block.containerWidth < CONTAINER_MD || block.containerWidth >= CONTAINER_LG),
            );
            expect(block.buttonsBesideText, `${where}: code and action beside the text`).toBe(
              block.containerWidth >= CONTAINER_MD,
            );
            expect(block.centred, `${where}: centred in the bar`).toBe(
              block.containerWidth >= CONTAINER_LG,
            );
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

        const bars = blocks.filter((block) => block.copy !== null);
        expect(
          bars.map((block) => block.state),
          `${scheme} ${width}px: copies rendering the bar`,
        ).toEqual(["default", "narrow", "compact", "panel", "wide", "disabled"]);

        const empty = blocks.find((block) => block.state === "empty")!;
        expect(empty.height, "the empty render takes no space").toBe(0);
        expect(empty.skeletonBars + Number(empty.failedLoad), "the empty render").toBe(0);

        expect(
          blocks.filter((block) => block.skeletonBars === 1).map((block) => block.state),
          "the loading render",
        ).toEqual(["loading"]);
        expect(
          blocks.filter((block) => block.failedLoad).map((block) => block.state),
          "the failed-load render",
        ).toEqual(["error"]);
        expect(
          bars.filter((block) => block.allButtonsInert).map((block) => block.state),
          "the disabled render",
        ).toEqual(["disabled"]);

        // Each step is exercised on both sides at every viewport, so a step that
        // silently stopped firing cannot pass this file.
        const containerWidths = bars.map((b) => b.containerWidth);
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

      await showState(page, "default");
      ratios = {
        ...ratios,
        ...(await textRatios(page.locator(`[data-demo-state="default"] ${BLOCK}`), {
          offer: "strong",
          detail: "p > span:not([aria-hidden])",
          code: CODE_BUTTON,
          action: ACTION_BUTTON,
          dismiss: DISMISS_BUTTON,
        })),
      };

      await showState(page, "error");
      ratios = {
        ...ratios,
        ...(await textRatios(page.locator(`[data-demo-state="error"] ${BLOCK}`), {
          "failed title": '[data-part="title"]',
          "failed description": '[data-part="description"]',
          "failed action": '[data-scope="button"]',
        })),
      };

      for (const text of [`offer "${OFFER}"`, `detail "${DETAIL}"`, `code "${COPY}"`]) {
        expect(ratios[text], `${scheme}: ${text} measured`).toBeDefined();
      }
      for (const [what, ratio] of Object.entries(ratios)) {
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
      }
    });

    test("shows hover and focus-visible on the code and action buttons", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");

      // A primary Button darkens through a filter on hover; an outline one
      // takes the --accent fill.
      for (const name of [COPY, ACTION]) {
        const button = defaultButton(page, name);
        const surface = () =>
          button.evaluate((el) => {
            const style = getComputedStyle(el);
            return `${style.backgroundColor} ${style.filter}`;
          });
        await page.mouse.move(0, 0);
        const resting = await surface();
        await button.hover();
        expect(await surface(), `${scheme}: ${name} hover surface`).not.toBe(resting);

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

    test("copies the code and announces it", async ({ page, context }) => {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      const announcer = block.locator('section [role="status"]');
      await expect(announcer).toHaveText("");

      await defaultButton(page, COPY).click();
      await expect(announcer).toHaveText("Code copied");
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(CODE);
    });

    test("names the bar and its dismiss, and hides the bar when dismissed", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      await expect(block.getByRole("region", { name: "Promotion" })).toBeVisible();

      const dismiss = defaultButton(page, DISMISS);
      await expect(dismiss).toBeVisible();
      await dismiss.click();
      await expect(block.getByRole("region", { name: "Promotion" })).toHaveCount(0);
      expect(
        await block.evaluate((el) => (el as HTMLElement).offsetHeight),
        "a dismissed bar takes no space",
      ).toBe(0);
    });

    test("announces the loading bar once, not each skeleton", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const region = page.locator(`[data-demo-state="loading"] ${BLOCK} [role="status"]`);
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region).toContainText("Loading the offer");
      const hidden = await region.evaluate((el) =>
        [...el.querySelectorAll(":scope > div")].every(
          (row) => row.getAttribute("aria-hidden") === "true",
        ),
      );
      expect(hidden).toBe(true);
    });
  });
}
