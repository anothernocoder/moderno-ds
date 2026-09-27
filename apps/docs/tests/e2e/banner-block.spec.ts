/**
 * The banner block, checked on the built docs page at the three widths of the
 * responsive policy (375 / 768 / 1280) in both colour schemes. It asserts text
 * and computed styles; no screenshot baseline is committed.
 *
 * Five claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` the action sits under
 *    the message; at `--container-sm` it moves beside it; at `--container-md`
 *    the badge, title and message share one line; at `--container-lg` the
 *    message and action centre in the strip. Each copy on the page is measured
 *    against its own container width.
 * 2. **Every state renders what it claims**, at every width: the strip with its
 *    badge, title, message, action and dismiss; nothing at all when empty; one
 *    skeleton strip in a busy region while loading; one alert with a retry on
 *    a failed load; and both buttons inert when disabled.
 * 3. **AA contrast** in both schemes on every text the block paints.
 * 4. **Hover and focus-visible** on the action button.
 * 5. **Names and dismissal**: the strip is a region named "Announcement", its
 *    dismiss button is named after it, and pressing it hides the strip.
 */
import { expect, test, type Locator, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/banner/";

const BLOCK = ".moderno-block-banner";

/** The sample copy the block ships with. */
const BADGE = "New";
const TITLE = "Bank sync is live";
const MESSAGE = "Connect your accounts and watch every transaction match its receipt.";
const ACTION = "See how it works";
const DISMISS = "Dismiss announcement";

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** The block's rendered height, in px. */
  height: number;
  /** The strip's badge, title and message, or null when no strip renders. */
  copy: { badge: string; title: string; message: string } | null;
  /** The action button's label. */
  action: string | null;
  /** Whether the strip carries a dismiss button. */
  dismissible: boolean;
  /** Whether the action sits beside the message rather than below it. */
  actionBesideText: boolean | null;
  /** Whether the badge and the message start on the title's line. */
  oneLine: boolean | null;
  /** Whether the message and action sit centred in the strip. */
  centred: boolean | null;
  /** Whether every button in this copy is disabled. */
  allButtonsInert: boolean;
  /** Skeleton strips inside a busy status region, each hidden from assistive tech. */
  skeletonStrips: number;
  /** Whether this copy renders an error alert with a retry in place of the strip. */
  failedLoad: boolean;
}

