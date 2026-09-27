/**
 * The review screen, checked where it is shown to a reader: the built docs
 * page, at the three widths of the responsive policy (375 / 768 / 1280) in both
 * colour schemes, and in the three site themes.
 *
 * Four claims:
 *
 * 1. **Container, not viewport.** The masthead and the two buttons line up at
 *    `--container-sm`, the footer at `--container-md`, and the order summary
 *    moves beside the details at `--container-lg`, all read off the frame the
 *    screen was mounted in. The demo's Phone, Tablet and Desktop tabs mount
 *    the same file at three frame widths, so at every viewport the phone and
 *    the tablet copies stack the summary under the details and the desktop
 *    copy does not.
 * 2. **A screen owns the viewport as a height.** Its root fills the frame the
 *    demo gives it as a window. That the shipped file says `min-h-dvh` is held
 *    by `tooling/cli/test/install/review.test.ts`.
 * 3. **One outline, and every state.** The screen prints the page's one `h1`
 *    and nothing after it skips a rank. The details, the order and Place order
 *    by default; the order failing to be placed, the order being placed, the
 *    order loading, the order failing to load with its retry, and the empty
 *    order — Place order only live when there is an order to place.
 * 4. **AA contrast** on every text the screen paints — its own chrome, the
 *    details and the summary — in Moderno, Neutro and Contrast, in light and
 *    in dark. A disabled control is inactive and is not held to it (WCAG
 *    1.4.3).
 */
import { expect, test, type Page } from "@playwright/test";

/** The contract's three container steps, in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/review/";

const ROOT = "div.moderno-screen-review";
const DETAILS = ".moderno-block-description-list";
const SUMMARY = ".moderno-block-order-summary";

/**
 * Every copy of the screen the page mounts (islands/ReviewScreenDemo.svelte),
 * in order: the main preview's three width tabs, then each state in its own
 * Examples preview at the tablet width.
 */
const TABS = [
  "phone",
  "tablet",
  "desktop",
  "failed",
  "placing",
  "loading",
  "order-error",
  "empty",
] as const;
type Tab = (typeof TABS)[number];

const WIDTH_TABS: readonly Tab[] = ["phone", "tablet", "desktop"];

/** The copies whose live text must clear AA. */
const CONTRAST_TABS: readonly Tab[] = [
  "tablet",
  "failed",
  "placing",
  "loading",
  "order-error",
  "empty",
];

/** The site themes the header offers, as the `data-brand` each sets on <html>. */
const THEMES = [
  { name: "Moderno", brand: "moderno" },
  { name: "Neutro", brand: null },
  { name: "Contrast", brand: "contrast" },
] as const;

interface ScreenMetrics {
  containerWidth: number;
  rootHeight: number;
  frameHeight: number;
  mastheadDisplay: string;
  footerDisplay: string;
  actionsDirection: string;
  /** Column count of the grid holding the details, the summary and the buttons. */
  bodyColumns: number;
  /** Whether the summary's top edge is below the details' bottom edge. */
  summaryUnderDetails: boolean;
  headingLevels: number[];
}

