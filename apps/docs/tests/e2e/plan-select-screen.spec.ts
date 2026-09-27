/**
 * The plan-select screen, checked on the built docs page at the three widths of
 * the responsive policy (375 / 768 / 1280), in both colour schemes and in the
 * three site themes.
 *
 * 1. **Container, not viewport.** The masthead lines up at `--container-sm`
 *    and the footer at `--container-md`, read off the frame the screen was
 *    mounted in. The pricing block inside reads its own container: its plans
 *    stack in the phone frame and sit side by side in the wider two.
 * 2. **A screen owns the viewport as a height.** Its root fills the frame the
 *    demo gives it as a window.
 * 3. **One outline.** The pricing title is the page's `h1` and nothing after it
 *    skips a rank, in every state.
 * 4. **AA contrast** on every text the screen paints — its own chrome and the
 *    plans, the empty message and the error — in Moderno, Neutro and Contrast,
 *    light and dark.
 */
import { expect, test, type Page } from "@playwright/test";

/** The contract's two container steps the screen reads, in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/plan-select/";
const SCREEN = "div.moderno-screen-plan-select";

/** The site themes (`apps/docs/src/lib/siteThemes.ts`): the `data-brand` each sets, none for Neutro. */
const THEMES = [
  { id: "moderno", brand: "moderno" },
  { id: "neutral", brand: undefined },
  { id: "contrast", brand: "contrast" },
] as const;
const SITE_THEME_STORAGE_KEY = "moderno-site-theme";

/**
 * Every copy of the screen the page mounts (islands/PlanSelectScreenDemo.svelte):
 * the main preview's three width tabs, then one Examples preview per state.
 */
const TABS = ["phone", "tablet", "desktop", "loading", "error", "empty"] as const;
type Tab = (typeof TABS)[number];
const WIDTH_TABS: readonly Tab[] = ["phone", "tablet", "desktop"];

interface ScreenMetrics {
  containerWidth: number;
  rootHeight: number;
  frameHeight: number;
  mastheadDisplay: string;
  footerDisplay: string;
  /** `grid-auto-flow` of the plan list — `column` once the block sits the plans side by side. */
  plansFlow: string | null;
  /** Every heading's effective rank, in document order (`aria-level` wins). */
  headingLevels: number[];
}

async function hydrated(page: Page): Promise<void> {
  await page.locator(".preview-panel--demo").first().scrollIntoViewIfNeeded();
  await page
    .locator(".preview-panel--demo astro-island:not([ssr])")
    .first()
    .waitFor({ state: "attached" });
}

/** Brings up one width tab or one state's preview and waits for its copy to mount. */
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
      return [...panel.querySelectorAll(selector)].map((root) => {
        const masthead = root.querySelector("header");
        const footer = root.querySelector("footer");
        if (!masthead || !footer) throw new Error("the screen did not render its own markup");
        const plans = root.querySelector(".moderno-block-pricing ul");
        return {
          // Layout size, not the painted box: the docs scale the device to fit.
          containerWidth: (root as HTMLElement).offsetWidth,
          rootHeight: (root as HTMLElement).offsetHeight,
          frameHeight: (root.parentElement as HTMLElement).clientHeight,
          mastheadDisplay: getComputedStyle(masthead).display,
          footerDisplay: getComputedStyle(footer).display,
          plansFlow: plans ? getComputedStyle(plans).gridAutoFlow : null,
          headingLevels: [...root.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((h) =>
            Number(h.getAttribute("aria-level") ?? h.tagName.slice(1)),
          ),
        };
      });
    },
    { tab, selector: SCREEN },
  );
}

/**
 * Contrast of every text the copy under `tab` paints, keyed `<tab> <what>`.
 * Colours are resolved through a canvas: the contract's values are OKLCH, and
 * the browser is the only thing that converts them the way it painted them.
 */
