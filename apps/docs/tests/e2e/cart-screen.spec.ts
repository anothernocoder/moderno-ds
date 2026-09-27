/**
 * The cart screen, checked where it is shown to a reader: the built docs page,
 * at the three widths of the responsive policy (375 / 768 / 1280) in both
 * colour schemes, and in the three site themes.
 *
 * Four claims:
 *
 * 1. **Container, not viewport.** The masthead lines up at `--container-sm` and
 *    the footer at `--container-md`, read off the frame the screen was mounted
 *    in. The shopping-cart block inside reads its own container: the order
 *    summary stacks under the lines until the block crosses `--container-lg`,
 *    then sits beside them. The demo's Phone, Tablet and Desktop tabs mount the
 *    same file at three frame widths, so at every viewport the phone and the
 *    tablet copies stack the summary and the desktop copy does not.
 * 2. **A screen owns the viewport as a height.** Its root fills the frame the
 *    demo gives it as a window. That the shipped file says `min-h-dvh` is held
 *    by `tooling/cli/test/install/cart.test.ts`.
 * 3. **One outline, and every state.** The cart's heading is the page's `h1`
 *    and nothing after it skips a rank. The lines, the summary and Checkout by
 *    default; a quantity change and Remove reach the page that mounts it; the
 *    loading lines, the error with its retry and the empty message.
 * 4. **AA contrast** on every text the screen paints — its own chrome and the
 *    cart inside it — in Moderno, Neutro and Contrast, in light and in dark.
 */
import { expect, test, type Page } from "@playwright/test";

/** The contract's three container steps, in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/cart/";

const ROOT = "div.moderno-screen-cart";
const BLOCK = ".moderno-block-shopping-cart";

/**
 * Every copy of the screen the page mounts (islands/CartScreenDemo.svelte), in
 * order: the main preview's three width tabs, then each state in its own
 * Examples preview at the tablet width.
 */
const TABS = ["phone", "tablet", "desktop", "loading", "error", "empty"] as const;
type Tab = (typeof TABS)[number];

const WIDTH_TABS: readonly Tab[] = ["phone", "tablet", "desktop"];

/** The copies whose text is all live (no inert control) and so must clear AA. */
const CONTRAST_TABS: readonly Tab[] = ["phone", "desktop", "loading", "error", "empty"];

/** The site themes the header offers, as the `data-brand` each sets on <html>. */
const THEMES = [
  { name: "Moderno", brand: "moderno" },
  { name: "Neutro", brand: null },
  { name: "Contrast", brand: "contrast" },
] as const;

interface ScreenMetrics {
  containerWidth: number;
  blockWidth: number;
  rootHeight: number;
  frameHeight: number;
  mastheadDisplay: string;
  footerDisplay: string;
  /** Column count of the grid holding the lines and the summary; null when the cart is not drawn. */
  cartColumns: number | null;
  /** Whether the summary's top edge is below the lines' bottom edge. */
  summaryUnderLines: boolean | null;
  headingLevels: number[];
}

