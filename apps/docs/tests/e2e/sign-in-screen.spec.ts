/**
 * The sign-in screen, checked where it is actually shown to a reader: the built
 * docs page, at the three widths of the responsive policy (375 / 768 / 1280) in
 * both colour schemes.
 *
 * This is the seam that replaces a screenshot baseline for this screen. The
 * pixel baselines were dropped from this repo (see `playwright.config.ts`)
 * because almost every PR invalidated them; what those PNGs were actually
 * guarding — "does the layout step fire at the right width, and is the text
 * still legible in both schemes?" — is a computed-style fact, and asking the
 * browser for it directly is both cheaper and more precise than diffing images.
 *
 * Three claims, per width and per scheme:
 *
 * 1. **Container, not viewport.** Both of the screen's steps are read off the
 *    width of the frame it was mounted in, never the window: the masthead lines
 *    up at `--container-sm` and the footer at `--container-md`. The demo's
 *    Phone, Tablet and Desktop tabs mount the same file in a phone-, a tablet- and a desktop-width frame, so at every viewport the phone copy stacks and
 *    the other two do not — which is the whole of ADR-0005. Each tab mounts one
 *    copy, and every state is reached by selecting its tab.
 * 2. **A screen owns the viewport as a height.** Its root fills the window it is
 *    given, top to bottom. On this page each frame *is* that window — the demo
 *    overrides `min-h-dvh` to the frame's height so a browser window's worth of
 *    screen does not bury the page — so what is asserted here is that the
 *    screen fills whatever it was told the window is. That the shipped file says
 *    `min-h-dvh` is held by `tooling/cli/test/screens-install.test.ts`, against
 *    the bytes the CLI writes.
 * 3. **AA contrast** on every text the screen paints itself — the wordmark, the
 *    support line and its link, the copyright, the legal links — in light and
 *    in dark.
 */
import { expect, test, type Page } from "@playwright/test";

/** The contract's two container steps the screen reads, in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/sign-in/";

/**
 * Every copy of the screen the page mounts (islands/SignInScreenDemo.svelte), in
 * order: the main preview's three width tabs — a frame below the screen's first
 * step and two above its second — then the states, each in its own Examples
 * preview at the tablet width. Each is one mounted copy, found by its
 * `data-demo-state`.
 */
const TABS = ["phone", "tablet", "desktop", "error", "loading"] as const;
type Tab = (typeof TABS)[number];

/** The tabs of the main preview; every other entry is a state's own preview. */
const WIDTH_TABS: readonly Tab[] = ["phone", "tablet", "desktop"];

interface ScreenMetrics {
  /** Width of the screen's own `@container` root — what its steps read. */
  containerWidth: number;
  /** Height of the root against the frame it was mounted in — it fills it. */
  rootHeight: number;
  /** Content height of that frame, i.e. what the screen treats as its window. */
  frameHeight: number;
  /** `display` of the masthead: stacked below `@sm`, one row at or above it. */
  mastheadDisplay: string;
  /** `display` of the footer: stacked below `@md`, one row at or above it. */
  footerDisplay: string;
  /** Every heading's *effective* rank, in document order (`aria-level` wins). */
  headingLevels: number[];
}

