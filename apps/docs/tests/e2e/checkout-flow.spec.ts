/**
 * The checkout flow, checked on the built docs page: walked end to end with
 * the buttons and links a reader can see, stepped back through, and measured
 * at the three widths of the responsive policy (375 / 768 / 1280) in both
 * colour schemes and the three site themes.
 *
 * 1. **The journey.** cart → shipping → payment → review → confirmation →
 *    back to an empty cart. The page prints the assembly's callbacks, so the
 *    walk also witnesses `onstepchange`, `onorderplaced` and
 *    `oncontinueshopping`, and the totals prove the assembly prices the order
 *    from the lines it holds.
 * 2. **Steps back.** The Back buttons and "Edit cart", a real `href` the
 *    assembly takes over without the document navigating.
 * 3. **Container, not viewport.** Each tab mounts the flow in a phone-, a
 *    tablet- and a desktop-width frame, and the screen on the route steps its
 *    masthead and footer off that frame (ADR-0005).
 * 4. **AA contrast** on every text the screen under the flow paints.
 */
import { expect, test, type Locator, type Page } from "@playwright/test";

/** The two container steps the screens' mastheads and footers read, in px. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/checkout/";

/** The demo's tabs, in order; only the active tab's copy of the flow is mounted. */
const TABS = ["phone", "tablet", "desktop"] as const;
type Tab = (typeof TABS)[number];

/** The site themes the header offers, as the `data-brand` each sets on <html>. */
const THEMES = [
  { name: "Moderno", brand: "moderno" },
  { name: "Neutro", brand: null },
  { name: "Contrast", brand: "contrast" },
] as const;

const SHIPPING = {
  email: "ada@example.com",
  fullName: "Ada Lovelace",
  address: "12 St James's Square",
  city: "London",
  region: "Greater London",
  postalCode: "SW1Y 4JH",
  country: "United Kingdom",
};

const CARD = {
  cardName: "Ada Lovelace",
  cardNumber: "4242 4242 4242 4242",
  expiry: "12 / 30",
  cvc: "123",
};

/** The walkable copy — the Desktop tab's. */
function flow(page: Page): Locator {
  return page.locator('.preview-panel--demo [data-demo-state="desktop"] .moderno-flow-checkout');
}

/** Scrolls the main preview into view and waits for it to hydrate. */
async function hydrated(page: Page): Promise<void> {
  await page.locator(".preview-panel--demo").first().scrollIntoViewIfNeeded();
  await page
    .locator(".preview-panel--demo astro-island:not([ssr])")
    .first()
    .waitFor({ state: "attached" });
}

/** Selects a tab of the main demo and waits for its copy of the flow to mount. */
async function showTab(page: Page, tab: Tab): Promise<void> {
  await page.locator(`[data-demo-tab="${tab}"]`).click();
  await page
    .locator(`[data-demo-state="${tab}"] div.moderno-flow-checkout`)
    .waitFor({ state: "attached" });
}

/** Opens the page on the Desktop tab, ready to walk. */
async function openWalk(page: Page): Promise<Locator> {
  await page.setViewportSize({ width: 1280, height: 1200 });
  await page.goto(PAGE, { waitUntil: "networkidle" });
  await hydrated(page);
  await showTab(page, "desktop");
  return flow(page);
}

/** Which screen the assembly has on the route, by the screen's own class. */
async function currentScreen(page: Page): Promise<string> {
  return flow(page)
    .locator("> div")
    .first()
    .evaluate((root) => {
      const name = [...root.classList].find((entry) => entry.startsWith("moderno-screen-"));
      if (name === undefined) throw new Error("the flow rendered no screen");
      return name.slice("moderno-screen-".length);
    });
}

/** The callback lines the page printed, newest first. */
async function reported(page: Page): Promise<string[]> {
  return page.locator(".demo-events li code").allInnerTexts();
}

async function fill(walked: Locator, values: Record<string, string>): Promise<void> {
  for (const [name, value] of Object.entries(values)) {
    await walked.locator(`input[name="${name}"]`).fill(value);
  }
}

/** The order summary's total row, as the screen on the route shows it. */
function orderTotal(walked: Locator): Locator {
  return walked.locator("dl").filter({ hasText: "Total" }).last();
}

interface FlowMetrics {
  containerWidth: number;
  rootHeight: number;
  frameHeight: number;
  mastheadDisplay: string;
  footerDisplay: string;
  headingLevels: number[];
}

