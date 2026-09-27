/**
 * The app-banner block, checked on the built docs page at the three widths of
 * the responsive policy (375 / 768 / 1280) in both colour schemes. It asserts
 * text and computed styles; no screenshot baseline is committed.
 *
 * Five claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` each banner's buttons
 *    sit under its message; at `--container-sm` they move beside it; at
 *    `--container-md` the title and description share one line; at
 *    `--container-lg` each dismiss button shows its label. Each copy on the
 *    page is measured against its own container width.
 * 2. **Every state renders what it claims**, at every width: one tinted
 *    banner per kind (impersonation a warning, trial info, incident an error)
 *    with its action and, where dismissible, a dismiss; nothing at all when
 *    empty; one skeleton banner in a busy region while loading; one alert
 *    with a retry on a failed load; and every button inert when disabled.
 * 3. **AA contrast** in both schemes on every text the block paints.
 * 4. **Hover and focus-visible** on an action button.
 * 5. **Names and roles**: each dismiss button is named after its banner, and
 *    each banner keeps the Alert role of its status.
 */
import { expect, test, type Locator, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/app-banner/";

const BLOCK = ".moderno-block-app-banner";

/** The sample banners the block ships with, in order. */
const TITLES = ["Viewing as Jane Cooper", "12 days left in your trial", "Degraded API performance"];
const VARIANTS = ["warning", "info", "error"];
const ACTIONS = ["Stop impersonating", "Upgrade", "View status"];
const ACTION_VARIANTS = ["outline", "primary", "outline"];
const DISMISSIBLE = ["12 days left in your trial", "Degraded API performance"];

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** The block's rendered height, in px. */
  height: number;
  /** The banner titles, in order. */
  titles: string[];
  /** The `data-variant` of each banner, in order. */
  variants: string[];
  /** The label of each action button, in banner order. */
  actions: string[];
  /** The `data-variant` of each action button, in banner order. */
  actionVariants: string[];
  /** The titles of the banners carrying a dismiss button. */
  dismissible: string[];
  /** Whether the first banner's action sits beside its message rather than below it. */
  actionsBesideText: boolean | null;
  /** Whether each banner's description starts on its title's line. */
  descriptionInline: boolean[];
  /** Whether each dismiss button shows its "Dismiss" label. */
  dismissLabels: boolean[];
  /** Whether every button in this copy is disabled. */
  allButtonsInert: boolean;
  /** Skeleton banners inside a busy status region, each hidden from assistive tech. */
  skeletonBanners: number;
  /** Whether this copy renders an error alert with a retry in place of the banners. */
  failedLoad: boolean;
}

