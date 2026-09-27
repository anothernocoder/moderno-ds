/**
 * The app-shell block, checked on the built docs page at the three widths of
 * the responsive policy (375 / 768 / 1280) in both colour schemes. It asserts
 * text and computed styles; no screenshot baseline is committed.
 *
 * Five claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` the navigation hides
 *    behind a "Menu" button and the account trigger shows the user's initials;
 *    from `--container-sm` the trigger shows the name and the content gains
 *    room; from `--container-md` the sidebar holds the navigation and the
 *    "Menu" button goes away; from `--container-lg` the sidebar widens and the
 *    content gains room again. Each copy on the page is measured against its
 *    own container width, so the narrow frame keeps the Drawer at 1280 while
 *    the wide frame has crossed every step.
 * 2. **Every state renders what it claims**, at every width: the brand, the
 *    links with the current page marked, the heading and the page by default;
 *    the empty message without children; three placeholders in a busy region
 *    while loading; an error Alert with a retry; a dimmed link with no `href`
 *    when one is disabled. Every copy is centred in its box.
 * 3. **The Drawer and the account Menu work**: "Menu" opens a left Drawer with
 *    the same links, a click on a link closes it, and Escape hands focus back;
 *    the account trigger opens a Menu with the user's name and email and the
 *    Profile, Settings and Sign out items.
 * 4. **AA contrast** in both schemes on every text the block paints.
 * 5. **Hover and focus-visible** on a link, the account trigger and the "Menu"
 *    button, and no focus on a disabled link.
 *
 * It also checks that an empty `error` string counts as no error: the page
 * comes back, with no alert.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The sidebar's width at `@md` (`w-56`) and at `@lg` (`w-64`). */
const SIDEBAR_MD = 224;
const SIDEBAR_LG = 256;

/** Room around the content: `p-4`, then `p-6` at @sm and `p-8` at @lg. */
const PADDING_BASE = 16;
const PADDING_SM = 24;
const PADDING_LG = 32;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/app-shell/";

const BLOCK = ".moderno-block-app-shell";

/** The copy the demo passes, and the copy the block ships with. */
const BRAND = "Acme";
const HEADING = "Overview";
const USER = "Ada Lovelace";
const INITIALS = "AL";
const EMAIL = "ada@acme.com";
const LINKS = ["Overview", "Transactions", "Invoices", "Customers", "Settings"];
const LINKS_WITH_DISABLED = [
  "Overview",
  "Transactions",
  "Invoices",
  "Customers",
  "Reports",
  "Settings",
];
const STATS = ["Revenue", "Customers", "Open invoices"];
const EMPTY = ["Nothing here yet", "What you add to this page shows up here."];
const ERROR = "We could not load this page.";

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  brand: string;
  sidebarShown: boolean;
  sidebarWidth: number;
  links: string[];
  currentLinks: string[];
  /** Links with `aria-disabled="true"` and no `href`, dimmed. */
  disabledLinks: string[];
  menuButtonShown: boolean;
  heading: string;
  headingSerif: boolean;
  triggerName: string | null;
  triggerText: string;
  contentPadding: number;
  stats: string[];
  empty: string[];
  placeholders: number;
  alert: boolean;
  /** Horizontal and vertical offsets between the block's centre and its panel's, in px. */
  offCentre: { x: number; y: number };
}