/** Every copy of the flow the active tab mounted — one, when the demo is right. */
async function flowMetrics(page: Page): Promise<FlowMetrics[]> {
  return page.evaluate(() => {
    const panel = document.querySelector(".preview-panel--demo [data-demo-state]");
    if (!panel) throw new Error("no demo tab panel on the page");
    return [...panel.querySelectorAll("div.moderno-flow-checkout")].map((wrapper) => {
      const root = wrapper.firstElementChild as HTMLElement | null;
      if (!root) throw new Error("the flow rendered no screen");
      const masthead = root.querySelector("header");
      const footer = root.querySelector(":scope > div > footer");
      if (!masthead || !footer) throw new Error("the screen lost its own markup");
      return {
        containerWidth: root.offsetWidth,
        rootHeight: root.offsetHeight,
        frameHeight: (wrapper.parentElement as HTMLElement).clientHeight,
        mastheadDisplay: getComputedStyle(masthead).display,
        footerDisplay: getComputedStyle(footer).display,
        headingLevels: [...root.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((heading) =>
          Number(heading.getAttribute("aria-level") ?? heading.tagName.slice(1)),
        ),
      };
    });
  });
}

/**
 * The contrast of every piece of text inside the Desktop tab's flow, keyed by
 * where it is. Colours go through a canvas (the contract's values are OKLCH),
 * and translucent backgrounds are composited down to the first opaque one.
 */
async function contrastRatios(page: Page): Promise<Record<string, number>> {
  return page.evaluate(() => {
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

    const root = document.querySelector(
      '.preview-panel--demo [data-demo-state="desktop"] .moderno-flow-checkout',
    );
    if (!root) throw new Error("the flow did not render");

    const ratios: Record<string, number> = {};
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let text = walker.nextNode(); text; text = walker.nextNode()) {
      const content = text.textContent?.trim();
      const el = text.parentElement;
      if (!content || !el) continue;
      if (el.closest("[hidden], [aria-hidden='true'], .sr-only")) continue;
      const box = el.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) continue;
      if (getComputedStyle(el).visibility === "hidden") continue;
      ratios[`${el.tagName.toLowerCase()} "${content.slice(0, 32)}"`] = ratio(el);
    }
    return ratios;
  });
}

