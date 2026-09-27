/**
 * The shipping screen, checked where it is shown to a reader: the built docs
 * page, at the three widths of the responsive policy (375 / 768 / 1280) in both
 * colour schemes, and in the three site themes.
 *
 * Three claims:
 *
 * 1. **Container, not viewport.** The screen's steps are read off the width of
 *    the frame it was mounted in, never the window: the masthead lines up at
 *    `--container-sm`; the footer at `--container-md`; the order summary moves
 *    beside the form at `--container-lg`. The demo's Phone, Tablet and Desktop
 *    tabs mount the same file at three frame widths, so at every viewport the
 *    phone copy stacks its masthead, the tablet copy stacks the summary under
 *    the form and the desktop copy stacks neither.
 * 2. **A screen owns the viewport as a height.** Its root fills the frame it is
 *    given, which the demo treats as its window. That the shipped file says
 *    `min-h-dvh` is held by `tooling/cli/test/install/shipping.test.ts`.
 * 3. **AA contrast** on every text the screen paints — its own chrome, the
 *    checkout form's labels, delivery options, errors and alert, and the order
 *    summary's lines and totals — in Moderno, Neutro and Contrast, in light and
 *    in dark.
 *
 * Each state the page shows is held too: the invalid fields, the failed save,
 * the save in flight, the order loading, the order failing and the empty order.
 */
import { expect, test, type Page } from "@playwright/test";

/** The contract's three container steps the screen reads, in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/shipping/";

const ROOT = "div.moderno-screen-shipping";

/**
 * Every copy of the screen the page mounts (islands/ShippingScreenDemo.svelte),
 * in order: the main preview's three width tabs, then each state in its own
 * Examples preview at the tablet width.
 */
const TABS = [
  "phone",
  "tablet",
  "desktop",
  "invalid",
  "save-error",
  "saving",
  "loading",
  "order-error",
  "empty",
] as const;
type Tab = (typeof TABS)[number];

const WIDTH_TABS: readonly Tab[] = ["phone", "tablet", "desktop"];

