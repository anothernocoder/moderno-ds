/**
 * The header block, checked on the built docs page at the three widths of the
 * responsive policy (375 / 768 / 1280) in both colour schemes. It asserts text
 * and computed styles; no screenshot baseline is committed.
 *
 * Five claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` the bar holds the
 *    brand and a "Menu" button; from `--container-sm` the call to action joins
 *    it; from `--container-md` the links sit in the bar and "Menu" goes away;
 *    from `--container-lg` the bar gains room. Each copy on the page is
 *    measured against its own container width, so the narrow frame keeps the
 *    Drawer at 1280 while the wide frame has crossed every step.
 * 2. **Every state renders what it claims**, at every width: the brand, the
 *    links with the current page marked and the call to action by default; no
 *    links and no "Menu" when the navigation is empty; three placeholders in a
 *    busy region while loading; an error Alert with a retry; a dimmed link with
 *    no `href` when one is disabled. Every copy is centred in its box.
 * 3. **The Drawer and the group's Menu work**: "Menu" opens a right Drawer with
 *    every link and the call to action, a click on a link closes it, and
 *    Escape hands focus back; "Product" opens a Menu of links that go where
 *    they say, with a disabled one skipped.
 * 4. **AA contrast** in both schemes on every text the block paints.
 * 5. **Hover and focus-visible** on a link, the group's trigger, the call to
 *    action and "Menu", and no focus on a disabled link.
 *
 * It also checks that an empty `error` string counts as no error: the links
 * come back, with no alert.
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

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/header/";

const BLOCK = ".moderno-block-header";

/** The copy the demo passes, and the copy the block ships with. */
const BRAND = "Northwind";
const HOME = "#header-home";
const ACTION = "Get started";
const NAV_ITEMS = ["Product", "Pricing", "Customers"];
const GROUP_LINKS = ["Invoicing", "Time tracking", "Receipts"];
const DRAWER_LINKS = [...GROUP_LINKS, "Pricing", "Customers"];
const ERROR = "We could not load the menu.";

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  brand: string;
  brandHref: string | null;
  brandSerif: boolean;
  /** Whether the block renders its bar navigation at all, and whether it shows. */
  hasNav: boolean;
  navShown: boolean;
  /** The top level of the bar's navigation: link texts and the group's trigger text. */
  navItems: string[];
  currentLinks: string[];
  /** Links with `aria-disabled="true"` and no `href`, dimmed. */
  disabledLinks: string[];
  hasMenuButton: boolean;
  menuButtonShown: boolean;
  actionShown: boolean;
  barPadding: number;
  placeholders: number;
  placeholdersShown: boolean;
  alert: boolean;
  /** Horizontal and vertical offsets between the block's centre and its panel's, in px. */
  offCentre: { x: number; y: number };
}