async function screenMetrics(page: Page, tab: Tab): Promise<ScreenMetrics[]> {
  return page.evaluate(
    ({ state, rootSelector, blockSelector }) => {
      const panel = document.querySelector(`[data-demo-state="${state}"]`);
      if (!panel) throw new Error(`no ${state} stage on the page`);
      return [...panel.querySelectorAll(rootSelector)].map((root) => {
        const masthead = root.querySelector(":scope > div > header");
        const footer = root.querySelector(":scope > div > footer");
        const block = root.querySelector(blockSelector);
        if (!masthead || !footer || !block) {
          throw new Error("the cart screen did not render its own markup");
        }
        const lines = block.querySelector("ul");
        const summary = block.querySelector('[data-scope="card"][data-part="root"]');
        const cart = lines?.parentElement ?? null;
        return {
          // Layout size, not the painted box: the docs scale the device to fit
          // the column, and that transform never changes what the container reads.
          containerWidth: (root as HTMLElement).offsetWidth,
          blockWidth: (block as HTMLElement).offsetWidth,
          rootHeight: (root as HTMLElement).offsetHeight,
          frameHeight: (root.parentElement as HTMLElement).clientHeight,
          mastheadDisplay: getComputedStyle(masthead).display,
          footerDisplay: getComputedStyle(footer).display,
          cartColumns: cart ? getComputedStyle(cart).gridTemplateColumns.split(" ").length : null,
          summaryUnderLines:
            lines && summary
              ? summary.getBoundingClientRect().top >= lines.getBoundingClientRect().bottom
              : null,
          headingLevels: [...root.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((h) =>
            Number(h.getAttribute("aria-level") ?? h.tagName.slice(1)),
          ),
        };
      });
    },
    { state: tab, rootSelector: ROOT, blockSelector: BLOCK },
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
 * The contrast of every piece of text inside `tab`'s copy of the screen, keyed
 * by a short description of where it is, plus each quantity box's value.
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
        const box = el.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) continue;
        if (getComputedStyle(el).visibility === "hidden") continue;
        ratios[`${el.tagName.toLowerCase()} "${content.slice(0, 32)}"`] = ratio(el);
      }
      // A quantity is an input's value, not a text node.
      for (const [i, input] of [...root.querySelectorAll("input")].entries()) {
        if (input.value) ratios[`quantity ${i + 1} "${input.value}"`] = ratio(input);
      }
      return ratios;
    },
    { state: tab, rootSelector: ROOT },
  );
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`cart — ${scheme}`, () => {
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
          widths.some((w) => w >= CONTAINER_MD),
          `${scheme} ${width}px: a copy at or above @md`,
        ).toBe(true);

        for (const [index, screen] of screens.entries()) {
          const tab = TABS[index]!;
          const where = `${scheme} ${width}px, ${tab} (${screen.containerWidth}px)`;
          expect(screen.mastheadDisplay, `${where}: masthead`).toBe(
            screen.containerWidth >= CONTAINER_SM ? "flex" : "grid",
          );
          expect(screen.footerDisplay, `${where}: footer`).toBe(
            screen.containerWidth >= CONTAINER_MD ? "flex" : "grid",
          );
          expect(screen.rootHeight, `${where}: root height`).toBeGreaterThanOrEqual(
            screen.frameHeight,
          );

          // The lines and the summary are only drawn by the width tabs; the
          // block reads its own container, the screen's width less its padding.
          if (WIDTH_TABS.includes(tab)) {
            const beside = screen.blockWidth >= CONTAINER_LG;
            expect(screen.cartColumns, `${where}: cart columns`).toBe(beside ? 3 : 1);
            expect(screen.summaryUnderLines, `${where}: summary under the lines`).toBe(!beside);
          } else {
            expect(screen.cartColumns, `${where}: no cart drawn`).toBeNull();
          }

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

        // The phone and tablet frames stack the summary; the desktop frame sets it beside the lines.
        expect(screens[0]!.summaryUnderLines, `${width}px: phone summary`).toBe(true);
        expect(screens[1]!.summaryUnderLines, `${width}px: tablet summary`).toBe(true);
        expect(screens[2]!.summaryUnderLines, `${width}px: desktop summary`).toBe(false);
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
          lines: root.locator(`${BLOCK} ul > li`),
          summary: root.locator(`${BLOCK} [data-scope="card"][data-part="root"]`),
          busy: root.locator("[role='status'][aria-busy='true']"),
          alerts: root.getByRole("alert"),
        };
      };

      // Default: the heading is the page's h1, three lines, the summary and
      // Checkout. The ranks are `aria-level` on the block's own h2 and h3s
      // (Playwright's role query reads the tag's native level instead).
      const initial = await read("tablet");
      await expect(initial.root.locator('[aria-level="1"]')).toHaveText("Your cart");
      await expect(initial.root.locator('[aria-level="2"]')).toHaveText([
        "Stoneware mug",
        "Serving bowl",
        "Bud vase",
        "Order summary",
      ]);
      await expect(initial.lines).toHaveCount(3);
      await expect(initial.summary).toContainText("€134");
      await expect(initial.root.getByRole("button", { name: "Checkout" })).toBeEnabled();
      await expect(initial.root.getByRole("link", { name: "Continue shopping" })).toBeVisible();

      // The quantity and Remove reach the page, which passes the new cart back in.
      await initial.lines
        .first()
        .getByRole("button", { name: /increment/i })
        .click();
      await expect(initial.lines.first()).toContainText("€84");
      await expect(initial.summary).toContainText("€162");
      await initial.root.getByRole("button", { name: "Remove Bud vase" }).click();
      await expect(initial.lines).toHaveCount(2);
      await expect(initial.summary).toContainText("€130");

      // Loading: the heading and placeholder lines in one busy region.
      const loading = await read("loading");
      await expect(loading.root.locator('[aria-level="1"]')).toHaveText("Your cart");
      await expect(loading.busy).toHaveCount(1);
      await expect(loading.lines).toHaveCount(0);

      // Error: the message and a retry, which brings the cart back.
      const error = await read("error");
      await expect(error.alerts).toHaveCount(1);
      await expect(error.alerts).toContainText("We could not load your cart.");
      await error.root.getByRole("button", { name: "Try again" }).click();
      await expect(error.alerts).toHaveCount(0);
      await expect(error.lines).toHaveCount(3);

      // Empty: the message in place of the lines and the summary.
      const empty = await read("empty");
      await expect(empty.root).toContainText("Your cart is empty.");
      await expect(empty.lines).toHaveCount(0);
      await expect(empty.summary).toHaveCount(0);
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
          expect(Object.keys(ratios).length, `${tab}: texts found`).toBeGreaterThanOrEqual(6);
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
