/**
 * The payment screen, checked where it is shown to a reader: the built docs
 * page, at the three widths of the responsive policy (375 / 768 / 1280) in both
 * colour schemes, and in the three site themes.
 *
 * Four claims:
 *
 * 1. **Container, not viewport.** The masthead lines up at `--container-sm`,
 *    the footer at `--container-md`, and the order summary moves beside the
 *    payment form at `--container-lg`, all read off the frame the screen was
 *    mounted in. The demo's Phone, Tablet and Desktop tabs mount the same file
 *    at three frame widths, so at every viewport the phone and the tablet
 *    copies stack the summary under the form and the desktop copy does not.
 * 2. **A screen owns the viewport as a height.** Its root fills the frame the
 *    demo gives it as a window. That the shipped file says `min-h-dvh` is held
 *    by `tooling/cli/test/install/payment.test.ts`.
 * 3. **One outline, and every state.** The form's heading is the page's `h1`
 *    and nothing after it skips a rank. The card fields, the order and Place
 *    order by default; a submit that stays on the page; the declined card, the
 *    order being placed, the order loading, the order failing with its retry,
 *    and the empty order.
 * 4. **AA contrast** on every text the screen paints — its own chrome, the
 *    form and the summary inside it, and each field's placeholder — in
 *    Moderno, Neutro and Contrast, in light and in dark.
 */
import { expect, test, type Page } from "@playwright/test";

/** The contract's three container steps, in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/payment/";

const ROOT = "div.moderno-screen-payment";
const FORM = ".moderno-block-checkout-form";
const SUMMARY = ".moderno-block-order-summary";

/**
 * Every copy of the screen the page mounts (islands/PaymentScreenDemo.svelte),
 * in order: the main preview's three width tabs, then each state in its own
 * Examples preview at the tablet width.
 */
const TABS = [
  "phone",
  "tablet",
  "desktop",
  "declined",
  "placing",
  "loading",
  "order-error",
  "empty",
] as const;
type Tab = (typeof TABS)[number];

const WIDTH_TABS: readonly Tab[] = ["phone", "tablet", "desktop"];

/** The copies whose text is all live (no inert control) and so must clear AA. */
const CONTRAST_TABS: readonly Tab[] = ["tablet", "declined", "loading", "order-error", "empty"];

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
  /** Column count of the grid holding the form and the summary. */
  bodyColumns: number;
  /** Whether the summary's top edge is below the form's bottom edge. */
  summaryUnderForm: boolean;
  headingLevels: number[];
}

