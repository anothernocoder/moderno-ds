/**
 * The store-nav block, checked on the built docs page at the three widths of
 * the responsive policy (375 / 768 / 1280) in both colour schemes. It asserts
 * text and computed styles; no screenshot baseline is committed.
 *
 * Six claims:
 *
 * 1. **Container, not viewport.** Below `--container-md` the first row holds
 *    the brand and a "Menu" button, and the search and the cart share a row
 *    under it; from `--container-sm` the bar gains room at its ends; from
 *    `--container-md` the categories sit in the bar and "Menu" goes away; from
 *    `--container-lg` the search and the cart join the first row. Each copy on
 *    the page is measured against its own container width, so the narrow
 *    frame keeps the Drawer at 1280 while the wide frame has crossed every
 *    step.
 * 2. **Every state renders what it claims**, at every width: the brand, the
 *    categories with the current one marked, the search and the cart with its
 *    count by default; no categories and no "Menu" when they are empty; three
 *    placeholders in a busy region while loading; an error Alert with a retry;
 *    a dimmed link with no `href` when one is disabled. Every copy is centred
 *    in its box.
 * 3. **The Drawer and a category's Menu work**: "Menu" opens a right Drawer
 *    with every category, a click on a link closes it, and Escape hands focus
 *    back; "Workspace" opens a Menu of links that go where they say, with a
 *    disabled one skipped.
 * 4. **The search suggests and searches**: typing filters the suggestions (case
 *    and accents ignored), a suggestion is a link that goes where it says, and
 *    Enter with none highlighted hands the trimmed query to `onSearch` and
 *    closes the list; nothing left says so.
 * 5. **AA contrast** in both schemes on every text the block paints.
 * 6. **Hover and focus-visible** on a link, a category's trigger, the cart,
 *    "Menu" and the search, and no focus on a disabled link.
 *
 * It also checks that an empty `error` string counts as no error: the
 * categories come back, with no alert.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** Room at either end of the bar: `px-4`, then `px-6` at @sm and `px-8` at @lg. */
const PADDING_BASE = 16;
const PADDING_SM = 24;
const PADDING_LG = 32;

/** The narrowest the search box may get: its placeholder and the input's padding. */
const SEARCH_MIN = 128;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/store-nav/";

const BLOCK = ".moderno-block-store-nav";

/** The copy the demo passes, and the copy the block ships with. */
const BRAND = "Northwind";
const HOME = "#store-nav-home";
const CATEGORIES = ["Workspace", "Stationery", "Bags"];
const WORKSPACE_LINKS = ["Desks", "Chairs", "Lamps"];
const DRAWER_LINKS = [...WORKSPACE_LINKS, "Notebooks", "Pens", "Planners", "Bags"];
const CART = "Cart, 2 items";
const EMPTY_CART = "Cart, 0 items";
const SEARCH = "Search products";
const NO_MATCH = "No suggestions. Press Enter to search.";
const ERROR = "We could not load the categories.";

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  brand: string;
  brandHref: string | null;
  brandSerif: boolean;
  /** Whether the block renders its bar navigation at all, and whether it shows. */
  hasNav: boolean;
  navShown: boolean;
  /** The top level of the bar's navigation: link texts and the triggers' texts. */
  navItems: string[];
  currentLinks: string[];
  /** Links with `aria-disabled="true"` and no `href`, dimmed. */
  disabledLinks: string[];
  hasMenuButton: boolean;
  menuButtonShown: boolean;
  /** Whether the "Menu" button sits on the brand's row. */
  menuButtonInBar: boolean;
  searchWidth: number;
  /** Whether the search and the cart sit on the brand's row. */
  searchInBar: boolean;
  cartInBar: boolean;
  cartName: string | null;
  barPadding: number;
  placeholders: number;
  placeholdersShown: boolean;
  alert: boolean;
  /** Horizontal and vertical offsets between the block's centre and its panel's, in px. */
  offCentre: { x: number; y: number };
}

/**
 * The page's previews (islands/StoreNavBlockDemo.svelte): the main preview
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

/** The copies framed inside the widths example, not centred in a panel of their own. */
const FRAMED: readonly State[] = ["narrow", "compact", "panel", "wide"];

/** The copies that render their categories. */
const WITH_NAV: readonly State[] = ["default", "narrow", "compact", "panel", "wide", "disabled"];

