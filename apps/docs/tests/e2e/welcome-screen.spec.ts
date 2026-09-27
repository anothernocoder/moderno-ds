/**
 * The welcome screen, checked on the built docs page at the three widths of the
 * responsive policy (375 / 768 / 1280) in both colour schemes. It asserts text
 * and computed styles; no screenshot baseline is committed.
 *
 * Four claims:
 *
 * 1. **Container, not viewport.** The masthead lines up at `--container-sm` and
 *    the footer at `--container-md`, read off the frame the screen is mounted
 *    in: the Phone tab stacks both at every viewport, the Tablet and Desktop
 *    tabs line both up.
 * 2. **Every state renders what it claims**: the greeting, Continue and Skip by
 *    default; the name in the title; placeholders in a busy region while
 *    loading; an alert with a retry in place of the buttons on error. The
 *    screen fills its window and its hero sits in the middle of it.
 * 3. **AA contrast** on every text the screen paints, in each site theme
 *    (Moderno, Neutro, Contrast) and each scheme.
 * 4. **Try again** clears the error the way a consumer holding it as a string
 *    does, and the buttons come back.
 */
import { expect, test, type Page } from "@playwright/test";

/** The contract's two container steps the screen reads, in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/welcome/";

const SCREEN = "div.moderno-screen-welcome";

/** The site themes the header switches, by their `data-brand` on <html> (null: Neutro). */
const THEMES = [
  { name: "Moderno", brand: "moderno" },
  { name: "Neutro", brand: null },
  { name: "Contrast", brand: "contrast" },
] as const;

const TITLE = "Welcome to Moderno";
const ACTIONS = ["Continue", "Skip for now"];
const ERROR = "We could not prepare your workspace.";

/**
 * Every copy of the screen the page mounts (islands/WelcomeScreenDemo.svelte):
 * the main preview's three width tabs, then one Examples preview per state at
 * the tablet width. Each is found by its `data-demo-state`.
 */
const TABS = ["phone", "tablet", "desktop", "named", "loading", "error"] as const;
type Tab = (typeof TABS)[number];

const WIDTH_TABS: readonly Tab[] = ["phone", "tablet", "desktop"];

interface ScreenMetrics {
  /** Width of the screen's own `@container` root — what its steps read. */
  containerWidth: number;
  /** Height of the root, and of the window it was mounted in. */
  rootHeight: number;
  frameHeight: number;
  mastheadDisplay: string;
  footerDisplay: string;
  /** Every heading's rank, in document order. */
  headingLevels: number[];
  title: string | null;
  /** Button labels, in order, including a retry inside an alert. */
  buttons: string[];
  placeholders: number;
  alert: boolean;
  /** Offsets between the hero's content and the middle of the region it sits in, in px. */
  offCentreX: number;
  offCentreY: number;
}

async function hydrated(page: Page): Promise<void> {
  await page.locator(".preview-panel--demo").first().scrollIntoViewIfNeeded();
  await page
    .locator(".preview-panel--demo astro-island:not([ssr])")
    .first()
    .waitFor({ state: "attached" });
}

/** Brings up one entry of `TABS` and waits for its copy to mount. */
async function showTab(page: Page, tab: Tab): Promise<void> {
  if (WIDTH_TABS.includes(tab)) {
    await page.locator(`[data-demo-tab="${tab}"]`).click();
  } else {
    await page.locator(`[data-demo-state="${tab}"]`).scrollIntoViewIfNeeded();
    await page
      .locator(`astro-island:not([ssr]):has([data-demo-state="${tab}"])`)
      .waitFor({ state: "attached" });
  }
  await page.locator(`[data-demo-state="${tab}"] ${SCREEN}`).waitFor({ state: "attached" });
}