async function screenMetrics(page: Page, tab: Tab): Promise<ScreenMetrics[]> {
  return page.evaluate(
    ({ state, rootSelector, formSelector, summarySelector }) => {
      const panel = document.querySelector(`[data-demo-state="${state}"]`);
      if (!panel) throw new Error(`no ${state} stage on the page`);
      return [...panel.querySelectorAll(rootSelector)].map((root) => {
        const masthead = root.querySelector(":scope > div > header");
        const footer = root.querySelector(":scope > div > footer");
        const form = root.querySelector(formSelector);
        const summary = root.querySelector(summarySelector);
        const body = form?.parentElement?.parentElement;
        if (!masthead || !footer || !form || !summary || !body) {
          throw new Error("the payment screen did not render its own markup");
        }
        return {
          // Layout size, not the painted box: the docs scale the device to fit
          // the column, and that transform never changes what the container reads.
          containerWidth: (root as HTMLElement).offsetWidth,
          rootHeight: (root as HTMLElement).offsetHeight,
          frameHeight: (root.parentElement as HTMLElement).clientHeight,
          mastheadDisplay: getComputedStyle(masthead).display,
          footerDisplay: getComputedStyle(footer).display,
          bodyColumns: getComputedStyle(body).gridTemplateColumns.split(" ").length,
          summaryUnderForm:
            summary.getBoundingClientRect().top >= form.getBoundingClientRect().bottom,
          headingLevels: [...root.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((h) =>
            Number(h.getAttribute("aria-level") ?? h.tagName.slice(1)),
          ),
        };
      });
    },
    { state: tab, rootSelector: ROOT, formSelector: FORM, summarySelector: SUMMARY },
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
 * by a short description of where it is, plus each empty field's placeholder.
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

      function ratio(el: Element, color = getComputedStyle(el).color): number {
        const bg = surfaceOf(el);
        const fg = over(toRgba(color), bg);
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
        // Only what is painted: hidden parts (Ark's hidden fallback, an empty
        // error slot) and screen-reader-only text are not on screen.
        if (el.closest("[hidden], [aria-hidden='true'], .sr-only")) continue;
        const box = el.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) continue;
        if (getComputedStyle(el).visibility === "hidden") continue;
        ratios[`${el.tagName.toLowerCase()} "${content.slice(0, 32)}"`] = ratio(el);
      }
      // A placeholder is painted text too, but not a text node.
      for (const input of root.querySelectorAll("input[placeholder]")) {
        const field = input as HTMLInputElement;
        if (field.value || !field.placeholder) continue;
        const color = getComputedStyle(field, "::placeholder").color;
        ratios[`placeholder "${field.placeholder}"`] = ratio(field, color);
      }
      return ratios;
    },
    { state: tab, rootSelector: ROOT },
  );
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`payment — ${scheme}`, () => {
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
          expect(screen.footerDisplay, `${where}: footer`).toBe(
            screen.containerWidth >= CONTAINER_MD ? "flex" : "grid",
          );
          expect(screen.bodyColumns, `${where}: body columns`).toBe(beside ? 5 : 1);
          expect(screen.summaryUnderForm, `${where}: summary under the form`).toBe(!beside);
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

        // The phone and tablet frames stack the summary; the desktop frame sets it beside the form.
        expect(screens[0]!.summaryUnderForm, `${width}px: phone summary`).toBe(true);
        expect(screens[1]!.summaryUnderForm, `${width}px: tablet summary`).toBe(true);
        expect(screens[2]!.summaryUnderForm, `${width}px: desktop summary`).toBe(false);
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
          form: root.locator(FORM),
          summary: root.locator(SUMMARY),
          lines: root.locator(`${SUMMARY} ul > li`),
          fields: root.locator(`${FORM} input[placeholder]`),
        };
      };

      // Default: the form's heading is the page's h1, the card fields, the
      // order with its total, and the two buttons.
      const initial = await read("tablet");
      await expect(initial.root.getByRole("heading", { level: 1 })).toHaveText("Payment");
      await expect(initial.root.getByRole("heading", { level: 2 })).toHaveText([
        "Card details",
        "Order summary",
      ]);
      for (const label of ["Name on card", "Card number", "Expiry", "CVC"]) {
        await expect(initial.form.getByRole("textbox", { name: label })).toBeEnabled();
      }
      await expect(initial.root.getByRole("switch", { name: /save this card/i })).toBeEnabled();
      await expect(initial.lines).toHaveCount(3);
      await expect(initial.summary).toContainText("€168");
      await expect(initial.root.getByRole("button", { name: "Back to shipping" })).toBeEnabled();
      await expect(initial.root.getByRole("link", { name: "Edit cart" })).toBeVisible();

      // Place order reaches the page, which keeps the reader where they are.
      const url = page.url();
      await initial.root.getByRole("button", { name: "Place order" }).click();
      expect(page.url()).toBe(url);

      // Declined: an alert above the card fields, and the wrong field marked.
      const declined = await read("declined");
      await expect(declined.form.getByRole("alert")).toContainText("Your card was declined.");
      await expect(declined.form.getByRole("textbox", { name: "Card number" })).toHaveAttribute(
        "aria-invalid",
        "true",
      );
      await expect(declined.form).toContainText("Check the card number, or use another card.");
      await expect(declined.root.getByRole("button", { name: "Place order" })).toBeEnabled();
      await expect(declined.lines).toHaveCount(3);

      // Placing the order: the button is busy and every control is inert.
      const placing = await read("placing");
      const busyButton = placing.root.getByRole("button", { name: "Placing order" });
      await expect(busyButton).toBeDisabled();
      await expect(busyButton).toHaveAttribute("aria-busy", "true");
      await expect(placing.root.getByRole("button", { name: "Back to shipping" })).toBeDisabled();
      for (const field of await placing.fields.all()) await expect(field).toBeDisabled();
      for (const name of ["Stoneware mug", "Serving bowl", "Bud vase"]) {
        await expect(placing.summary.getByText(name)).toHaveAttribute("aria-disabled", "true");
      }

      // Loading the order: placeholder lines in one busy region; the form stays usable.
      const loading = await read("loading");
      await expect(loading.summary.locator("[role='status'][aria-busy='true']")).toHaveCount(1);
      await expect(loading.lines).toHaveCount(0);
      await expect(loading.root.getByRole("button", { name: "Place order" })).toBeEnabled();

      // Order error: the message and a retry in place of the summary, which brings the order back.
      const orderError = await read("order-error");
      await expect(orderError.summary.getByRole("alert")).toContainText(
        "We could not load your order.",
      );
      await expect(orderError.form.getByRole("alert")).toHaveCount(0);
      await orderError.root.getByRole("button", { name: "Try again" }).click();
      await expect(orderError.summary.getByRole("alert")).toHaveCount(0);
      await expect(orderError.lines).toHaveCount(3);

      // Empty: the message in place of the lines and the totals.
      const empty = await read("empty");
      await expect(empty.summary).toContainText("Your order is empty.");
      await expect(empty.lines).toHaveCount(0);
      await expect(empty.summary.locator('[data-scope="card"][data-part="root"]')).toHaveCount(0);
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