/**
 * The page's previews (islands/AppShellBlockDemo.svelte): the main preview
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
        const shell = root.firstElementChild as HTMLElement | null;
        if (!shell) throw new Error("the app-shell block did not render its own markup");
        const [sidebar, column] = [...shell.children] as HTMLElement[];
        const header = column!.querySelector("header")!;
        const main = column!.querySelector("main")!;
        const links = [...sidebar!.querySelectorAll<HTMLAnchorElement>("nav a")];
        const menuButton = [...header.querySelectorAll("button")].find((b) => text(b) === "Menu");
        const trigger = header.querySelector('[data-scope="menu"][data-part="trigger"]');
        const visibleText = trigger
          ? [...trigger.querySelectorAll("span")]
              .filter((span) => shown(span) && !span.hasAttribute("data-part"))
              .map(text)
              .join(" ")
          : "";
        const busy = main.querySelector('[role="status"][aria-busy="true"]');
        const empty = main.querySelector(":scope > .border-dashed");
        const panel = root.closest(".preview-panel--demo")!.getBoundingClientRect();
        const box = root.getBoundingClientRect();

        return {
          containerWidth: root.offsetWidth,
          brand: text(sidebar!.querySelector("p")),
          sidebarShown: shown(sidebar),
          sidebarWidth: sidebar!.offsetWidth,
          links: links.map(text),
          currentLinks: links.filter((a) => a.getAttribute("aria-current") === "page").map(text),
          disabledLinks: links
            .filter(
              (a) =>
                a.getAttribute("aria-disabled") === "true" &&
                !a.hasAttribute("href") &&
                parseFloat(getComputedStyle(a).opacity) < 1,
            )
            .map(text),
          menuButtonShown: shown(menuButton),
          heading: text(header.querySelector("h1")),
          headingSerif: getComputedStyle(header.querySelector("h1")!).fontFamily === serif,
          triggerName: trigger?.getAttribute("aria-label") ?? null,
          triggerText: visibleText,
          contentPadding: parseFloat(getComputedStyle(main).paddingLeft),
          stats: [...main.querySelectorAll('[data-scope="card"] p:first-child')].map(text),
          empty: empty ? [...empty.querySelectorAll("p")].map(text) : [],
          placeholders: busy
            ? busy.querySelectorAll('[data-scope="skeleton"][aria-hidden="true"]').length
            : 0,
          alert: main.querySelector('[data-scope="alert"][role="alert"]') !== null,
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
 * Contrast ratios read off the rendered page. Colours are resolved through a
 * canvas: the contract's values are OKLCH, and the browser is the only thing
 * that converts them exactly the way it painted them.
 */