async function screenMetrics(page: Page, tab: Tab): Promise<ScreenMetrics[]> {
  return page.evaluate(
    ({ tab, selector }) => {
      const panel = document.querySelector(`[data-demo-state="${tab}"]`);
      if (!panel) throw new Error(`no ${tab} stage on the page`);
      return [...panel.querySelectorAll<HTMLElement>(selector)].map((root) => {
        const masthead = root.querySelector("header");
        const footer = root.querySelector("footer");
        const middle = masthead?.nextElementSibling as HTMLElement | null;
        const hero = middle?.querySelector("section.moderno-block-hero");
        const content = hero?.firstElementChild as HTMLElement | null;
        if (!masthead || !footer || !middle || !content) {
          throw new Error("the welcome screen did not render its own markup");
        }
        const region = middle.getBoundingClientRect();
        const box = content.getBoundingClientRect();
        return {
          // Layout size, not the painted box: the docs scale the device to fit,
          // and that transform never changes what the container reads.
          containerWidth: root.offsetWidth,
          rootHeight: root.offsetHeight,
          frameHeight: (root.parentElement as HTMLElement).clientHeight,
          mastheadDisplay: getComputedStyle(masthead).display,
          footerDisplay: getComputedStyle(footer).display,
          headingLevels: [...root.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((h) =>
            Number(h.getAttribute("aria-level") ?? h.tagName.slice(1)),
          ),
          title: root.querySelector("h1")?.textContent?.trim() ?? null,
          buttons: [...root.querySelectorAll('[data-scope="button"]')].map(
            (b) => b.textContent?.trim() ?? "",
          ),
          placeholders:
            root
              .querySelector('[role="status"][aria-busy="true"]')
              ?.querySelectorAll('[data-scope="skeleton"]').length ?? 0,
          alert: root.querySelector('[data-scope="alert"][role="alert"]') !== null,
          offCentreX: Math.abs(box.left + box.width / 2 - (region.left + region.width / 2)),
          offCentreY: Math.abs(box.top + box.height / 2 - (region.top + region.height / 2)),
        };
      });
    },
    { tab, selector: SCREEN },
  );
}

/**
 * Contrast ratios of every text the screen paints in `tab`'s copy. Colours are
 * resolved through a canvas: the contract's values are OKLCH, and the browser
 * is the only thing that converts them exactly the way it painted them.
 */
async function textRatios(page: Page, tab: Tab): Promise<Record<string, number>> {
  return page.evaluate(
    ({ tab, selector }) => {
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

      const root = document.querySelector(`[data-demo-state="${tab}"] ${selector}`);
      if (!root) throw new Error(`the ${tab} copy did not render`);

      const against = (el: Element) => ratio(getComputedStyle(el).color, surfaceOf(el));
      const parts: Array<[string, string]> = [
        ["wordmark", "header > a"],
        ["support line", "header p"],
        ["support link", "header p a"],
        ["kicker", '[data-scope="badge"]'],
        ["title", "h1"],
        ["subtitle", "h1 + p"],
        ["alert title", '[data-scope="alert"] [data-part="title"]'],
        ["alert description", '[data-scope="alert"] [data-part="description"]'],
        ["copyright", "footer p"],
        ["legal link", "footer nav a"],
      ];

      const ratios: Record<string, number> = {};
      for (const [name, part] of parts) {
        const el = root.querySelector(part);
        if (el) ratios[`${tab} ${name}`] = against(el);
      }
      for (const button of root.querySelectorAll('[data-scope="button"]')) {
        ratios[`${tab} ${button.textContent?.trim() ?? "button"} button`] = against(button);
      }
      return ratios;
    },
    { tab, selector: SCREEN },
  );
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`welcome — ${scheme}`, () => {
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

        const widths: number[] = [];
        for (const tab of TABS) {
          await showTab(page, tab);
          const mounted = await screenMetrics(page, tab);
          expect(mounted, `${scheme} ${width}px, ${tab}: mounted copies`).toHaveLength(1);
          const screen = mounted[0]!;
          widths.push(screen.containerWidth);
          const where = `${scheme} ${width}px, ${tab} (${screen.containerWidth}px)`;

          expect(screen.mastheadDisplay, `${where}: masthead`).toBe(
            screen.containerWidth >= CONTAINER_SM ? "flex" : "grid",
          );
          expect(screen.footerDisplay, `${where}: footer`).toBe(
            screen.containerWidth >= CONTAINER_MD ? "flex" : "grid",
          );
          expect(screen.rootHeight, `${where}: fills its window`).toBeGreaterThanOrEqual(
            screen.frameHeight,
          );
          expect(screen.offCentreX, `${where}: hero centred across`).toBeLessThan(1);
          expect(screen.offCentreY, `${where}: hero centred down`).toBeLessThan(1);
          expect(screen.alert, `${where}: error announced`).toBe(tab === "error");

          if (tab === "loading") {
            expect(screen.title, `${where}: no title while loading`).toBeNull();
            expect(screen.placeholders, `${where}: placeholders`).toBeGreaterThan(0);
            expect(screen.buttons, `${where}: no buttons while loading`).toEqual([]);
            continue;
          }

          // A screen is the whole route: its first heading is the page's h1.
          expect(screen.headingLevels, `${where}: headings`).toEqual([1]);
          if (tab === "named") {
            expect(screen.title, `${where}: greets by name`).toBe("Welcome, Ana");
            expect(screen.buttons, `${where}: buttons`).toEqual(ACTIONS);
          } else if (tab === "error") {
            expect(screen.title, `${where}: title stays`).toBe(TITLE);
            expect(screen.buttons, `${where}: retry only`).toEqual(["Try again"]);
          } else {
            expect(screen.title, `${where}: title`).toBe(TITLE);
            expect(screen.buttons, `${where}: buttons`).toEqual(ACTIONS);
          }
        }

        expect(
          widths.some((w) => w < CONTAINER_SM),
          `${scheme} ${width}px: a copy below @sm`,
        ).toBe(true);
        expect(
          widths.some((w) => w >= CONTAINER_MD),
          `${scheme} ${width}px: a copy at or above @md`,
        ).toBe(true);
      });
    }

    for (const theme of THEMES) {
      test(`clears AA contrast on every text it paints in ${theme.name}`, async ({ page }) => {
        await page.goto(PAGE, { waitUntil: "networkidle" });
        await page.evaluate((brand) => {
          if (brand) document.documentElement.setAttribute("data-brand", brand);
          else document.documentElement.removeAttribute("data-brand");
        }, theme.brand);
        await hydrated(page);

        const ratios: Record<string, number> = {};
        for (const tab of ["desktop", "error"] as const) {
          await showTab(page, tab);
          Object.assign(ratios, await textRatios(page, tab));
        }

        for (const label of [
          "wordmark",
          "support line",
          "support link",
          "kicker",
          "title",
          "subtitle",
          "copyright",
          "legal link",
          ...ACTIONS.map((action) => `${action} button`),
        ]) {
          expect(Object.keys(ratios), `${theme.name} ${scheme}: ${label}`).toContain(
            `desktop ${label}`,
          );
        }
        for (const label of ["alert title", "alert description", "Try again button"]) {
          expect(Object.keys(ratios), `${theme.name} ${scheme}: ${label}`).toContain(
            `error ${label}`,
          );
        }
        for (const [what, ratio] of Object.entries(ratios)) {
          expect(ratio, `${theme.name} ${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
        }
      });
    }

    test("Try again clears the error and brings the buttons back", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showTab(page, "error");
      const screen = page.locator(`[data-demo-state="error"] ${SCREEN}`);
      await expect(screen.locator('[role="alert"]')).toContainText(ERROR);

      await screen.getByRole("button", { name: "Try again" }).click();

      await expect(screen.locator('[data-scope="alert"]')).toHaveCount(0);
      await expect(screen.locator('[data-scope="button"]')).toHaveText(ACTIONS);
    });
  });
}