/**
 * The page's previews (islands/AppBannerBlockDemo.svelte): the main preview
 * mounts the default; the Examples frame the same block at 18rem, 30rem, 40rem
 * and 50rem, then mount the empty, loading, error and disabled states. Every
 * copy is found by the `data-demo-state` its wrapper carries.
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
        const banners = [
          ...block.querySelectorAll<HTMLElement>(
            'ul > li > [data-scope="alert"][data-part="root"]',
          ),
        ];
        const titleOf = (banner: Element) =>
          banner.querySelector<HTMLElement>('[data-part="title"]');
        const descriptionOf = (banner: Element) =>
          banner.querySelector<HTMLElement>('[data-part="description"]');
        const dismissOf = (banner: Element) =>
          banner.querySelector<HTMLButtonElement>('[data-scope="button"][aria-label^="Dismiss"]');
        const actionOf = (banner: Element) =>
          banner.querySelector<HTMLButtonElement>(
            '[data-scope="button"]:not([aria-label^="Dismiss"])',
          );

        const first = banners[0];
        const firstAction = first ? actionOf(first) : null;
        const firstText = first ? titleOf(first)?.parentElement : null;
        const actionsBesideText =
          firstAction && firstText
            ? firstAction.getBoundingClientRect().left >= firstText.getBoundingClientRect().right
            : null;

        const actions = banners.flatMap((banner) => {
          const action = actionOf(banner);
          return action ? [action] : [];
        });
        const dismisses = banners.flatMap((banner) => {
          const dismiss = dismissOf(banner);
          return dismiss ? [dismiss] : [];
        });
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
          titles: banners.map((banner) => titleOf(banner)?.textContent?.trim() ?? ""),
          variants: banners.map((banner) => banner.getAttribute("data-variant") ?? ""),
          actions: actions.map((action) => action.textContent?.trim() ?? ""),
          actionVariants: actions.map((action) => action.getAttribute("data-variant") ?? ""),
          dismissible: banners
            .filter((banner) => dismissOf(banner) !== null)
            .map((banner) => titleOf(banner)?.textContent?.trim() ?? ""),
          actionsBesideText,
          descriptionInline: banners.map((banner) => {
            const title = titleOf(banner)!.getBoundingClientRect();
            const description = descriptionOf(banner)!.getClientRects()[0]!;
            return description.top < title.bottom && description.left > title.left;
          }),
          dismissLabels: dismisses.map((dismiss) => {
            const label = [...dismiss.querySelectorAll("span")].find(
              (span) => span.textContent?.trim() === "Dismiss",
            );
            return label ? getComputedStyle(label).display !== "none" : false;
          }),
          allButtonsInert: buttons.length > 0 && buttons.every((button) => button.disabled),
          skeletonBanners: skeletons.length,
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
  test.describe(`app-banner — ${scheme}`, () => {
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

          if (block.titles.length > 0) {
            expect(block.titles, `${where}: titles`).toEqual(TITLES);
            expect(block.variants, `${where}: banner tints`).toEqual(VARIANTS);
            expect(block.actions, `${where}: actions`).toEqual(ACTIONS);
            expect(block.actionVariants, `${where}: action variants`).toEqual(ACTION_VARIANTS);
            expect(block.dismissible, `${where}: dismissible banners`).toEqual(DISMISSIBLE);

            expect(block.actionsBesideText, `${where}: actions beside the message`).toBe(
              block.containerWidth >= CONTAINER_SM,
            );
            expect(block.descriptionInline, `${where}: title and description on one line`).toEqual(
              TITLES.map(() => block.containerWidth >= CONTAINER_MD),
            );
            expect(block.dismissLabels, `${where}: dismiss labels`).toEqual(
              DISMISSIBLE.map(() => block.containerWidth >= CONTAINER_LG),
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

        const lists = blocks.filter((block) => block.titles.length > 0);
        expect(
          lists.map((block) => block.state),
          `${scheme} ${width}px: copies rendering banners`,
        ).toEqual(["default", "narrow", "compact", "panel", "wide", "disabled"]);

        const empty = blocks.find((block) => block.state === "empty")!;
        expect(empty.height, "the empty render takes no space").toBe(0);
        expect(empty.skeletonBanners + Number(empty.failedLoad), "the empty render").toBe(0);

        expect(
          blocks.filter((block) => block.skeletonBanners === 1).map((block) => block.state),
          "the loading render",
        ).toEqual(["loading"]);
        expect(
          blocks.filter((block) => block.failedLoad).map((block) => block.state),
          "the failed-load render",
        ).toEqual(["error"]);
        expect(
          lists.filter((block) => block.allButtonsInert).map((block) => block.state),
          "the disabled render",
        ).toEqual(["disabled"]);

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

      await showState(page, "default");
      ratios = {
        ...ratios,
        ...(await textRatios(page.locator(`[data-demo-state="default"] ${BLOCK}`), {
          title: '[data-part="title"]',
          description: '[data-part="description"]',
          action: 'ul > li [data-scope="button"]:not([aria-label])',
          dismiss: 'ul > li [data-scope="button"][aria-label]',
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

      for (const title of TITLES) {
        expect(ratios[`title "${title}"`], `${scheme}: ${title} measured`).toBeDefined();
      }
      for (const action of ACTIONS) {
        expect(ratios[`action "${action}"`], `${scheme}: ${action} measured`).toBeDefined();
      }
      for (const [what, ratio] of Object.entries(ratios)) {
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
      }
    });

    test("shows hover and focus-visible on an action button", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const status = defaultButton(page, "View status");

      const background = () => status.evaluate((el) => getComputedStyle(el).backgroundColor);
      const resting = await background();
      await status.hover();
      expect(await background(), `${scheme}: hover background`).not.toBe(resting);

      await page.mouse.move(0, 0);
      await status.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const outline = await status.evaluate((el) => ({
        focused: el.matches(":focus-visible"),
        style: getComputedStyle(el).outlineStyle,
      }));
      expect(outline.focused, `${scheme}: keyboard focus`).toBe(true);
      expect(outline.style, `${scheme}: focus ring`).not.toBe("none");
    });

    test("names each dismiss button after its banner and keeps the Alert roles", async ({
      page,
    }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      for (const title of DISMISSIBLE) {
        await expect(defaultButton(page, `Dismiss — ${title}`)).toBeVisible();
      }
      await expect(
        page.locator(`[data-demo-state="default"] ${BLOCK} [aria-label^="Dismiss"]`),
      ).toHaveCount(DISMISSIBLE.length);

      const roles = await page
        .locator(`[data-demo-state="default"] ${BLOCK} ul > li > [data-scope="alert"]`)
        .evaluateAll((alerts) => alerts.map((alert) => alert.getAttribute("role")));
      expect(roles).toEqual(["alert", "status", "alert"]);
    });

    test("announces the loading banner once, not each skeleton", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const region = page.locator(`[data-demo-state="loading"] ${BLOCK} [role="status"]`);
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region).toContainText("Loading announcements");
      const hidden = await region.evaluate((el) =>
        [...el.querySelectorAll(":scope > div")].every(
          (row) => row.getAttribute("aria-hidden") === "true",
        ),
      );
      expect(hidden).toBe(true);
    });
  });
}