/** The copies whose text is all live (no inert control) and so must clear AA. */
const CONTRAST_TABS: readonly Tab[] = [
  "tablet",
  "invalid",
  "save-error",
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

/** The fields of the shipping step, by the `name` each posts under. */
const FIELDS = ["email", "fullName", "address", "city", "region", "postalCode", "country"];

interface ScreenMetrics {
  containerWidth: number;
  rootHeight: number;
  frameHeight: number;
  mastheadDisplay: string;
  footerDisplay: string;
  summaryBesideForm: boolean;
  headingLevels: number[];
}

async function screenMetrics(page: Page, tab: Tab): Promise<ScreenMetrics[]> {
  return page.evaluate(
    ({ state, rootSelector }) => {
      const panel = document.querySelector(`[data-demo-state="${state}"]`);
      if (!panel) throw new Error(`no ${state} stage on the page`);
      return [...panel.querySelectorAll(rootSelector)].map((root) => {
        const masthead = root.querySelector(":scope > div > header");
        const form = root.querySelector(".moderno-block-checkout-form");
        const summary = root.querySelector(".moderno-block-order-summary");
        const footer = root.querySelector(":scope > div > footer");
        if (!masthead || !form || !summary || !footer) {
          throw new Error("the shipping screen did not render its own markup");
        }
        // Widths are layout sizes, not painted boxes: the docs scale the device to
        // fit the column, and that transform never changes what the container reads.
        const formBox = form.getBoundingClientRect();
        const summaryBox = summary.getBoundingClientRect();
        return {
          containerWidth: (root as HTMLElement).offsetWidth,
          rootHeight: (root as HTMLElement).offsetHeight,
          frameHeight: (root.parentElement as HTMLElement).clientHeight,
          mastheadDisplay: getComputedStyle(masthead).display,
          footerDisplay: getComputedStyle(footer).display,
          summaryBesideForm:
            Math.abs(summaryBox.top - formBox.top) < 1 && summaryBox.left >= formBox.right,
          headingLevels: [...root.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((h) =>
            Number(h.getAttribute("aria-level") ?? h.tagName.slice(1)),
          ),
        };
      });
    },
    { state: tab, rootSelector: ROOT },
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
 * by a short description of where it is.
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
        // Only what is painted: hidden parts (Ark's hidden fallback, an empty
        // error slot) and screen-reader-only text are not on screen.
        if (el.closest("[hidden], [aria-hidden='true'], .sr-only")) continue;
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
  test.describe(`shipping — ${scheme}`, () => {
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
          expect(screen.mastheadDisplay, `${where}: masthead`).toBe(
            screen.containerWidth >= CONTAINER_SM ? "flex" : "grid",
          );
          expect(screen.footerDisplay, `${where}: footer`).toBe(
            screen.containerWidth >= CONTAINER_MD ? "flex" : "grid",
          );
          expect(screen.summaryBesideForm, `${where}: summary beside the form`).toBe(
            screen.containerWidth >= CONTAINER_LG,
          );
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
      });
    }

    test("renders each state it is handed", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await hydrated(page);

      const read = async (tab: Tab) => {
        await showTab(page, tab);
        const root = page.locator(`[data-demo-state="${tab}"] ${ROOT}`);
        const summary = root.locator(".moderno-block-order-summary");
        return {
          root,
          summary,
          field: (name: string) => root.locator(`input[name='${name}']`),
          submit: root.locator("button[type='submit']"),
          back: root.getByRole("button", { name: "Back to cart" }),
          lines: summary.locator("ul > li"),
          alerts: root.getByRole("alert"),
        };
      };

      // Default: the shipping step titled as the route, every field required,
      // the delivery methods priced like the order, and the order beside it.
      const initial = await read("tablet");
      await expect(initial.root.getByRole("heading", { level: 1 })).toHaveText("Shipping details");
      for (const name of FIELDS) {
        await expect(initial.field(name), name).toHaveAttribute("required", "");
        await expect(initial.field(name), name).toBeEnabled();
      }
      await expect(initial.field("email")).toHaveAttribute("type", "email");
      await expect(initial.root.getByRole("radio")).toHaveCount(2);
      await expect(initial.root.getByRole("radio").first()).toBeChecked();
      await expect(initial.root.getByRole("radiogroup")).toContainText("€6");
      await expect(initial.submit).toHaveText("Continue to payment");
      await expect(initial.submit).toBeEnabled();
      await expect(initial.back).toBeEnabled();
      await expect(initial.summary.getByRole("heading", { level: 2 })).toHaveText("Order summary");
      await expect(initial.lines).toHaveCount(3);
      await expect(initial.summary).toContainText("€168");
      await expect(initial.alerts).toHaveCount(0);
      await expect(initial.root.getByRole("link", { name: "Need help?" })).toBeVisible();

      // Invalid fields: each says what is wrong; the form stays usable.
      const invalid = await read("invalid");
      await expect(invalid.field("email")).toHaveAttribute("aria-invalid", "true");
      await expect(invalid.field("postalCode")).toHaveAttribute("aria-invalid", "true");
      await expect(invalid.field("city")).not.toHaveAttribute("aria-invalid", "true");
      await expect(invalid.root).toContainText("Enter an email address");
      await expect(invalid.submit).toBeEnabled();

      // A failed save: one alert over the fields, which stay usable.
      const saveError = await read("save-error");
      await expect(saveError.alerts).toHaveCount(1);
      await expect(saveError.alerts).toContainText("We could not save your address.");
      await expect(saveError.field("email")).toBeEnabled();

      // Saving: the form inert and its button busy; the order is still shown.
      const saving = await read("saving");
      await expect(saving.submit).toHaveAttribute("aria-busy", "true");
      await expect(saving.submit).toBeDisabled();
      await expect(saving.submit).toContainText("Saving");
      await expect(saving.field("email")).toBeDisabled();
      await expect(saving.lines).toHaveCount(3);

      // The order loading: a busy region instead of lines; the form stays usable.
      const loading = await read("loading");
      await expect(loading.summary.locator("[role='status'][aria-busy='true']")).toHaveCount(1);
      await expect(loading.lines).toHaveCount(0);
      await expect(loading.field("email")).toBeEnabled();

      // The order failing: an alert with a retry instead of lines.
      const orderError = await read("order-error");
      await expect(orderError.alerts).toHaveCount(1);
      await expect(orderError.alerts).toContainText("We could not load your order.");
      await expect(orderError.alerts.getByRole("button", { name: "Try again" })).toBeEnabled();
      await expect(orderError.lines).toHaveCount(0);
      await expect(orderError.submit).toBeEnabled();

      // Empty: no lines, the summary's empty message in their place.
      const empty = await read("empty");
      await expect(empty.lines).toHaveCount(0);
      await expect(empty.summary).toContainText("Your order is empty.");
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