test.describe("checkout flow", () => {
  test("walks cart → shipping → payment → review → confirmation → cart", async ({ page }) => {
    const walked = await openWalk(page);
    expect(await currentScreen(page)).toBe("cart");

    // The cart is the assembly's: removing a line reprices every step after it.
    const vase = walked.locator("li").filter({ hasText: "Bud vase" });
    await vase.getByRole("button", { name: /Remove/ }).click();
    await expect(walked.getByText("Bud vase")).toHaveCount(0);
    await expect(walked).toContainText("€102");

    await walked.getByRole("button", { name: "Checkout" }).click();
    expect(await currentScreen(page)).toBe("shipping");
    expect(await reported(page)).toContain('onstepchange("shipping")');

    // An empty form stays put and names every field it needs.
    await walked.getByRole("button", { name: "Continue to payment" }).click();
    expect(await currentScreen(page)).toBe("shipping");
    await expect(walked).toContainText("Enter an email for the receipt.");
    await expect(walked).toContainText("Enter the country.");

    await fill(walked, SHIPPING);
    await walked.getByText("Express", { exact: true }).click();
    await walked.getByRole("button", { name: "Continue to payment" }).click();
    expect(await currentScreen(page)).toBe("payment");

    // The delivery method chosen on shipping is priced into the order.
    await expect(walked).toContainText("Shipping");
    await expect(orderTotal(walked)).toContainText("€118");

    await walked.getByRole("button", { name: "Place order" }).click();
    expect(await currentScreen(page)).toBe("payment");
    await expect(walked).toContainText("Enter the card number.");

    await fill(walked, CARD);
    await walked.getByRole("button", { name: "Place order" }).click();
    expect(await currentScreen(page)).toBe("review");

    // The review reads back what the two forms saved.
    await expect(walked).toContainText(SHIPPING.email);
    await expect(walked).toContainText("Ada Lovelace, 12 St James's Square, London");
    await expect(walked).toContainText("Express, 2–5 business days");
    await expect(walked).toContainText("Card ending in 4242");
    await expect(orderTotal(walked)).toContainText("€118");

    await walked.getByRole("button", { name: "Place order" }).click();
    expect(await currentScreen(page)).toBe("confirmation");
    await expect(walked).toContainText("#MD-10482");
    await expect(walked).toContainText(SHIPPING.email);
    await expect(orderTotal(walked)).toContainText("€118");
    expect(await reported(page)).toContain('onorderplaced({ number: "#MD-10482", total: 118 })');

    // The order took the lines with it: the shop starts over with an empty cart.
    await walked.getByRole("button", { name: "Continue shopping" }).click();
    expect(await currentScreen(page)).toBe("cart");
    expect(await reported(page)).toContain("oncontinueshopping()");
    await expect(walked.getByText("Stoneware mug")).toHaveCount(0);
  });

  test("steps back with Back and with the Edit cart link", async ({ page }) => {
    const walked = await openWalk(page);

    await walked.getByRole("button", { name: "Checkout" }).click();
    await walked.getByRole("button", { name: "Back to cart" }).click();
    expect(await currentScreen(page)).toBe("cart");

    await walked.getByRole("button", { name: "Checkout" }).click();
    await fill(walked, SHIPPING);
    await walked.getByRole("button", { name: "Continue to payment" }).click();
    expect(await currentScreen(page)).toBe("payment");

    await walked.getByRole("button", { name: "Back to shipping" }).click();
    expect(await currentScreen(page)).toBe("shipping");
    await fill(walked, SHIPPING);
    await walked.getByRole("button", { name: "Continue to payment" }).click();

    // "Edit cart" is a real href, and the assembly takes the click without the
    // document navigating: a router, not an anchor.
    const edit = walked.getByRole("link", { name: "Edit cart" });
    await expect(edit).toHaveAttribute("href", "#cart");
    const before = page.url();
    await edit.click();
    expect(await currentScreen(page)).toBe("cart");
    expect(page.url()).toBe(before);
    await expect(walked.getByRole("link", { name: "Stoneware mug" })).toBeVisible();
  });

  test("opens the examples on the empty cart and on shipping", async ({ page }) => {
    await page.goto(PAGE, { waitUntil: "networkidle" });
    const empty = page.locator('[data-demo-state="empty-cart"] .moderno-flow-checkout');
    await empty.scrollIntoViewIfNeeded();
    await expect(empty.locator("> div").first()).toHaveClass(/moderno-screen-cart/);
    await expect(empty.getByText("Stoneware mug")).toHaveCount(0);

    const shipping = page.locator('[data-demo-state="opens-at-shipping"] .moderno-flow-checkout');
    await shipping.scrollIntoViewIfNeeded();
    await expect(shipping.locator("> div").first()).toHaveClass(/moderno-screen-shipping/);
  });

  for (const scheme of ["light", "dark"] as const) {
    test.describe(`${scheme}`, () => {
      test.use({ colorScheme: scheme });

      for (const width of WIDTHS) {
        test(`lays the screen out from its container at ${width}px`, async ({ page }) => {
          await page.setViewportSize({ width, height: 1200 });
          await page.goto(PAGE, { waitUntil: "networkidle" });
          await page.evaluate(() => document.fonts.ready.then(() => true));
          expect(
            await page.evaluate(() => document.documentElement.classList.contains("dark")),
          ).toBe(scheme === "dark");

          await hydrated(page);

          const mounted: FlowMetrics[] = [];
          for (const tab of TABS) {
            await showTab(page, tab);
            const copies = await flowMetrics(page);
            expect(copies, `${scheme} ${width}px, ${tab}: mounted copies`).toHaveLength(1);
            mounted.push(copies[0]!);
          }

          const widths = mounted.map((m) => m.containerWidth);
          expect(
            widths.some((w) => w < CONTAINER_SM),
            `${width}px: a copy below @sm`,
          ).toBe(true);
          expect(
            widths.some((w) => w >= CONTAINER_MD),
            `${width}px: a copy at @md+`,
          ).toBe(true);

          for (const [index, metrics] of mounted.entries()) {
            const where = `${scheme} ${width}px, ${TABS[index]} (${metrics.containerWidth}px)`;
            expect(metrics.mastheadDisplay, `${where}: masthead`).toBe(
              metrics.containerWidth >= CONTAINER_SM ? "flex" : "grid",
            );
            expect(metrics.footerDisplay, `${where}: footer`).toBe(
              metrics.containerWidth >= CONTAINER_MD ? "flex" : "grid",
            );
            expect(metrics.rootHeight, `${where}: root height`).toBeGreaterThanOrEqual(
              metrics.frameHeight,
            );
            expect(metrics.headingLevels[0], `${where}: first heading`).toBe(1);
            for (const [i, level] of metrics.headingLevels.entries()) {
              if (i === 0) continue;
              expect(level, `${where}: heading ${i + 1}`).toBeLessThanOrEqual(
                metrics.headingLevels[i - 1]! + 1,
              );
            }
          }
        });
      }

      for (const theme of THEMES) {
        test(`clears AA contrast on every text in ${theme.name}`, async ({ page }) => {
          await page.setViewportSize({ width: 1280, height: 1200 });
          await page.goto(PAGE, { waitUntil: "networkidle" });
          await page.evaluate((brand) => {
            const root = document.documentElement;
            if (brand) root.dataset.brand = brand;
            else delete root.dataset.brand;
          }, theme.brand);
          await hydrated(page);
          await showTab(page, "desktop");

          const ratios = await contrastRatios(page);
          expect(Object.keys(ratios).length, "texts found").toBeGreaterThan(10);
          for (const [what, ratio] of Object.entries(ratios)) {
            expect(ratio, `${theme.name} ${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
          }
        });
      }
    });
  }
});