/** Every copy of the screen under `tab`'s stage — one, when the demo is right. */
async function screenMetrics(page: Page, tab: Tab): Promise<ScreenMetrics[]> {
  return page.evaluate((state) => {
    const panel = document.querySelector(`[data-demo-state="${state}"]`);
    if (!panel) throw new Error(`no ${state} stage on the page`);
    return [...panel.querySelectorAll("div.moderno-screen-sign-in")].map((root) => {
      const masthead = root.querySelector("header");
      const footer = root.querySelector("footer");
      if (!masthead || !footer) {
        throw new Error("the sign-in screen did not render its own markup");
      }
      return {
        containerWidth: root.getBoundingClientRect().width,
        rootHeight: root.getBoundingClientRect().height,
        frameHeight: (root.parentElement as HTMLElement).clientHeight,
        mastheadDisplay: getComputedStyle(masthead).display,
        footerDisplay: getComputedStyle(footer).display,
        headingLevels: [...root.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((h) =>
          Number(h.getAttribute("aria-level") ?? h.tagName.slice(1)),
        ),
      };
    });
  }, tab);
}

/**
 * Scrolls the preview into view and waits for it to hydrate.
 *
 * The demo mounts `client:visible`, and its tabs are only live once it has: at
 * 375px the preview panel starts below the fold, and a click on a tab that has
 * not hydrated yet selects nothing.
 */
async function hydrated(page: Page): Promise<void> {
  await page.locator(".preview-panel--demo").first().scrollIntoViewIfNeeded();
  await page
    .locator(".preview-panel--demo astro-island:not([ssr])")
    .first()
    .waitFor({ state: "attached" });
}

/** Brings up one entry of `TABS` — a width tab or a state's preview — and waits for its copy to mount. */
async function showTab(page: Page, tab: Tab): Promise<void> {
  if (WIDTH_TABS.includes(tab)) {
    await page.locator(`[data-demo-tab="${tab}"]`).click();
  } else {
    // A state is its own Examples preview: bring it on screen so its
    // `client:visible` island hydrates, the way a reader scrolling would.
    await page.locator(`[data-demo-state="${tab}"]`).scrollIntoViewIfNeeded();
    await page
      .locator(`astro-island:not([ssr]):has([data-demo-state="${tab}"])`)
      .waitFor({ state: "attached" });
  }
  await page
    .locator(`[data-demo-state="${tab}"] div.moderno-screen-sign-in`)
    .waitFor({ state: "attached" });
}

/**
 * Contrast ratios read off the rendered page.
 *
 * Colours are resolved through a canvas rather than parsed: the contract's
 * values are OKLCH, `getComputedStyle` hands them back in whatever space they
 * were authored in, and the browser is the only thing that converts them
 * exactly the way it painted them.
 */
async function contrastRatios(page: Page): Promise<Record<string, number>> {
  return page.evaluate(() => {
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
        const [, , , alpha] = toRgba(getComputedStyle(node).backgroundColor);
        if (alpha > 0) return getComputedStyle(node).backgroundColor;
        node = node.parentElement;
      }
      return getComputedStyle(document.body).backgroundColor;
    }

    const panel = document.querySelector(".preview-panel--demo [data-demo-state]");
    if (!panel) throw new Error("no demo tab panel on the page");
    const root = panel.querySelector("div.moderno-screen-sign-in");
    if (!root) throw new Error("the sign-in screen did not render");

    const pick = <T extends Element>(selector: string): T => {
      const el = root.querySelector<T>(selector);
      if (!el) throw new Error(`missing ${selector}`);
      return el;
    };

    const against = (el: Element) => ratio(getComputedStyle(el).color, surfaceOf(el));

    return {
      wordmark: against(pick("header a")),
      supportLine: against(pick("header p")),
      supportLink: against(pick("header p a")),
      copyright: against(pick("footer p")),
      legalLink: against(pick("footer nav a")),
    };
  });
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`sign-in — ${scheme}`, () => {
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

        // One tab, one mounted copy: walk the tabs in order, so `screens[i]` is
        // the copy `TABS[i]` mounted.
        const screens: ScreenMetrics[] = [];
        for (const tab of TABS) {
          await showTab(page, tab);
          const mounted = await screenMetrics(page, tab);
          expect(mounted, `${scheme} ${width}px, ${tab}: mounted copies`).toHaveLength(1);
          screens.push(mounted[0]!);
        }

        // The three frame widths are fixed by the demo, so at every viewport its
        // width tabs hold a copy below `@sm` and copies at or above `@md`.
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
          const where = `${scheme} ${width}px, ${TABS[index]} (${screen.containerWidth}px)`;
          expect(screen.mastheadDisplay, `${where}: masthead`).toBe(
            screen.containerWidth >= CONTAINER_SM ? "flex" : "grid",
          );
          expect(screen.footerDisplay, `${where}: footer`).toBe(
            screen.containerWidth >= CONTAINER_MD ? "flex" : "grid",
          );
          // Full-viewport is a height: the screen fills the window it is given.
          // On this page each frame stands in for that window (the demo says so
          // and overrides `min-h-dvh` to the frame's own height); what is being
          // held here is that the screen still fills it, top to bottom.
          expect(screen.rootHeight, `${where}: root height`).toBeGreaterThanOrEqual(
            screen.frameHeight,
          );
          // A screen is the whole route, so it has a top-level heading and the
          // headings under it descend one rank at a time. The card's title is
          // that `h1` (it is what the page is *called*), which is why the block
          // takes `titleLevel` rather than the screen printing a second one.
          expect(screen.headingLevels[0], `${where}: first heading`).toBe(1);
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

    test("clears AA contrast on every text it paints", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      const ratios = await contrastRatios(page);
      for (const [what, ratio] of Object.entries(ratios)) {
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
      }
    });
  });
}
