/**
 * The footer block, checked on the built docs page at the three widths of the
 * responsive policy (375 / 768 / 1280) in both colour schemes. It asserts text
 * and computed styles; no screenshot baseline is committed.
 *
 * Four claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` the links sit in two
 *    columns and the bottom row stacks; at `--container-sm` in three columns;
 *    at `--container-md` the bottom row sits on one line; at `--container-lg`
 *    the brand sits beside the columns, with more room above and below. Each
 *    copy on the page is measured against its own container width, so the
 *    narrow frame stays stacked at 1280 while the wide frame has crossed every
 *    step.
 * 2. **Every state renders what it claims**, at every width: the brand, its
 *    action, three link columns and the bottom row (copyright, legal and
 *    social links) by default; no columns when they are empty; placeholders in
 *    a busy region while loading; an error Alert with a retry in place of the
 *    columns; inert buttons when disabled. The bottom row stays in every
 *    state. Every copy is centred in its box.
 * 3. **AA contrast** in both schemes on every text the block paints, and 3:1 on
 *    each social mark.
 * 4. **Hover and focus-visible** on the action, a column link and a social link.
 *
 * It also checks that an empty `error` string counts as no error: the columns
 * come back, with no alert.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/footer/";

const BLOCK = "footer.moderno-block-footer";

/** The copy the block ships with. */
const BRAND = "Northwind";
const COLUMNS = ["Product", "Company", "Resources"];
const LINKS_PER_COLUMN = 4;
const LEGAL = ["Privacy", "Terms", "Cookies"];
const SOCIAL = [
  "Northwind on GitHub",
  "Northwind on X",
  "Northwind on LinkedIn",
  "Northwind on YouTube",
];
const COPYRIGHT = "© 2026 Northwind Labs, Inc. All rights reserved.";
const ACTION = "Contact us";
const ERROR = "We could not load the site links.";

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** The brand's text. */
  brand: string | null;
  /** Whether the brand is set in the contract's `--font-serif`. */
  serifBrand: boolean;
  /** The column headings inside the footer navigation, in order. */
  columns: string[];
  /** The links inside the footer navigation. */
  columnLinks: number;
  /** Tracks of the link grid, or of the placeholders while loading. */
  linkTracks: number | null;
  /** Tracks of the top row (brand and columns). */
  topTracks: number;
  /** The bottom row's display: `grid` while stacked, `flex` on one line. */
  bottomDisplay: string;
  /** The copyright line. */
  copyright: string | null;
  /** The legal links, in order. */
  legal: string[];
  /** The social links' accessible names, in order. */
  social: string[];
  /** Social links that carry an aria-hidden mark. */
  marks: number;
  /** Whether a Divider separates the columns from the bottom row. */
  divider: boolean;
  /** The block's padding above its content, in px. */
  paddingTop: number;
  /** The button labels, in order, including the retry inside an error. */
  actions: string[];
  /** The `data-variant` of every button, in order. */
  actionVariants: string[];
  /** Whether every button in this copy is disabled. */
  allActionsInert: boolean;
  /** Skeleton placeholders inside a busy status region. */
  placeholders: number;
  /** Whether an error Alert is announced. */
  alert: boolean;
}