async function showState(page: Page, state: State): Promise<void> {
  const block = page.locator(`[data-demo-state="${state}"] ${BLOCK}`);
  await block.scrollIntoViewIfNeeded();
  await block.waitFor({ state: "visible" });
  // The demo mounts `client:visible`: a click before it hydrates opens nothing.
  await page
    .locator(`astro-island:not([ssr]):has([data-demo-state="${state}"])`)
    .waitFor({ state: "attached" });
}

async function blockMetrics(page: Page, state: State): Promise<BlockMetrics[]> {
  return page.evaluate(
    ({ state, selector }) => {
      const wrapper = document.querySelector(`[data-demo-state="${state}"]`);
      if (!wrapper) throw new Error(`no preview for the ${state} state on the page`);
      const text = (el: Element | null | undefined) =>
        el?.textContent?.replace(/\s+/g, " ").trim() ?? "";
      const shown = (el: Element | null | undefined) =>
        !!el && getComputedStyle(el).display !== "none" && (el as HTMLElement).offsetWidth > 0;
      const middle = (el: Element) => {
        const box = el.getBoundingClientRect();
        return box.top + box.height / 2;
      };
      const probe = document.createElement("div");
      probe.style.fontFamily = "var(--font-serif)";
      document.body.append(probe);
      const serif = getComputedStyle(probe).fontFamily;
      probe.remove();

      return [...wrapper.querySelectorAll<HTMLElement>(selector)].map((root) => {
        const bar = root.firstElementChild as HTMLElement | null;
        if (!bar) throw new Error("the store-nav block did not render its own markup");
        const brand = bar.querySelector<HTMLAnchorElement>(":scope > a");
        if (!brand) throw new Error("the store-nav block rendered no brand");
        const onBrandRow = (el: Element | null | undefined) =>
          !!el && Math.abs(middle(el) - middle(brand)) < 2;
        const nav = bar.querySelector("nav");
        const items = nav ? [...nav.querySelectorAll(":scope > ul > li")] : [];
        const links = nav ? [...nav.querySelectorAll<HTMLAnchorElement>("a")] : [];
        const buttons = [...bar.querySelectorAll("button")];
        const menuButton = buttons.find((b) => text(b) === "Menu");
        const cart = buttons.find((b) => b.getAttribute("aria-label")?.startsWith("Cart"));
        const search = bar.querySelector('form[role="search"]');
        const busy = bar.querySelector('[role="status"][aria-busy="true"]');
        const panel = root.closest(".preview-panel--demo")!.getBoundingClientRect();
        const box = root.getBoundingClientRect();

        return {
          containerWidth: root.offsetWidth,
          brand: text(brand),
          brandHref: brand.getAttribute("href"),
          brandSerif: getComputedStyle(brand).fontFamily === serif,
          hasNav: nav !== null,
          navShown: shown(nav),
          navItems: items.map((li) => {
            const trigger = li.querySelector('[data-scope="menu"][data-part="trigger"]');
            if (!trigger) return text(li);
            const indicator = trigger.querySelector('[data-part="indicator"]');
            return text(trigger).replace(text(indicator), "").trim();
          }),
          currentLinks: links.filter((a) => a.getAttribute("aria-current") === "page").map(text),
          disabledLinks: links
            .filter(
              (a) =>
                a.getAttribute("aria-disabled") === "true" &&
                !a.hasAttribute("href") &&
                parseFloat(getComputedStyle(a).opacity) < 1,
            )
            .map(text),
          hasMenuButton: menuButton !== undefined,
          menuButtonShown: shown(menuButton),
          menuButtonInBar: onBrandRow(menuButton),
          searchWidth: search ? search.getBoundingClientRect().width : 0,
          searchInBar: onBrandRow(search),
          cartInBar: onBrandRow(cart),
          cartName: cart?.getAttribute("aria-label") ?? null,
          barPadding: parseFloat(getComputedStyle(bar).paddingLeft),
          placeholders: busy
            ? busy.querySelectorAll('[data-scope="skeleton"][aria-hidden="true"]').length
            : 0,
          placeholdersShown: shown(busy),
          alert: root.querySelector('[data-scope="alert"][role="alert"]') !== null,
          offCentre: {
            x: Math.abs(box.left - panel.left - (panel.right - box.right)),
            y: Math.abs(box.top - panel.top - (panel.bottom - box.bottom)),
          },
        };
      });
    },
    { state, selector: BLOCK },
  );
}

/**
 * The WCAG contrast ratio of each element's text against the nearest surface
 * that paints a background. Colours are resolved through a canvas: the
 * contract's values are OKLCH, and the browser is the only thing that converts
 * them exactly the way it painted them.
 */