async function textRatios(page: Page, tab: Tab): Promise<Record<string, number>> {
  await showTab(page, tab);
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
      const block = root.querySelector(".moderno-block-pricing");
      if (!block) throw new Error(`the ${tab} copy has no pricing block`);

      const card = block.querySelector('ul [data-scope="card"]');
      const highlighted = [...block.querySelectorAll('ul [data-scope="card"]')].find(
        (el) => el.querySelector('[data-scope="badge"]') !== null,
      );
      const parts: Array<[string, Element | null | undefined]> = [
        ["wordmark", root.querySelector("header > a")],
        ["sales line", root.querySelector("header p")],
        ["sales link", root.querySelector("header p a")],
        ["copyright", root.querySelector("footer p")],
        ["legal link", root.querySelector("footer nav a")],
        ["title", block.querySelector("h2")],
        ["description", block.querySelector("h2 + p")],
        ["plan name", card?.querySelector('[data-part="title"]')],
        ["plan description", card?.querySelector('[data-part="description"]')],
        ["price", card?.querySelector('[data-part="content"] > p > span')],
        ["period", card?.querySelector('[data-part="content"] > p > span + span')],
        ["feature", card?.querySelector('[data-part="content"] ul > li')],
        ["outline button", card?.querySelector("button")],
        ["badge", highlighted?.querySelector('[data-scope="badge"]')],
        ["primary button", highlighted?.querySelector("button")],
        [
          "no-plans title",
          block.querySelector(':scope > div > [data-scope="card"] [data-part="title"]'),
        ],
        [
          "no-plans description",
          block.querySelector(':scope > div > [data-scope="card"] [data-part="description"]'),
        ],
        ["alert title", block.querySelector('[data-scope="alert"] [data-part="title"]')],
        [
          "alert description",
          block.querySelector('[data-scope="alert"] [data-part="description"]'),
        ],
        ["retry button", block.querySelector('[data-scope="alert"] button')],
      ];

      const ratios: Record<string, number> = {};
      for (const [what, el] of parts) {
        if (el) ratios[`${tab} ${what}`] = ratio(getComputedStyle(el).color, surfaceOf(el));
      }
      return ratios;
    },
    { tab, selector: SCREEN },
  );
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`plan-select — ${scheme}`, () => {
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
          `${width}px: a copy below @sm`,
        ).toBe(true);
        expect(
          widths.some((w) => w >= CONTAINER_MD),
          `${width}px: a copy at or above @md`,
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

          // The plans are only drawn by the width tabs; the block reads its own
          // container, which is the screen's width less its padding.
          if (WIDTH_TABS.includes(tab)) {
            expect(screen.plansFlow, `${where}: plans`).toBe(
              screen.containerWidth >= CONTAINER_MD + 48 ? "column" : "row",
            );
          } else {
            expect(screen.plansFlow, `${where}: no plan list`).toBeNull();
          }

          expect(screen.headingLevels[0], `${where}: first heading`).toBe(1);
          expect(
            screen.headingLevels.filter((level) => level === 1),
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

        // The phone frame stacks the plans; the tablet frame sets them side by side.
        expect(screens[0]!.plansFlow, `${width}px: phone plans`).toBe("row");
        expect(screens[1]!.plansFlow, `${width}px: tablet plans`).toBe("column");
      });
    }

    for (const theme of THEMES) {
      test(`clears AA contrast on every text it paints in ${theme.id}`, async ({ page }) => {
        await page.addInitScript(
          ([key, id]) => localStorage.setItem(key!, id!),
          [SITE_THEME_STORAGE_KEY, theme.id],
        );
        await page.goto(PAGE, { waitUntil: "networkidle" });
        await hydrated(page);
        expect(
          await page.evaluate(() => document.documentElement.dataset.brand),
          `${theme.id}: data-brand`,
        ).toBe(theme.brand);

        const ratios = {
          ...(await textRatios(page, "phone")),
          ...(await textRatios(page, "empty")),
          ...(await textRatios(page, "error")),
        };
        for (const label of [
          "phone wordmark",
          "phone sales line",
          "phone sales link",
          "phone copyright",
          "phone legal link",
          "phone title",
          "phone description",
          "phone plan name",
          "phone plan description",
          "phone price",
          "phone period",
          "phone feature",
          "phone outline button",
          "phone badge",
          "phone primary button",
          "empty title",
          "empty no-plans title",
          "empty no-plans description",
          "error alert title",
          "error alert description",
          "error retry button",
        ]) {
          expect(Object.keys(ratios), `${theme.id} ${scheme}: ${label} measured`).toContain(label);
        }
        for (const [what, ratio] of Object.entries(ratios)) {
          expect(ratio, `${theme.id} ${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
        }
      });
    }
  });
}