/**
 * The page's previews (islands/FooterBlockDemo.svelte): the main preview mounts
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

async function showState(page: Page, state: State): Promise<void> {
  const block = page.locator(`[data-demo-state="${state}"] ${BLOCK}`);
  await block.scrollIntoViewIfNeeded();
  await block.waitFor({ state: "visible" });
}

async function blockMetrics(page: Page, state: State): Promise<BlockMetrics[]> {
  return page.evaluate(
    ({ state, selector }) => {
      const wrapper = document.querySelector(`[data-demo-state="${state}"]`);
      if (!wrapper) throw new Error(`no preview for the ${state} state on the page`);
      const normalise = (family: string) => family.replace(/["'\s]/g, "");
      const serif = normalise(
        getComputedStyle(document.documentElement).getPropertyValue("--font-serif"),
      );
      const tracks = (el: Element) =>
        getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean).length;

      return [...wrapper.querySelectorAll<HTMLElement>(selector)].map((footer) => {
        const body = footer.firstElementChild as HTMLElement | null;
        const top = body?.firstElementChild as HTMLElement | null;
        const bottom = body?.lastElementChild as HTMLElement | null;
        if (!body || !top || !bottom)
          throw new Error("the footer block did not render its own markup");

        const brand = top.querySelector("p.font-serif");
        const nav = footer.querySelector('nav[aria-label="Footer"]');
        const busy = footer.querySelector('[role="status"][aria-busy="true"]');
        const grid = nav ?? busy;
        const social = [...footer.querySelectorAll('ul[aria-label="Social"] a')];
        const buttons = [...footer.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];

        return {
          containerWidth: footer.offsetWidth,
          brand: brand?.textContent?.trim() ?? null,
          serifBrand: brand ? normalise(getComputedStyle(brand).fontFamily) === serif : false,
          columns: nav ? [...nav.querySelectorAll("h2")].map((h) => h.textContent!.trim()) : [],
          columnLinks: nav ? nav.querySelectorAll("a[href]").length : 0,
          linkTracks: grid ? tracks(grid) : null,
          topTracks: tracks(top),
          bottomDisplay: getComputedStyle(bottom).display,
          copyright: bottom.querySelector("p")?.textContent?.trim() ?? null,
          legal: [...footer.querySelectorAll('nav[aria-label="Legal"] a')].map(
            (a) => a.textContent?.trim() ?? "",
          ),
          social: social.map((a) => a.getAttribute("aria-label") ?? ""),
          marks: social.filter((a) => a.querySelector('svg[aria-hidden="true"] path')).length,
          divider: body.querySelector(':scope > [data-scope="divider"]') !== null,
          paddingTop: parseFloat(getComputedStyle(body).paddingTop),
          actions: buttons.map((b) => b.textContent?.trim() ?? ""),
          actionVariants: buttons.map((b) => b.getAttribute("data-variant") ?? ""),
          allActionsInert: buttons.length > 0 && buttons.every((b) => b.disabled),
          placeholders: busy ? busy.querySelectorAll('[data-scope="skeleton"]').length : 0,
          alert: footer.querySelector('[data-scope="alert"][role="alert"]') !== null,
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
  state: "default" | "error",
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
      const body = block.firstElementChild!;
      const parts: Array<[string, Element | null]> = [
        ["brand", body.querySelector("p.font-serif")],
        ["tagline", body.querySelector("p.font-serif + p")],
        ["copyright", body.lastElementChild!.querySelector("p")],
        ["alert title", block.querySelector('[data-scope="alert"] [data-part="title"]')],
        [
          "alert description",
          block.querySelector('[data-scope="alert"] [data-part="description"]'),
        ],
      ];

      const ratios: Record<string, number> = {};
      for (const [name, el] of parts) {
        if (el) ratios[`${state} ${name}`] = against(el);
      }
      for (const heading of block.querySelectorAll('nav[aria-label="Footer"] h2')) {
        ratios[`${state} ${heading.textContent?.trim()} heading`] = against(heading);
      }
      for (const link of block.querySelectorAll(
        'nav[aria-label="Footer"] a, nav[aria-label="Legal"] a',
      )) {
        ratios[`${state} ${link.textContent?.trim()} link`] = against(link);
      }
      // Non-text contrast (WCAG 1.4.11): each social mark against the page.
      for (const link of block.querySelectorAll('ul[aria-label="Social"] a')) {
        ratios[`${state} ${link.getAttribute("aria-label")} mark`] = against(link);
      }
      for (const button of block.querySelectorAll('[data-scope="button"]')) {
        ratios[`${state} ${button.textContent?.trim() ?? "button"} button`] = against(button);
      }
      return ratios;
    },
    { state, selector: BLOCK },
  );
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`footer — ${scheme}`, () => {
    test.use({ colorScheme: scheme });

    for (const width of WIDTHS) {
      test(`lays itself out from its container at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1200 });
        await page.goto(PAGE, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready.then(() => true));

        expect(await page.evaluate(() => document.documentElement.classList.contains("dark"))).toBe(
          scheme === "dark",
        );

        const blocks: Array<BlockMetrics & { state: State }> = [];
        for (const state of STATES) {
          await showState(page, state);
          const mounted = await blockMetrics(page, state);
          expect(mounted, `${state}: mounted copies`).toHaveLength(1);
          const block = mounted[0]!;
          blocks.push({ ...block, state });
          const where = `${scheme} ${width}px, ${state} (${block.containerWidth}px)`;

          if (block.linkTracks !== null) {
            expect(block.linkTracks, `${where}: link columns`).toBe(
              block.containerWidth >= CONTAINER_SM ? 3 : 2,
            );
          }
          expect(block.topTracks, `${where}: brand beside the columns`).toBe(
            block.containerWidth >= CONTAINER_LG ? 3 : 1,
          );
          expect(block.bottomDisplay, `${where}: bottom row`).toBe(
            block.containerWidth >= CONTAINER_MD ? "flex" : "grid",
          );
          expect(block.paddingTop, `${where}: room above`).toBe(
            block.containerWidth >= CONTAINER_LG ? 64 : 48,
          );
          expect(block.alert, `${where}: error announced`).toBe(state === "error");

          // What every state keeps: the brand and the bottom row under a rule.
          expect(block.brand, `${where}: brand`).toBe(BRAND);
          expect(block.serifBrand, `${where}: serif brand`).toBe(true);
          expect(block.divider, `${where}: rule`).toBe(true);
          expect(block.copyright, `${where}: copyright`).toBe(COPYRIGHT);
          expect(block.legal, `${where}: legal links`).toEqual(LEGAL);
          expect(block.social, `${where}: social links`).toEqual(SOCIAL);
          expect(block.marks, `${where}: one hidden mark per social link`).toBe(SOCIAL.length);

          if (state === "loading") {
            expect(block.placeholders, `${where}: placeholders`).toBe(12);
            expect(block.columns, `${where}: no columns while loading`).toEqual([]);
            expect(block.actions, `${where}: action`).toEqual([ACTION]);
          } else if (state === "empty") {
            expect(block.columns, `${where}: no columns`).toEqual([]);
            expect(block.linkTracks, `${where}: no link grid`).toBeNull();
            expect(block.actions, `${where}: action`).toEqual([ACTION]);
          } else if (state === "error") {
            expect(block.columns, `${where}: no columns`).toEqual([]);
            expect(block.linkTracks, `${where}: no link grid`).toBeNull();
            expect(block.actions, `${where}: action and retry`).toEqual([ACTION, "Try again"]);
            expect(block.actionVariants, `${where}: variants`).toEqual(["outline", "outline"]);
          } else {
            expect(block.columns, `${where}: columns`).toEqual(COLUMNS);
            expect(block.columnLinks, `${where}: column links`).toBe(
              COLUMNS.length * LINKS_PER_COLUMN,
            );
            expect(block.actions, `${where}: action`).toEqual([ACTION]);
            expect(block.actionVariants, `${where}: variant`).toEqual(["outline"]);
          }

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

        expect(
          blocks.filter((block) => block.allActionsInert).map((block) => block.state),
          "the disabled render",
        ).toEqual(["disabled"]);

        // Each step is exercised on both sides at every viewport, so a step that
        // silently stopped firing cannot pass this file.
        const containerWidths = blocks.map((b) => b.containerWidth);
        for (const step of [CONTAINER_SM, CONTAINER_MD, CONTAINER_LG]) {
          expect(
            containerWidths.some((w) => w < step),
            `a copy under ${step}px`,
          ).toBe(true);
          expect(
            containerWidths.some((w) => w >= step),
            `a copy over ${step}px`,
          ).toBe(true);
        }
      });
    }

    test("sits in the middle of its preview", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      for (const state of ["default", "empty", "loading", "error", "disabled"] as const) {
        await showState(page, state);
        const gaps = await page.evaluate(
          ({ state, selector }) => {
            const wrapper = document.querySelector(`[data-demo-state="${state}"]`)!;
            const panel = wrapper.closest(".preview-panel--demo")!.getBoundingClientRect();
            const block = wrapper.querySelector(selector)!;
            const content = [...block.firstElementChild!.children].map((el) =>
              el.getBoundingClientRect(),
            );
            const top = Math.min(...content.map((r) => r.top));
            const bottom = Math.max(...content.map((r) => r.bottom));
            const left = Math.min(...content.map((r) => r.left));
            const right = Math.max(...content.map((r) => r.right));
            return {
              above: top - panel.top,
              below: panel.bottom - bottom,
              before: left - panel.left,
              after: panel.right - right,
            };
          },
          { state, selector: BLOCK },
        );
        expect(Math.abs(gaps.above - gaps.below), `${scheme} ${state}: vertical`).toBeLessThan(2);
        expect(Math.abs(gaps.before - gaps.after), `${scheme} ${state}: horizontal`).toBeLessThan(
          2,
        );
      }
    });

    test("clears AA contrast on every text it paints", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      const ratios = {
        ...(await contrastRatios(page, "default")),
        ...(await contrastRatios(page, "error")),
      };
      for (const label of [
        "default brand",
        "default tagline",
        "default copyright",
        ...COLUMNS.map((column) => `default ${column} heading`),
        "default Invoicing link",
        "default Help centre link",
        ...LEGAL.map((link) => `default ${link} link`),
        ...SOCIAL.map((link) => `default ${link} mark`),
        `default ${ACTION} button`,
        "error alert title",
        "error alert description",
        "error Try again button",
      ]) {
        expect(Object.keys(ratios), `${scheme}: ${label} measured`).toContain(label);
      }
      for (const [what, ratio] of Object.entries(ratios)) {
        const floor = what.endsWith(" mark") ? 3 : 4.5;
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(floor);
      }
    });

    test("shows hover and focus-visible on the action and the links", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      const button = block.locator('[data-scope="button"]');
      await expect(button).toHaveCount(1);
      await expect(button).toHaveAccessibleName(ACTION);
      const link = block.getByRole("link", { name: "Invoicing" });
      const social = block.getByRole("link", { name: SOCIAL[0] });

      // The outline action takes the --accent fill on hover; a column link
      // turns --foreground and underlines; a social link takes the --muted fill.
      const style = (target: typeof button) =>
        target.evaluate((el) => {
          const s = getComputedStyle(el);
          return { bg: s.backgroundColor, color: s.color, line: s.textDecorationLine };
        });
      for (const [name, target, changes] of [
        ["action", button, "bg"],
        ["column link", link, "color"],
        ["column link underline", link, "line"],
        ["social link", social, "bg"],
      ] as const) {
        await page.mouse.move(0, 0);
        const resting = await style(target);
        await target.hover();
        await expect
          .poll(async () => (await style(target))[changes], `${scheme}: ${name} hover`)
          .not.toBe(resting[changes]);
      }

      await page.mouse.move(0, 0);
      for (const [name, target] of [
        ["action", button],
        ["column link", link],
        ["social link", social],
      ] as const) {
        await target.focus();
        await page.keyboard.press("Shift+Tab");
        await page.keyboard.press("Tab");
        const outline = await target.evaluate((el) => ({
          focused: el.matches(":focus-visible"),
          style: getComputedStyle(el).outlineStyle,
        }));
        expect(outline.focused, `${scheme}: ${name} keyboard focus`).toBe(true);
        expect(outline.style, `${scheme}: ${name} focus ring`).not.toBe("none");
      }
    });

    test("announces the loading columns once and the failed load as an alert", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const region = page.locator(`[data-demo-state="loading"] ${BLOCK} [role="status"]`);
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region).toContainText("Loading links");
      const hidden = await region.evaluate((el) =>
        [...el.querySelectorAll('[data-scope="skeleton"]')].every(
          (placeholder) => placeholder.closest('[aria-hidden="true"]') !== null,
        ),
      );
      expect(hidden).toBe(true);

      await showState(page, "error");
      const alert = page.locator(`[data-demo-state="error"] ${BLOCK} [role="alert"]`);
      await expect(alert).toContainText(ERROR);
      await expect(alert.getByRole("button", { name: "Try again" })).toBeVisible();
    });

    test("is one footer landmark with labelled navigation", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      await expect(block.getByRole("navigation", { name: "Footer" })).toHaveCount(1);
      await expect(block.getByRole("navigation", { name: "Legal" })).toHaveCount(1);
      await expect(block.getByRole("list", { name: "Social" }).getByRole("link")).toHaveCount(
        SOCIAL.length,
      );
    });

    test("treats an empty error string as no error", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "error");
      const block = page.locator(`[data-demo-state="error"] ${BLOCK}`);

      // The demo's retry clears its message to "", the way a consumer holding
      // the error as a string does once the load succeeds.
      await block.getByRole("button", { name: "Try again" }).click();

      await expect(block.locator('[data-scope="alert"]')).toHaveCount(0);
      await expect(block.locator('nav[aria-label="Footer"] h2')).toHaveText(COLUMNS);
      await expect(block.locator('[data-scope="button"]')).toHaveText([ACTION]);
    });
  });
}