function measureContrast(
  parts: Array<[string, Element | null | undefined]>,
): Record<string, number> {
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
  for (const [what, el] of parts) {
    if (!el) continue;
    const a = luminance(getComputedStyle(el).color);
    const b = luminance(surfaceOf(el));
    ratios[what] = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }
  return ratios;
}

async function contrastRatios(
  page: Page,
  state: "default" | "empty" | "error",
): Promise<Record<string, number>> {
  await showState(page, state);
  const block = page.locator(`[data-demo-state="${state}"] ${BLOCK}`);
  return block.evaluate(
    (root, { state, measure }) => {
      const fn = new Function(`return (${measure})`)() as (
        parts: Array<[string, Element | null | undefined]>,
      ) => Record<string, number>;
      const q = (selector: string) => root.querySelector(selector);
      return fn([
        [`${state} brand`, q(":scope > div > a")],
        [`${state} current link`, q('nav a[aria-current="page"]')],
        [`${state} category trigger`, q('nav [data-scope="menu"][data-part="trigger"]')],
        [`${state} search text`, q('[data-scope="combobox"][data-part="input"]')],
        [`${state} cart`, q('button[aria-label^="Cart"]')],
        [`${state} cart count`, q('button[aria-label^="Cart"] [data-scope="badge"]')],
        [`${state} alert title`, q('[data-scope="alert"] [data-part="title"]')],
        [`${state} alert description`, q('[data-scope="alert"] [data-part="description"]')],
        [`${state} retry button`, q('[data-scope="alert"] [data-scope="button"]')],
      ]);
    },
    { state, measure: measureContrast.toString() },
  );
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`store-nav — ${scheme}`, () => {
    test.use({ colorScheme: scheme });

    for (const width of WIDTHS) {
      test(`lays itself out from its container at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1200 });
        await page.goto(PAGE, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready.then(() => true));

        expect(await page.evaluate(() => document.documentElement.classList.contains("dark"))).toBe(
          scheme === "dark",
        );

        const widths: number[] = [];
        for (const state of STATES) {
          await showState(page, state);
          const mounted = await blockMetrics(page, state);
          expect(mounted, `${state}: mounted copies`).toHaveLength(1);
          const block = mounted[0]!;
          const w = block.containerWidth;
          widths.push(w);
          const where = `${scheme} ${width}px, ${state} (${w}px)`;

          if (!FRAMED.includes(state)) {
            expect(block.offCentre.x, `${where}: centred across`).toBeLessThan(2);
            expect(block.offCentre.y, `${where}: centred down`).toBeLessThan(2);
          }
          expect(block.brand, `${where}: brand`).toBe(BRAND);
          expect(block.brandHref, `${where}: brand links home`).toBe(HOME);
          expect(block.brandSerif, `${where}: serif brand`).toBe(true);
          expect(block.barPadding, `${where}: room at the ends of the bar`).toBe(
            w >= CONTAINER_LG ? PADDING_LG : w >= CONTAINER_SM ? PADDING_SM : PADDING_BASE,
          );

          const collapsible = WITH_NAV.includes(state) || state === "loading";
          // The categories sit in the bar from @md; below it they are in the Drawer.
          expect(block.hasNav, `${where}: categories`).toBe(WITH_NAV.includes(state));
          if (block.hasNav) {
            expect(block.navShown, `${where}: categories in the bar`).toBe(w >= CONTAINER_MD);
            expect(block.navItems, `${where}: categories`).toEqual(
              state === "disabled" ? [...CATEGORIES, "Sale"] : CATEGORIES,
            );
            expect(block.currentLinks, `${where}: current category`).toEqual(["Bags"]);
            expect(block.disabledLinks, `${where}: disabled links`).toEqual(
              state === "disabled" ? ["Sale"] : [],
            );
          }
          expect(block.hasMenuButton, `${where}: Menu button`).toBe(collapsible);
          if (collapsible) {
            expect(block.menuButtonShown, `${where}: Menu button shown`).toBe(w < CONTAINER_MD);
            if (w < CONTAINER_MD) {
              expect(block.menuButtonInBar, `${where}: Menu beside the brand`).toBe(true);
            }
          }

          // The search and the cart share a row under the brand until @lg,
          // where they join it; the search always keeps room to type.
          expect(block.searchInBar, `${where}: search in the bar`).toBe(w >= CONTAINER_LG);
          expect(block.cartInBar, `${where}: cart in the bar`).toBe(w >= CONTAINER_LG);
          expect(block.searchWidth, `${where}: search width`).toBeGreaterThanOrEqual(SEARCH_MIN);
          expect(block.cartName, `${where}: cart`).toBe(state === "empty" ? EMPTY_CART : CART);

          expect(block.placeholders, `${where}: placeholders`).toBe(state === "loading" ? 3 : 0);
          if (state === "loading") {
            expect(block.placeholdersShown, `${where}: placeholders in the bar`).toBe(
              w >= CONTAINER_MD,
            );
          }
          expect(block.alert, `${where}: error announced`).toBe(state === "error");

          // The 50rem frame scrolls inside itself; the panel holding the demo
          // never pushes the page sideways.
          const panel = await page.evaluate((state) => {
            const el = document
              .querySelector(`[data-demo-state="${state}"]`)!
              .closest(".preview-panel--demo") as HTMLElement;
            return { scroll: el.scrollWidth, client: el.clientWidth };
          }, state);
          expect(panel.scroll, `${where}: demo panel overflow`).toBeLessThanOrEqual(panel.client);

          // The bar never overflows its own container.
          const bar = await page.evaluate(
            ({ state, selector }) => {
              const el = document.querySelector(`[data-demo-state="${state}"] ${selector}`)!
                .firstElementChild as HTMLElement;
              return { scroll: el.scrollWidth, client: el.clientWidth };
            },
            { state, selector: BLOCK },
          );
          expect(bar.scroll, `${where}: bar overflow`).toBeLessThanOrEqual(bar.client);
        }

        // Each step is exercised on both sides at every viewport, so a step that
        // silently stopped firing cannot pass this file.
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

    test("opens the categories in a right Drawer on a narrow container", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "narrow");
      const block = page.locator(`[data-demo-state="narrow"] ${BLOCK}`);
      const menu = block.getByRole("button", { name: "Menu", exact: true });

      await menu.click();
      const drawer = page.getByRole("dialog", { name: BRAND });
      await expect(drawer).toBeVisible();
      const content = page.locator('[data-scope="drawer"][data-part="content"]');
      await expect(content).toHaveAttribute("data-placement", "right");
      const edge = await content.evaluate((el) => ({
        right: el.getBoundingClientRect().right,
        viewport: document.documentElement.clientWidth,
      }));
      expect(edge.right).toBe(edge.viewport);
      const nav = drawer.getByRole("navigation", { name: "Categories" });
      await expect(nav.getByRole("link")).toHaveText(DRAWER_LINKS);
      await expect(nav.locator("li > p")).toHaveText(["Workspace", "Stationery"]);
      await expect(drawer.getByRole("link", { name: "Bags" })).toHaveAttribute(
        "aria-current",
        "page",
      );

      const ratios = await drawer.evaluate((el, measure) => {
        const fn = new Function(`return (${measure})`)() as (
          parts: Array<[string, Element | null | undefined]>,
        ) => Record<string, number>;
        return fn([
          ["category label", el.querySelector("nav li > p")],
          ["link", el.querySelector("nav a:not([aria-current])")],
          ["current link", el.querySelector('nav a[aria-current="page"]')],
        ]);
      }, measureContrast.toString());
      expect(Object.keys(ratios)).toHaveLength(3);
      for (const [what, ratio] of Object.entries(ratios)) {
        expect(ratio, `${scheme}: drawer ${what} contrast`).toBeGreaterThanOrEqual(4.5);
      }

      // A link in the Drawer takes the user to the category and closes it.
      await drawer.getByRole("link", { name: "Pens" }).click();
      await expect(drawer).toBeHidden();
      await expect(page).toHaveURL(/#store-nav-pens$/);

      // Escape closes it too, and hands focus back to "Menu".
      await menu.click();
      await expect(drawer).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(drawer).toBeHidden();
      await expect(menu).toBeFocused();
    });

    test("opens a category's sub-categories in a Menu from the bar", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      const trigger = block.getByRole("button", { name: "Workspace", exact: true });
      await expect(trigger).toHaveAttribute("aria-haspopup", "menu");

      await trigger.click();
      const menu = page.getByRole("menu");
      await expect(menu).toBeVisible();
      const items = menu.getByRole("menuitem");
      await expect(items).toHaveText(WORKSPACE_LINKS);
      for (const [i, id] of ["desks", "chairs", "lamps"].entries()) {
        await expect(items.nth(i)).toHaveAttribute("href", `#store-nav-${id}`);
      }

      const ratio = await menu.evaluate((el, measure) => {
        const fn = new Function(`return (${measure})`)() as (
          parts: Array<[string, Element | null | undefined]>,
        ) => Record<string, number>;
        return fn([["item", el.querySelector('[role="menuitem"]')]]).item!;
      }, measureContrast.toString());
      expect(ratio, `${scheme}: menu item contrast`).toBeGreaterThanOrEqual(4.5);

      // Escape closes the Menu and hands focus back to its trigger.
      await page.keyboard.press("Escape");
      await expect(menu).toBeHidden();
      await expect(trigger).toBeFocused();

      // An item is a real link: choosing it goes where it points.
      await trigger.click();
      await expect(menu).toBeVisible();
      await items.nth(1).click();
      await expect(menu).toBeHidden();
      await expect(page).toHaveURL(/#store-nav-chairs$/);
    });

    test("suggests products as the user types and searches on Enter", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      const search = block.getByRole("search");
      const input = search.getByRole("combobox", { name: SEARCH });
      await expect(input).toHaveAttribute("placeholder", SEARCH);

      // Typing opens the matching suggestions, case and accents aside.
      await input.fill("DÉSK");
      const list = page.getByRole("listbox");
      await expect(list).toBeVisible();
      const options = list.getByRole("option");
      await expect(options).toHaveText(["Oak standing desk", "Brass desk lamp"]);
      await expect(options.first()).toHaveAttribute("href", "#store-nav-oak-standing-desk");

      const ratio = await list.evaluate((el, measure) => {
        const fn = new Function(`return (${measure})`)() as (
          parts: Array<[string, Element | null | undefined]>,
        ) => Record<string, number>;
        return fn([["option", el.querySelector('[role="option"]')]]).option!;
      }, measureContrast.toString());
      expect(ratio, `${scheme}: suggestion contrast`).toBeGreaterThanOrEqual(4.5);

      // A suggestion is a link: the arrow keys and Enter follow it.
      await input.press("ArrowDown");
      await expect(options.first()).toHaveAttribute("data-highlighted", "");
      await input.press("Enter");
      await expect(page).toHaveURL(/#store-nav-oak-standing-desk$/);

      // With nothing matching, the list says Enter still searches…
      await input.fill("");
      await input.pressSequentially("zzz");
      await expect(input).toHaveValue("zzz");
      await expect(list).toBeVisible();
      await expect(list.locator('[data-part="empty"]')).toHaveText(NO_MATCH);
      await expect(list.getByRole("option")).toHaveCount(0);

      // …and Enter with no suggestion highlighted hands the trimmed text to
      // `onSearch` (the demo turns it into a fragment) and closes the list.
      await input.press("Enter");
      await expect(page).toHaveURL(/#store-nav-search-zzz$/);
      await expect(list).toBeHidden();
      await input.fill("  lamp  ");
      await expect(list.getByRole("option")).toHaveText(["Brass desk lamp"]);
      await input.press("Enter");
      await expect(page).toHaveURL(/#store-nav-search-lamp$/);
      await expect(list).toBeHidden();

      // An empty query searches nothing.
      await input.fill(" ");
      await input.press("Enter");
      await expect(page).toHaveURL(/#store-nav-search-lamp$/);
    });

    test("names the cart with its count", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const cart = page
        .locator(`[data-demo-state="default"] ${BLOCK}`)
        .getByRole("button", { name: CART, exact: true });
      await expect(cart).toHaveText(/Cart\s*2/);
      const full = await cart.locator('[data-scope="badge"]').getAttribute("data-variant");
      expect(full).toBe("solid");

      await showState(page, "empty");
      const empty = page
        .locator(`[data-demo-state="empty"] ${BLOCK}`)
        .getByRole("button", { name: EMPTY_CART, exact: true });
      await expect(empty).toHaveText(/Cart\s*0/);
      const none = await empty.locator('[data-scope="badge"]').getAttribute("data-variant");
      expect(none).toBe("neutral");
    });

    test("clears AA contrast on every text it paints", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      const ratios = {
        ...(await contrastRatios(page, "default")),
        ...(await contrastRatios(page, "empty")),
        ...(await contrastRatios(page, "error")),
      };
      for (const label of [
        "default brand",
        "default current link",
        "default category trigger",
        "default search text",
        "default cart",
        "default cart count",
        "empty cart count",
        "error brand",
        "error cart",
        "error alert title",
        "error alert description",
        "error retry button",
      ]) {
        expect(Object.keys(ratios), `${scheme}: ${label} measured`).toContain(label);
      }
      for (const [what, ratio] of Object.entries(ratios)) {
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
      }
    });

    test("shows hover and focus-visible on its links and buttons", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      const ring = (el: Element) => ({
        focused: el.matches(":focus-visible"),
        style: getComputedStyle(el).outlineStyle,
      });

      for (const [state, role, name] of [
        ["default", "link", "Bags"],
        ["default", "button", "Workspace"],
        ["default", "button", CART],
        ["narrow", "button", "Menu"],
      ] as const) {
        await showState(page, state);
        const control = page
          .locator(`[data-demo-state="${state}"] ${BLOCK}`)
          .getByRole(role, { name, exact: true });
        await expect(control).toHaveCount(1);

        // Keyboard focus draws a ring.
        await control.focus();
        await page.keyboard.press("Shift+Tab");
        await page.keyboard.press("Tab");
        const focus = await control.evaluate(ring);
        expect(focus.focused, `${scheme}: keyboard focus on ${name}`).toBe(true);
        expect(focus.style, `${scheme}: focus ring on ${name}`).not.toBe("none");

        // It fills with --accent on hover.
        const fill = () => control.evaluate((el) => getComputedStyle(el).backgroundColor);
        await control.blur();
        await page.mouse.move(0, 0);
        const resting = await fill();
        await control.hover();
        await expect.poll(fill, { message: `${scheme}: ${name} hover` }).not.toBe(resting);
      }

      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);

      // The search box raises its border on hover and draws its ring while focused.
      const box = block.locator('[data-scope="combobox"][data-part="control"]');
      const border = () => box.evaluate((el) => getComputedStyle(el).borderColor);
      await page.mouse.move(0, 0);
      const restingBorder = await border();
      await box.hover();
      await expect.poll(border, { message: `${scheme}: search hover` }).not.toBe(restingBorder);
      await block.getByRole("link", { name: "Bags" }).focus();
      await page.keyboard.press("Tab");
      await expect(block.getByRole("combobox", { name: SEARCH })).toBeFocused();
      expect(await box.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe("none");

      // The brand shows a ring on keyboard focus too.
      const brand = block.getByRole("link", { name: BRAND });
      await brand.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      expect((await brand.evaluate(ring)).style, `${scheme}: focus ring on the brand`).not.toBe(
        "none",
      );

      // Tab moves along the bar: the categories, the search, then the cart.
      await block.getByRole("button", { name: "Stationery", exact: true }).focus();
      await page.keyboard.press("Tab");
      await expect(block.getByRole("link", { name: "Bags" })).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(block.getByRole("combobox", { name: SEARCH })).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(block.getByRole("button", { name: CART, exact: true })).toBeFocused();
    });

    test("keeps a disabled link out of reach", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "disabled");
      const block = page.locator(`[data-demo-state="disabled"] ${BLOCK}`);
      const link = block.locator("nav a", { hasText: "Sale" });
      await expect(link).toHaveAttribute("aria-disabled", "true");
      // Screen readers still hear a link, marked unavailable, not plain text.
      await expect(block.getByRole("link", { name: "Sale", disabled: true })).toHaveCount(1);
      await link.evaluate((el) => (el as HTMLElement).focus());
      await expect(link).not.toBeFocused();

      // Tab skips it: from Bags straight to the search.
      await block.getByRole("link", { name: "Bags" }).focus();
      await page.keyboard.press("Tab");
      await expect(block.getByRole("combobox", { name: SEARCH })).toBeFocused();

      // Under a category, a disabled link is a disabled Menu item with nowhere to go.
      await block.getByRole("button", { name: "Workspace", exact: true }).click();
      const lamps = page.getByRole("menu").getByRole("menuitem", { name: "Lamps" });
      await expect(lamps).toHaveAttribute("aria-disabled", "true");
      await expect(lamps).not.toHaveAttribute("href");
      await page.keyboard.press("Escape");
    });

    test("announces the loading categories once and the failed load as an alert", async ({
      page,
    }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const region = page.locator(`[data-demo-state="loading"] ${BLOCK} [role="status"]`);
      await expect(region).toHaveCount(1);
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region).toContainText("Loading categories");

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
      await expect(block.getByRole("navigation", { name: "Categories" })).toHaveCount(1);
    });
  });
}