async function contrastRatios(
  page: Page,
  state: "default" | "empty" | "error",
): Promise<Record<string, number>> {
  await showState(page, state);
  return page.evaluate(
    ({ state, selector }) => {
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

      const block = document.querySelector(`[data-demo-state="${state}"] ${selector}`);
      if (!block) throw new Error(`the ${state} preview did not render`);

      const against = (el: Element) => ratio(getComputedStyle(el).color, surfaceOf(el));
      const empty = block.querySelector("main > .border-dashed");
      const parts: Array<[string, Element | null | undefined]> = [
        ["heading", block.querySelector("h1")],
        ["brand", block.querySelector("nav")?.parentElement?.querySelector("p")],
        ["link", block.querySelector("nav a:not([aria-current])")],
        ["current link", block.querySelector('nav a[aria-current="page"]')],
        ["account trigger", block.querySelector('[data-scope="menu"][data-part="trigger"]')],
        ["empty title", empty?.querySelector("p:first-child")],
        ["empty message", empty?.querySelector("p:last-child")],
        ["alert title", block.querySelector('[data-scope="alert"] [data-part="title"]')],
        [
          "alert description",
          block.querySelector('[data-scope="alert"] [data-part="description"]'),
        ],
        ["retry button", block.querySelector('[data-scope="alert"] [data-scope="button"]')],
      ];

      const ratios: Record<string, number> = {};
      for (const [what, el] of parts) {
        if (el) ratios[`${state} ${what}`] = against(el);
      }
      return ratios;
    },
    { state, selector: BLOCK },
  );
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`app-shell — ${scheme}`, () => {
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
          expect(block.heading, `${where}: heading`).toBe(HEADING);
          expect(block.headingSerif, `${where}: serif heading`).toBe(true);
          expect(block.links, `${where}: links`).toEqual(
            state === "disabled" ? LINKS_WITH_DISABLED : LINKS,
          );
          expect(block.currentLinks, `${where}: current page`).toEqual(["Overview"]);
          expect(block.disabledLinks, `${where}: disabled links`).toEqual(
            state === "disabled" ? ["Reports"] : [],
          );

          // Below @md the Drawer holds the links; from @md the sidebar does.
          expect(block.sidebarShown, `${where}: sidebar`).toBe(w >= CONTAINER_MD);
          expect(block.menuButtonShown, `${where}: Menu button`).toBe(w < CONTAINER_MD);
          if (w >= CONTAINER_MD) {
            expect(block.sidebarWidth, `${where}: sidebar width`).toBe(
              w >= CONTAINER_LG ? SIDEBAR_LG : SIDEBAR_MD,
            );
          }

          // The account trigger always carries the full name; it shows the
          // initials below @sm and the name from it.
          expect(block.triggerName, `${where}: trigger name`).toBe(USER);
          expect(block.triggerText, `${where}: trigger text`).toBe(
            w >= CONTAINER_SM ? USER : INITIALS,
          );
          expect(block.contentPadding, `${where}: room around the content`).toBe(
            w >= CONTAINER_LG ? PADDING_LG : w >= CONTAINER_SM ? PADDING_SM : PADDING_BASE,
          );

          expect(block.alert, `${where}: error announced`).toBe(state === "error");
          expect(block.placeholders, `${where}: placeholders`).toBe(state === "loading" ? 3 : 0);
          expect(block.empty, `${where}: empty message`).toEqual(state === "empty" ? EMPTY : []);
          expect(block.stats, `${where}: the page`).toEqual(
            ["empty", "loading", "error"].includes(state) ? [] : STATS,
          );

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

    test("opens the navigation in a left Drawer on a narrow container", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "narrow");
      const block = page.locator(`[data-demo-state="narrow"] ${BLOCK}`);
      const menu = block.getByRole("button", { name: "Menu", exact: true });

      await menu.click();
      const drawer = page.getByRole("dialog", { name: BRAND });
      await expect(drawer).toBeVisible();
      const content = page.locator('[data-scope="drawer"][data-part="content"]');
      await expect(content).toHaveAttribute("data-placement", "left");
      expect(await content.evaluate((el) => el.getBoundingClientRect().left)).toBe(0);
      const links = drawer.getByRole("navigation", { name: "Main" }).getByRole("link");
      await expect(links).toHaveText(LINKS);
      await expect(drawer.getByRole("link", { name: "Overview" })).toHaveAttribute(
        "aria-current",
        "page",
      );

      // A link in the Drawer takes the user to the page and closes it.
      await drawer.getByRole("link", { name: "Transactions" }).click();
      await expect(drawer).toBeHidden();
      await expect(page).toHaveURL(/#app-shell-transactions$/);

      // Escape closes it too, and hands focus back to "Menu".
      await menu.click();
      await expect(drawer).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(drawer).toBeHidden();
      await expect(menu).toBeFocused();
    });

    test("opens the account Menu from the top bar", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      const trigger = block.getByRole("button", { name: USER, exact: true });
      await expect(trigger).toHaveAttribute("aria-haspopup", "menu");

      await trigger.click();
      const menu = page.getByRole("menu");
      await expect(menu).toBeVisible();
      await expect(menu).toContainText(USER);
      await expect(menu).toContainText(EMAIL);
      await expect(menu.locator('[data-scope="avatar"][data-part="root"]')).toContainText(INITIALS);
      await expect(menu.getByRole("menuitem")).toHaveText(["Profile", "Settings", "Sign out"]);

      const ratios = await menu.evaluate((el) => {
        const canvas = document.createElement("canvas").getContext("2d", {
          willReadFrequently: true,
        })!;
        const rgb = (color: string) => {
          canvas.clearRect(0, 0, 1, 1);
          canvas.fillStyle = color;
          canvas.fillRect(0, 0, 1, 1);
          return [...canvas.getImageData(0, 0, 1, 1).data].slice(0, 3);
        };
        const lum = (color: string) => {
          const [r, g, b] = rgb(color).map((v) => {
            const c = v / 255;
            return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
          });
          return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
        };
        const surface = getComputedStyle(el).backgroundColor;
        const ratio = (node: Element) => {
          const [a, b] = [lum(getComputedStyle(node).color), lum(surface)];
          return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        };
        const spans = [...el.querySelectorAll(":scope > div span")];
        return {
          name: ratio(spans.find((s) => s.textContent === "Ada Lovelace")!),
          email: ratio(spans.find((s) => s.textContent?.includes("@"))!),
          item: ratio(el.querySelector('[role="menuitem"]')!),
        };
      });
      for (const [what, ratio] of Object.entries(ratios)) {
        expect(ratio, `${scheme}: menu ${what} contrast`).toBeGreaterThanOrEqual(4.5);
      }

      await page.keyboard.press("Escape");
      await expect(menu).toBeHidden();
      await expect(trigger).toBeFocused();
    });

    test("clears AA contrast on every text it paints", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      const ratios = {
        ...(await contrastRatios(page, "default")),
        ...(await contrastRatios(page, "empty")),
        ...(await contrastRatios(page, "error")),
      };
      for (const label of [
        "default heading",
        "default brand",
        "default link",
        "default current link",
        "default account trigger",
        "empty empty title",
        "empty empty message",
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
        ["default", "link", "Invoices"],
        ["default", "button", USER],
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

        // It fills on hover.
        const fill = () => control.evaluate((el) => getComputedStyle(el).backgroundColor);
        await control.blur();
        await page.mouse.move(0, 0);
        const resting = await fill();
        await control.hover();
        await expect.poll(fill, { message: `${scheme}: ${name} hover` }).not.toBe(resting);
      }

      // Tab moves from one link to the next.
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      await showState(page, "default");
      await block.getByRole("link", { name: "Overview" }).focus();
      await page.keyboard.press("Tab");
      await expect(block.getByRole("link", { name: "Transactions" })).toBeFocused();
    });

    test("keeps a disabled link out of reach", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "disabled");
      const block = page.locator(`[data-demo-state="disabled"] ${BLOCK}`);
      const link = block.locator("nav a", { hasText: "Reports" });
      await expect(link).toHaveAttribute("aria-disabled", "true");
      await link.evaluate((el) => (el as HTMLElement).focus());
      await expect(link).not.toBeFocused();

      // Tab skips it: from Customers straight to Settings.
      await block.getByRole("link", { name: "Customers" }).focus();
      await page.keyboard.press("Tab");
      await expect(block.getByRole("link", { name: "Settings" })).toBeFocused();
    });

    test("announces the loading page once and the failed load as an alert", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const region = page.locator(`[data-demo-state="loading"] ${BLOCK} [role="status"]`);
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region).toContainText("Loading this page");

      await showState(page, "error");
      const alert = page.locator(`[data-demo-state="error"] ${BLOCK} [role="alert"]`);
      await expect(alert).toContainText(ERROR);
      await expect(alert.getByRole("button", { name: "Try again" })).toBeVisible();
    });

    test("puts the page heading and the navigation in the outline", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      await expect(block.getByRole("heading", { level: 1 })).toHaveText(HEADING);
      await expect(block.getByRole("navigation", { name: "Main" })).toHaveCount(1);
      await expect(block.getByRole("main")).toHaveCount(1);
    });

    test("treats an empty error string as no error", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "error");
      const block = page.locator(`[data-demo-state="error"] ${BLOCK}`);

      // The demo's retry clears its message to "", the way a consumer holding
      // the error as a string does once the load succeeds.
      await block.getByRole("button", { name: "Try again" }).click();

      await expect(block.locator('[data-scope="alert"]')).toHaveCount(0);
      await expect(block.locator('main [data-scope="card"][data-part="root"]')).toHaveCount(
        STATS.length,
      );
    });
  });
}