/**
 * The page's previews (islands/HeaderBlockDemo.svelte): the main preview mounts
 * the default; the Examples frame the same block at 18rem, 30rem, 40rem and
 * 50rem, then mount the empty, loading, error and disabled states. Every copy
 * is found by the `data-demo-state` its wrapper carries.
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

/** The copies that render their navigation. */
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
      const probe = document.createElement("div");
      probe.style.fontFamily = "var(--font-serif)";
      document.body.append(probe);
      const serif = getComputedStyle(probe).fontFamily;
      probe.remove();

      return [...wrapper.querySelectorAll<HTMLElement>(selector)].map((root) => {
        const bar = root.firstElementChild as HTMLElement | null;
        if (!bar) throw new Error("the header block did not render its own markup");
        const brand = bar.querySelector<HTMLAnchorElement>(":scope > a");
        const nav = bar.querySelector("nav");
        const items = nav ? [...nav.querySelectorAll(":scope > ul > li")] : [];
        const links = nav ? [...nav.querySelectorAll<HTMLAnchorElement>("a")] : [];
        const buttons = [...bar.querySelectorAll("button")];
        const menuButton = buttons.find((b) => text(b) === "Menu");
        const action = buttons.find((b) => text(b) === "Get started");
        const busy = bar.querySelector('[role="status"][aria-busy="true"]');
        const panel = root.closest(".preview-panel--demo")!.getBoundingClientRect();
        const box = root.getBoundingClientRect();

        return {
          containerWidth: root.offsetWidth,
          brand: text(brand),
          brandHref: brand?.getAttribute("href") ?? null,
          brandSerif: !!brand && getComputedStyle(brand).fontFamily === serif,
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
          actionShown: shown(action),
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
  state: "default" | "error",
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
        [`${state} link`, q("nav a:not([aria-current])")],
        [`${state} current link`, q('nav a[aria-current="page"]')],
        [`${state} group trigger`, q('nav [data-scope="menu"][data-part="trigger"]')],
        [`${state} call to action`, q(':scope > div > div > [data-scope="button"]')],
        [`${state} alert title`, q('[data-scope="alert"] [data-part="title"]')],
        [`${state} alert description`, q('[data-scope="alert"] [data-part="description"]')],
        [`${state} retry button`, q('[data-scope="alert"] [data-scope="button"]')],
      ]);
    },
    { state, measure: measureContrast.toString() },
  );
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`header — ${scheme}`, () => {
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
          // The links sit in the bar from @md; below it they are in the Drawer.
          expect(block.hasNav, `${where}: navigation`).toBe(WITH_NAV.includes(state));
          if (block.hasNav) {
            expect(block.navShown, `${where}: links in the bar`).toBe(w >= CONTAINER_MD);
            expect(block.navItems, `${where}: links`).toEqual(NAV_ITEMS);
            expect(block.currentLinks, `${where}: current page`).toEqual(["Pricing"]);
            expect(block.disabledLinks, `${where}: disabled links`).toEqual(
              state === "disabled" ? ["Customers"] : [],
            );
          }
          expect(block.hasMenuButton, `${where}: Menu button`).toBe(collapsible);
          if (collapsible) {
            expect(block.menuButtonShown, `${where}: Menu button shown`).toBe(w < CONTAINER_MD);
          }
          // The call to action joins the bar from @sm; with nothing to fold
          // away, it is in the bar at every width.
          expect(block.actionShown, `${where}: call to action`).toBe(
            !collapsible || w >= CONTAINER_SM,
          );

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

    test("opens the navigation in a right Drawer on a narrow container", async ({ page }) => {
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
      const nav = drawer.getByRole("navigation", { name: "Main" });
      await expect(nav.getByRole("link")).toHaveText(DRAWER_LINKS);
      await expect(nav).toContainText("Product");
      await expect(drawer.getByRole("link", { name: "Pricing" })).toHaveAttribute(
        "aria-current",
        "page",
      );
      await expect(drawer.getByRole("button", { name: ACTION })).toBeVisible();

      const ratios = await drawer.evaluate((el, measure) => {
        const fn = new Function(`return (${measure})`)() as (
          parts: Array<[string, Element | null | undefined]>,
        ) => Record<string, number>;
        return fn([
          ["group label", el.querySelector("nav li > p")],
          ["link", el.querySelector("nav a:not([aria-current])")],
          ["current link", el.querySelector('nav a[aria-current="page"]')],
          ["call to action", el.querySelector(':scope > [data-scope="button"]')],
        ]);
      }, measureContrast.toString());
      expect(Object.keys(ratios)).toHaveLength(4);
      for (const [what, ratio] of Object.entries(ratios)) {
        expect(ratio, `${scheme}: drawer ${what} contrast`).toBeGreaterThanOrEqual(4.5);
      }

      // A link in the Drawer takes the user to the page and closes it.
      await drawer.getByRole("link", { name: "Customers" }).click();
      await expect(drawer).toBeHidden();
      await expect(page).toHaveURL(/#header-customers$/);

      // Escape closes it too, and hands focus back to "Menu".
      await menu.click();
      await expect(drawer).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(drawer).toBeHidden();
      await expect(menu).toBeFocused();
    });

    test("opens a group's links in a Menu from the bar", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      const trigger = block.getByRole("button", { name: "Product", exact: true });
      await expect(trigger).toHaveAttribute("aria-haspopup", "menu");

      await trigger.click();
      const menu = page.getByRole("menu");
      await expect(menu).toBeVisible();
      const items = menu.getByRole("menuitem");
      await expect(items).toHaveText(GROUP_LINKS);
      for (const [i, id] of ["invoicing", "time-tracking", "receipts"].entries()) {
        await expect(items.nth(i)).toHaveAttribute("href", `#header-${id}`);
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
      await expect(page).toHaveURL(/#header-time-tracking$/);
    });

    test("clears AA contrast on every text it paints", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      const ratios = {
        ...(await contrastRatios(page, "default")),
        ...(await contrastRatios(page, "error")),
      };
      for (const label of [
        "default brand",
        "default link",
        "default current link",
        "default group trigger",
        "default call to action",
        "error brand",
        "error call to action",
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
        ["default", "link", "Customers"],
        ["default", "button", "Product"],
        ["default", "button", ACTION],
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

        // It changes on hover: the links, the group's trigger and "Menu" fill
        // with --accent; the solid call to action darkens through `filter`.
        const fill = () =>
          control.evaluate((el) => {
            const style = getComputedStyle(el);
            return `${style.backgroundColor} ${style.filter}`;
          });
        await control.blur();
        await page.mouse.move(0, 0);
        const resting = await fill();
        await control.hover();
        await expect.poll(fill, { message: `${scheme}: ${name} hover` }).not.toBe(resting);
      }

      // The brand shows a ring on keyboard focus too.
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      const brand = block.getByRole("link", { name: BRAND });
      await brand.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      expect((await brand.evaluate(ring)).style, `${scheme}: focus ring on the brand`).not.toBe(
        "none",
      );

      // Tab moves along the bar: Pricing, Customers, then the call to action.
      await block.getByRole("link", { name: "Pricing" }).focus();
      await page.keyboard.press("Tab");
      await expect(block.getByRole("link", { name: "Customers" })).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(block.getByRole("button", { name: ACTION })).toBeFocused();
    });

    test("keeps a disabled link out of reach", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "disabled");
      const block = page.locator(`[data-demo-state="disabled"] ${BLOCK}`);
      const link = block.locator("nav a", { hasText: "Customers" });
      await expect(link).toHaveAttribute("aria-disabled", "true");
      // Screen readers still hear a link, marked unavailable, not plain text.
      await expect(block.getByRole("link", { name: "Customers", disabled: true })).toHaveCount(1);
      await link.evaluate((el) => (el as HTMLElement).focus());
      await expect(link).not.toBeFocused();

      // Tab skips it: from Pricing straight to the call to action.
      await block.getByRole("link", { name: "Pricing" }).focus();
      await page.keyboard.press("Tab");
      await expect(block.getByRole("button", { name: ACTION })).toBeFocused();

      // In a group, a disabled link is a disabled Menu item with nowhere to go.
      await block.getByRole("button", { name: "Product", exact: true }).click();
      const receipts = page.getByRole("menu").getByRole("menuitem", { name: "Receipts" });
      await expect(receipts).toHaveAttribute("aria-disabled", "true");
      await expect(receipts).not.toHaveAttribute("href");
      await page.keyboard.press("Escape");
    });

    test("announces the loading links once and the failed load as an alert", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const region = page.locator(`[data-demo-state="loading"] ${BLOCK} [role="status"]`);
      await expect(region).toHaveCount(1);
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region).toContainText("Loading navigation");

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
      await expect(block.getByRole("navigation", { name: "Main" })).toHaveCount(1);
    });
  });
}