/**
 * The page's previews (islands/BannerBlockDemo.svelte): the main preview mounts
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
    ({ state, selector }) => {
      const panel = document.querySelector(`[data-demo-state="${state}"]`);
      if (!panel) throw new Error(`no preview for the ${state} state on the page`);
      return [...panel.querySelectorAll<HTMLElement>(selector)].map((block) => {
        const strip = block.querySelector<HTMLElement>(
          ':scope > section[aria-label="Announcement"]',
        );
        const text = strip?.querySelector<HTMLElement>("p") ?? null;
        const badge = text?.querySelector<HTMLElement>('[data-scope="badge"]') ?? null;
        const title = text?.querySelector<HTMLElement>("strong") ?? null;
        const message =
          text?.querySelector<HTMLElement>(":scope > span:not([aria-hidden]):not([data-scope])") ??
          null;
        const action =
          strip?.querySelector<HTMLButtonElement>('[data-scope="button"]:not([aria-label])') ??
          null;
        const dismiss =
          strip?.querySelector<HTMLButtonElement>('[data-scope="button"][aria-label]') ?? null;
        const content = text?.parentElement ?? null;

        let centred: boolean | null = null;
        if (strip && content) {
          const s = strip.getBoundingClientRect();
          const c = content.getBoundingClientRect();
          centred = Math.abs(c.left - s.left - (s.right - c.right)) <= 1;
        }

        let oneLine: boolean | null = null;
        if (title && message && badge) {
          const t = title.getClientRects()[0]!;
          const m = message.getClientRects()[0]!;
          const b = badge.getBoundingClientRect();
          oneLine = m.top < t.bottom && m.left > t.left && b.top < t.bottom && b.right <= t.left;
        }

        const buttons = [...block.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];
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
            badge && title && message
              ? {
                  badge: badge.textContent?.trim() ?? "",
                  title: title.textContent?.trim() ?? "",
                  message: message.textContent?.trim() ?? "",
                }
              : null,
          action: action?.textContent?.trim() ?? null,
          dismissible: dismiss !== null,
          actionBesideText:
            action && text
              ? action.getBoundingClientRect().left >= text.getBoundingClientRect().right
              : null,
          oneLine,
          centred,
          allButtonsInert: buttons.length > 0 && buttons.every((button) => button.disabled),
          skeletonStrips: skeletons.length,
          failedLoad:
            failed !== null &&
            failed
              .querySelector('[data-part="action"] [data-scope="button"]')
              ?.textContent?.trim() === "Try again",
        };
      });
    },
    { state, selector: BLOCK },
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
  test.describe(`banner — ${scheme}`, () => {
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
              badge: BADGE,
              title: TITLE,
              message: MESSAGE,
            });
            expect(block.action, `${where}: action`).toBe(ACTION);
            expect(block.dismissible, `${where}: dismiss`).toBe(true);

            expect(block.actionBesideText, `${where}: action beside the message`).toBe(
              block.containerWidth >= CONTAINER_SM,
            );
            expect(block.oneLine, `${where}: badge, title and message on one line`).toBe(
              block.containerWidth >= CONTAINER_MD,
            );
            expect(block.centred, `${where}: centred in the strip`).toBe(
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

        const strips = blocks.filter((block) => block.copy !== null);
        expect(
          strips.map((block) => block.state),
          `${scheme} ${width}px: copies rendering the strip`,
        ).toEqual(["default", "narrow", "compact", "panel", "wide", "disabled"]);

        const empty = blocks.find((block) => block.state === "empty")!;
        expect(empty.height, "the empty render takes no space").toBe(0);
        expect(empty.skeletonStrips + Number(empty.failedLoad), "the empty render").toBe(0);

        expect(
          blocks.filter((block) => block.skeletonStrips === 1).map((block) => block.state),
          "the loading render",
        ).toEqual(["loading"]);
        expect(
          blocks.filter((block) => block.failedLoad).map((block) => block.state),
          "the failed-load render",
        ).toEqual(["error"]);
        expect(
          strips.filter((block) => block.allButtonsInert).map((block) => block.state),
          "the disabled render",
        ).toEqual(["disabled"]);

        // Each step is exercised on both sides at every viewport, so a step that
        // silently stopped firing cannot pass this file.
        const containerWidths = strips.map((b) => b.containerWidth);
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
          badge: '[data-scope="badge"]',
          title: "strong",
          message: "p > span:not([aria-hidden]):not([data-scope])",
          action: '[data-scope="button"]:not([aria-label])',
          dismiss: '[data-scope="button"][aria-label]',
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

      for (const text of [`badge "${BADGE}"`, `title "${TITLE}"`, `message "${MESSAGE}"`]) {
        expect(ratios[text], `${scheme}: ${text} measured`).toBeDefined();
      }
      for (const [what, ratio] of Object.entries(ratios)) {
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
      }
    });

    test("shows hover and focus-visible on the action button", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const action = defaultButton(page, ACTION);

      // A primary Button darkens through a filter on hover, not a new fill.
      const surface = () =>
        action.evaluate((el) => {
          const style = getComputedStyle(el);
          return `${style.backgroundColor} ${style.filter}`;
        });
      await page.mouse.move(0, 0);
      const resting = await surface();
      await action.hover();
      expect(await surface(), `${scheme}: hover surface`).not.toBe(resting);

      await page.mouse.move(0, 0);
      await action.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const outline = await action.evaluate((el) => ({
        focused: el.matches(":focus-visible"),
        style: getComputedStyle(el).outlineStyle,
      }));
      expect(outline.focused, `${scheme}: keyboard focus`).toBe(true);
      expect(outline.style, `${scheme}: focus ring`).not.toBe("none");
    });

    test("names the strip and its dismiss, and hides the strip when dismissed", async ({
      page,
    }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      await expect(block.getByRole("region", { name: "Announcement" })).toBeVisible();

      const dismiss = defaultButton(page, DISMISS);
      await expect(dismiss).toBeVisible();
      await dismiss.click();
      await expect(block.getByRole("region", { name: "Announcement" })).toHaveCount(0);
      expect(
        await block.evaluate((el) => (el as HTMLElement).offsetHeight),
        "a dismissed strip takes no space",
      ).toBe(0);
    });

    test("announces the loading strip once, not each skeleton", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const region = page.locator(`[data-demo-state="loading"] ${BLOCK} [role="status"]`);
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region).toContainText("Loading the announcement");
      const hidden = await region.evaluate((el) =>
        [...el.querySelectorAll(":scope > div")].every(
          (row) => row.getAttribute("aria-hidden") === "true",
        ),
      );
      expect(hidden).toBe(true);
    });
  });
}