async function screenMetrics(page: Page, tab: Tab): Promise<ScreenMetrics[]> {
  return page.evaluate(
    ({ state, rootSelector, detailsSelector, summarySelector }) => {
      const panel = document.querySelector(`[data-demo-state="${state}"]`);
      if (!panel) throw new Error(`no ${state} stage on the page`);
      return [...panel.querySelectorAll(rootSelector)].map((root) => {
        const masthead = root.querySelector(":scope > div > header");
        const footer = root.querySelector(":scope > div > footer");
        const details = root.querySelector(detailsSelector);
        const summary = root.querySelector(summarySelector);
        const body = details?.parentElement?.parentElement;
        const actions = body?.lastElementChild;
        if (!masthead || !footer || !details || !summary || !body || !actions) {
          throw new Error("the review screen did not render its own markup");
        }
        return {
          // Layout size, not the painted box: the docs scale the device to fit
          // the column, and that transform never changes what the container reads.
          containerWidth: (root as HTMLElement).offsetWidth,
          rootHeight: (root as HTMLElement).offsetHeight,
          frameHeight: (root.parentElement as HTMLElement).clientHeight,
          mastheadDisplay: getComputedStyle(masthead).display,
          footerDisplay: getComputedStyle(footer).display,
          actionsDirection: getComputedStyle(actions).flexDirection,
          bodyColumns: getComputedStyle(body).gridTemplateColumns.split(" ").length,
          summaryUnderDetails:
            summary.getBoundingClientRect().top >= details.getBoundingClientRect().bottom,
          headingLevels: [...root.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((h) =>
            Number(h.getAttribute("aria-level") ?? h.tagName.slice(1)),
          ),
        };
      });
    },
    { state: tab, rootSelector: ROOT, detailsSelector: DETAILS, summarySelector: SUMMARY },
  );
}

/** Scrolls the preview into view and waits for it to hydrate (it mounts `client:visible`). */
async function hydrated(page: Page): Promise<void> {
  await page.locator(".preview-panel--demo").first().scrollIntoViewIfNeeded();
  await page
    .locator(".preview-panel--demo astro-island:not([ssr])")
    .first()
    .waitFor({ state: "attached" });
}

/** Brings up one entry of `TABS` — a width tab or a state's preview — and waits for its copy. */
async function showTab(page: Page, tab: Tab): Promise<void> {
  if (WIDTH_TABS.includes(tab)) {
    await page.locator(`[data-demo-tab="${tab}"]`).click();
  } else {
    await page.locator(`[data-demo-state="${tab}"]`).scrollIntoViewIfNeeded();
    await page
      .locator(`astro-island:not([ssr]):has([data-demo-state="${tab}"])`)
      .waitFor({ state: "attached" });
  }
  await page.locator(`[data-demo-state="${tab}"] ${ROOT}`).waitFor({ state: "attached" });
}

/**
 * The contrast of every piece of live text inside `tab`'s copy of the screen,
 * keyed by a short description of where it is.
 *
 * Colours are resolved through a canvas rather than parsed: the contract's
 * values are OKLCH and the browser is the only thing that converts them exactly
 * the way it painted them. Translucent backgrounds are composited down to the
 * first opaque one, and a translucent text colour onto that.
 */
async function contrastRatios(page: Page, tab: Tab): Promise<Record<string, number>> {
  return page.evaluate(
    ({ state, rootSelector }) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("no 2d context");

      type Rgba = [number, number, number, number];

      function toRgba(color: string): Rgba {
        ctx!.clearRect(0, 0, 1, 1);
        ctx!.fillStyle = color;
        ctx!.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx!.getImageData(0, 0, 1, 1).data;
        return [r!, g!, b!, a! / 255];
      }

      function over([r, g, b, a]: Rgba, [br, bg, bb]: Rgba): Rgba {
        return [r * a + br * (1 - a), g * a + bg * (1 - a), b * a + bb * (1 - a), 1];
      }

      function luminance([r, g, b]: Rgba): number {
        const channel = (v: number) => {
          const c = v / 255;
          return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
      }

      /** The background behind `el`, every translucent layer composited. */
      function surfaceOf(el: Element): Rgba {
        const layers: Rgba[] = [];
        let node: Element | null = el;
        while (node) {
          const layer = toRgba(getComputedStyle(node).backgroundColor);
          if (layer[3] > 0) layers.push(layer);
          if (layer[3] >= 1) break;
          node = node.parentElement;
        }
        let surface: Rgba = node
          ? layers.pop()!
          : toRgba(getComputedStyle(document.body).backgroundColor);
        for (const layer of layers.reverse()) surface = over(layer, surface);
        return surface;
      }

      function ratio(el: Element): number {
        const bg = surfaceOf(el);
        const fg = over(toRgba(getComputedStyle(el).color), bg);
        const a = luminance(fg);
        const b = luminance(bg);
        const [hi, lo] = a > b ? [a, b] : [b, a];
        return (hi + 0.05) / (lo + 0.05);
      }

      const root = document.querySelector(`[data-demo-state="${state}"] ${rootSelector}`);
      if (!root) throw new Error(`the ${state} copy of the screen did not render`);

      const ratios: Record<string, number> = {};
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let text = walker.nextNode(); text; text = walker.nextNode()) {
        const content = text.textContent?.trim();
        const el = text.parentElement;
        if (!content || !el) continue;
        // Only what is painted: hidden parts and screen-reader-only text are not on screen.
        if (el.closest("[hidden], [aria-hidden='true'], .sr-only")) continue;
        // An inactive control is exempt from the contrast minimum.
        if (el.closest(":disabled, [aria-disabled='true']")) continue;
        const box = el.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) continue;
        if (getComputedStyle(el).visibility === "hidden") continue;
        ratios[`${el.tagName.toLowerCase()} "${content.slice(0, 32)}"`] = ratio(el);
      }
      return ratios;
    },
    { state: tab, rootSelector: ROOT },
  );
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`review — ${scheme}`, () => {
    test.use({ colorScheme: scheme });

    for (const width of WIDTHS) {
      test(`lays itself out from its container at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1200 });
        await page.goto(PAGE, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready.then(() => true));
        await hydrated(page);

        expect(await page.evaluate(() => document.documentElement.classList.contains("dark"))).toBe(
          scheme === "dark",
        );

        const screens: ScreenMetrics[] = [];
        for (const tab of TABS) {
          await showTab(page, tab);
          const mounted = await screenMetrics(page, tab);
          expect(mounted, `${scheme} ${width}px, ${tab}: mounted copies`).toHaveLength(1);
          screens.push(mounted[0]!);
        }

        const widths = screens.map((s) => s.containerWidth);
        expect(
          widths.some((w) => w < CONTAINER_SM),
          `${scheme} ${width}px: a copy below @sm`,
        ).toBe(true);
        expect(
          widths.some((w) => w >= CONTAINER_MD && w < CONTAINER_LG),
          `${scheme} ${width}px: a copy between @md and @lg`,
        ).toBe(true);
        expect(
          widths.some((w) => w >= CONTAINER_LG),
          `${scheme} ${width}px: a copy at or above @lg`,
        ).toBe(true);

        for (const [index, screen] of screens.entries()) {
          const where = `${scheme} ${width}px, ${TABS[index]} (${screen.containerWidth}px)`;
          const beside = screen.containerWidth >= CONTAINER_LG;
          expect(screen.mastheadDisplay, `${where}: masthead`).toBe(
            screen.containerWidth >= CONTAINER_SM ? "flex" : "grid",
          );
          expect(screen.actionsDirection, `${where}: buttons`).toBe(
            screen.containerWidth >= CONTAINER_SM ? "row" : "column-reverse",
          );
          expect(screen.footerDisplay, `${where}: footer`).toBe(
            screen.containerWidth >= CONTAINER_MD ? "flex" : "grid",
          );
          expect(screen.bodyColumns, `${where}: body columns`).toBe(beside ? 5 : 1);
          expect(screen.summaryUnderDetails, `${where}: summary under the details`).toBe(!beside);
          expect(screen.rootHeight, `${where}: root height`).toBeGreaterThanOrEqual(
            screen.frameHeight,
          );

          // One h1 for the route, then headings that descend one rank at a time.
          expect(screen.headingLevels[0], `${where}: first heading`).toBe(1);
          expect(
            screen.headingLevels.filter((l) => l === 1),
            `${where}: one h1`,
          ).toHaveLength(1);
          for (const [i, level] of screen.headingLevels.entries()) {
            if (i === 0) continue;
            expect(
              level,
              `${where}: heading ${i + 1} of ${screen.headingLevels.join("/")}`,
            ).toBeLessThanOrEqual(screen.headingLevels[i - 1]! + 1);
          }
        }

        // The phone and tablet frames stack the summary; the desktop frame sets it beside the details.
        expect(screens[0]!.summaryUnderDetails, `${width}px: phone summary`).toBe(true);
        expect(screens[1]!.summaryUnderDetails, `${width}px: tablet summary`).toBe(true);
        expect(screens[2]!.summaryUnderDetails, `${width}px: desktop summary`).toBe(false);
      });
    }

    test("renders each state it is handed and reports what the shopper does", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await hydrated(page);

      const read = async (tab: Tab) => {
        await showTab(page, tab);
        const root = page.locator(`[data-demo-state="${tab}"] ${ROOT}`);
        return {
          root,
          details: root.locator(DETAILS),
          summary: root.locator(SUMMARY),
          rows: root.locator(`${DETAILS} dl > div`),
          lines: root.locator(`${SUMMARY} ul > li`),
          place: root.getByRole("button", { name: /^Plac(e|ing) order$/ }),
          back: root.getByRole("button", { name: "Back to payment" }),
          change: root.locator(DETAILS).getByRole("button", { name: /^Change / }),
        };
      };

      // Default: the page's h1, the four details each with Change, the order
      // with its total, and the two buttons.
      const initial = await read("tablet");
      await expect(initial.root.getByRole("heading", { level: 1 })).toHaveText(
        "Review your order",
      );
      await expect(initial.root.getByRole("heading", { level: 2 })).toHaveText([
        "Delivery and payment",
        "Order summary",
      ]);
      await expect(initial.rows).toHaveCount(4);
      await expect(initial.details).toContainText("Visa ending in 4242");
      await expect(initial.change).toHaveCount(4);
      for (const button of await initial.change.all()) await expect(button).toBeEnabled();
      await expect(initial.lines).toHaveCount(3);
      await expect(initial.summary).toContainText("€168");
      await expect(initial.back).toBeEnabled();
      await expect(initial.root.getByRole("link", { name: "Edit cart" })).toBeVisible();
      await expect(initial.root.getByRole("alert")).toHaveCount(0);

      // Place order reports the press and leaves the reader where they are.
      const url = page.url();
      await expect(initial.place).toHaveText("Place order");
      await initial.place.click();
      expect(page.url()).toBe(url);

      // Placing the order failed: an alert under the heading; everything stays usable.
      const failed = await read("failed");
      await expect(failed.root.getByRole("alert")).toContainText("We could not place your order.");
      await expect(failed.root.getByRole("alert")).toContainText("You have not been charged.");
      await expect(failed.place).toBeEnabled();
      await expect(failed.back).toBeEnabled();
      await expect(failed.lines).toHaveCount(3);

      // Placing the order: the button is busy and every control is inert.
      const placing = await read("placing");
      await expect(placing.place).toHaveText("Placing order");
      await expect(placing.place).toBeDisabled();
      await expect(placing.place).toHaveAttribute("aria-busy", "true");
      await expect(placing.back).toBeDisabled();
      for (const button of await placing.change.all()) await expect(button).toBeDisabled();
      for (const name of ["Stoneware mug", "Serving bowl", "Bud vase"]) {
        await expect(placing.summary.getByText(name)).toHaveAttribute("aria-disabled", "true");
      }

      // Loading the order: placeholder lines in the details and the summary; nothing to place yet.
      const loading = await read("loading");
      await expect(loading.details.locator("[role='status'][aria-busy='true']")).toHaveCount(1);
      await expect(loading.summary.locator("[role='status'][aria-busy='true']")).toHaveCount(1);
      await expect(loading.rows).toHaveCount(0);
      await expect(loading.lines).toHaveCount(0);
      await expect(loading.place).toBeDisabled();
      await expect(loading.back).toBeEnabled();

      // Order error: the message and a retry in place of the summary, which brings the order back.
      const orderError = await read("order-error");
      await expect(orderError.summary.getByRole("alert")).toContainText(
        "We could not load your order.",
      );
      await expect(orderError.details.getByRole("alert")).toHaveCount(0);
      await expect(orderError.place).toBeDisabled();
      await orderError.root.getByRole("button", { name: "Try again" }).click();
      await expect(orderError.summary.getByRole("alert")).toHaveCount(0);
      await expect(orderError.lines).toHaveCount(3);
      await expect(orderError.place).toBeEnabled();

      // Empty: the message in place of the lines and the totals; nothing to place.
      const empty = await read("empty");
      await expect(empty.summary).toContainText("Your order is empty.");
      await expect(empty.lines).toHaveCount(0);
      await expect(empty.summary.locator('[data-scope="card"][data-part="root"]')).toHaveCount(0);
      await expect(empty.place).toBeDisabled();
    });

    for (const theme of THEMES) {
      test(`clears AA contrast on every text it paints in ${theme.name}`, async ({ page }) => {
        await page.goto(PAGE, { waitUntil: "networkidle" });
        await page.evaluate((brand) => {
          const root = document.documentElement;
          if (brand) root.dataset.brand = brand;
          else delete root.dataset.brand;
        }, theme.brand);
        await hydrated(page);

        for (const tab of CONTRAST_TABS) {
          await showTab(page, tab);
          const ratios = await contrastRatios(page, tab);
          expect(Object.keys(ratios).length, `${tab}: texts found`).toBeGreaterThan(10);
          for (const [what, ratio] of Object.entries(ratios)) {
            expect(
              ratio,
              `${theme.name} ${scheme}, ${tab}: ${what} contrast`,
            ).toBeGreaterThanOrEqual(4.5);
          }
        }
      });
    }
  });
}
