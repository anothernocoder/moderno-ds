/**
 * The logo strip block, checked on the built docs page at the three widths of
 * the responsive policy (375 / 768 / 1280) in both colour schemes. It asserts
 * text and computed styles; no screenshot baseline is committed.
 *
 * Four claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` the logos sit two per
 *    row; at `--container-sm` three per row; at `--container-md` the marks and
 *    wordmarks step up one size; at `--container-lg` all six sit on one row,
 *    with more room above and below. Each copy on the page is measured against
 *    its own container width, so the narrow frame stays at two per row at 1280
 *    while the wide frame has crossed every step. Every wordmark fits its
 *    column.
 * 2. **Every state renders what it claims**, at every width: the heading and
 *    six linked logos by default; the empty message; placeholders in a busy
 *    region while loading; an error Alert with a retry in place of the logos;
 *    inert links and retry when disabled. Every copy is centred in its box.
 * 3. **AA contrast** in both schemes on every text the block paints, and 3:1 on
 *    each mark.
 * 4. **Hover and focus-visible** on a logo, and neither on a disabled one.
 *
 * It also checks that an empty `error` string counts as no error: the logos
 * come back, with no alert.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/logo-strip/";

const BLOCK = "section.moderno-block-logo-strip";

/** The copy the block ships with. */
const HEADING = "Trusted by finance teams at more than 2,000 companies";
const LOGOS = ["Lumen", "Arcline", "Keystone", "Orbit", "Vertex", "Quanta"];
const EMPTY = "No logos to show yet.";
const ERROR = "We could not load the logos.";

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** The heading's text. */
  heading: string | null;
  /** The logos' wordmarks, in order. */
  logos: string[];
  /** Logos that are live links (an `href`, no `aria-disabled`). */
  liveLinks: number;
  /** Logos that are inert links (no `href`, `aria-disabled="true"`, role link). */
  inertLinks: number;
  /** Logos that carry an aria-hidden mark. */
  marks: number;
  /** Tracks of the logo grid, or of the placeholders while loading. */
  tracks: number | null;
  /** Rows the logos fill. */
  rows: number;
  /** Whether every wordmark fits inside its column. */
  logosFit: boolean;
  /** Each wordmark's font size, in px (one value when they agree). */
  wordmarkSizes: number[];
  /** Each mark's width, in px (one value when they agree). */
  markSizes: number[];
  /** The block's padding above its content, in px. */
  paddingTop: number;
  /** The empty message, if shown. */
  empty: string | null;
  /** The button labels, in order. */
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
 * The page's previews (islands/LogoStripBlockDemo.svelte): the main preview
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

async function showState(page: Page, state: State): Promise<void> {
  const block = page.locator(`[data-demo-state="${state}"] ${BLOCK}`);
  await block.scrollIntoViewIfNeeded();
  await block.waitFor({ state: "visible" });
}

/** A contract type size resolved to px, the way the browser resolves it. */
async function typeSize(page: Page, slot: string): Promise<number> {
  return page.evaluate((slot) => {
    const probe = document.createElement("span");
    probe.style.fontSize = `var(${slot})`;
    document.body.append(probe);
    const size = parseFloat(getComputedStyle(probe).fontSize);
    probe.remove();
    return size;
  }, slot);
}

async function blockMetrics(page: Page, state: State): Promise<BlockMetrics[]> {
  return page.evaluate(
    ({ state, selector }) => {
      const wrapper = document.querySelector(`[data-demo-state="${state}"]`);
      if (!wrapper) throw new Error(`no preview for the ${state} state on the page`);
      const unique = (values: number[]) => [...new Set(values)];

      return [...wrapper.querySelectorAll<HTMLElement>(selector)].map((section) => {
        const body = section.firstElementChild as HTMLElement | null;
        if (!body) throw new Error("the logo strip block did not render its own markup");

        const list = body.querySelector(":scope > ul");
        const busy = body.querySelector(':scope > [role="status"][aria-busy="true"]');
        const grid = list ?? busy;
        const links = [...(list?.querySelectorAll<HTMLAnchorElement>("li > a") ?? [])];
        const buttons = [...section.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];
        const marks = links
          .map((a) => a.querySelector('svg[aria-hidden="true"]'))
          .filter((svg): svg is SVGSVGElement => svg !== null);

        return {
          containerWidth: section.offsetWidth,
          heading: body.querySelector(":scope > h2")?.textContent?.trim() ?? null,
          logos: links.map((a) => a.textContent?.trim() ?? ""),
          liveLinks: links.filter((a) => a.hasAttribute("href") && !a.hasAttribute("aria-disabled"))
            .length,
          inertLinks: links.filter(
            (a) =>
              !a.hasAttribute("href") &&
              a.getAttribute("aria-disabled") === "true" &&
              a.getAttribute("role") === "link",
          ).length,
          marks: marks.length,
          tracks: grid
            ? getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length
            : null,
          rows: new Set(links.map((a) => Math.round(a.getBoundingClientRect().top))).size,
          logosFit: links.every((a) => {
            const cell = a.parentElement!.getBoundingClientRect();
            const mark = a.getBoundingClientRect();
            return mark.left >= cell.left - 0.5 && mark.right <= cell.right + 0.5;
          }),
          wordmarkSizes: unique(links.map((a) => parseFloat(getComputedStyle(a).fontSize))),
          markSizes: unique(marks.map((svg) => svg.getBoundingClientRect().width)),
          paddingTop: parseFloat(getComputedStyle(body).paddingTop),
          empty: body.querySelector(":scope > p")?.textContent?.trim() ?? null,
          actions: buttons.map((b) => b.textContent?.trim() ?? ""),
          actionVariants: buttons.map((b) => b.getAttribute("data-variant") ?? ""),
          allActionsInert: buttons.length > 0 && buttons.every((b) => b.disabled),
          placeholders: busy ? busy.querySelectorAll('[data-scope="skeleton"]').length : 0,
          alert: section.querySelector('[data-scope="alert"][role="alert"]') !== null,
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
      const body = block.firstElementChild!;
      const parts: Array<[string, Element | null]> = [
        ["heading", body.querySelector(":scope > h2")],
        ["empty message", body.querySelector(":scope > p")],
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
      for (const link of block.querySelectorAll("ul > li > a")) {
        const name = link.textContent?.trim();
        ratios[`${state} ${name} logo`] = against(link);
        // Non-text contrast (WCAG 1.4.11): the mark against the page.
        const mark = link.querySelector("svg");
        if (mark) ratios[`${state} ${name} mark`] = against(mark);
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
  test.describe(`logo strip — ${scheme}`, () => {
    test.use({ colorScheme: scheme });

    for (const width of WIDTHS) {
      test(`lays itself out from its container at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1200 });
        await page.goto(PAGE, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready.then(() => true));

        expect(await page.evaluate(() => document.documentElement.classList.contains("dark"))).toBe(
          scheme === "dark",
        );

        const uiMd = await typeSize(page, "--text-ui-md");
        const uiLg = await typeSize(page, "--text-ui-lg");
        expect(uiLg, "the two wordmark sizes differ").toBeGreaterThan(uiMd);

        const blocks: Array<BlockMetrics & { state: State }> = [];
        for (const state of STATES) {
          await showState(page, state);
          const mounted = await blockMetrics(page, state);
          expect(mounted, `${state}: mounted copies`).toHaveLength(1);
          const block = mounted[0]!;
          blocks.push({ ...block, state });
          const where = `${scheme} ${width}px, ${state} (${block.containerWidth}px)`;
          const perRow =
            block.containerWidth >= CONTAINER_LG ? 6 : block.containerWidth >= CONTAINER_SM ? 3 : 2;

          if (block.tracks !== null) {
            expect(block.tracks, `${where}: logos per row`).toBe(perRow);
          }
          expect(block.paddingTop, `${where}: room above`).toBe(
            block.containerWidth >= CONTAINER_LG ? 64 : 48,
          );
          expect(block.alert, `${where}: error announced`).toBe(state === "error");

          // What every state keeps: the heading.
          expect(block.heading, `${where}: heading`).toBe(HEADING);

          if (state === "loading") {
            expect(block.placeholders, `${where}: placeholders`).toBe(LOGOS.length);
            expect(block.logos, `${where}: no logos while loading`).toEqual([]);
            expect(block.actions, `${where}: no buttons`).toEqual([]);
          } else if (state === "empty") {
            expect(block.logos, `${where}: no logos`).toEqual([]);
            expect(block.tracks, `${where}: no logo grid`).toBeNull();
            expect(block.empty, `${where}: empty message`).toBe(EMPTY);
          } else if (state === "error") {
            expect(block.logos, `${where}: no logos`).toEqual([]);
            expect(block.tracks, `${where}: no logo grid`).toBeNull();
            expect(block.actions, `${where}: retry`).toEqual(["Try again"]);
            expect(block.actionVariants, `${where}: variant`).toEqual(["outline"]);
          } else {
            expect(block.logos, `${where}: logos`).toEqual(LOGOS);
            expect(block.marks, `${where}: one hidden mark per logo`).toBe(LOGOS.length);
            expect(block.rows, `${where}: rows`).toBe(LOGOS.length / perRow);
            expect(block.logosFit, `${where}: every wordmark fits its column`).toBe(true);
            const stepped = block.containerWidth >= CONTAINER_MD;
            expect(block.wordmarkSizes, `${where}: wordmark size`).toEqual([stepped ? uiLg : uiMd]);
            expect(block.markSizes, `${where}: mark size`).toEqual([stepped ? 20 : 16]);
            if (state === "disabled") {
              expect(block.inertLinks, `${where}: inert links`).toBe(LOGOS.length);
              expect(block.liveLinks, `${where}: no live links`).toBe(0);
            } else {
              expect(block.liveLinks, `${where}: live links`).toBe(LOGOS.length);
              expect(block.inertLinks, `${where}: no inert links`).toBe(0);
            }
            expect(block.actions, `${where}: no buttons`).toEqual([]);
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
        ...(await contrastRatios(page, "empty")),
        ...(await contrastRatios(page, "error")),
      };
      for (const label of [
        "default heading",
        ...LOGOS.map((logo) => `default ${logo} logo`),
        ...LOGOS.map((logo) => `default ${logo} mark`),
        "empty empty message",
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

    test("shows hover and focus-visible on a logo", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const logo = page
        .locator(`[data-demo-state="default"] ${BLOCK}`)
        .getByRole("link", { name: LOGOS[0] });
      const color = () => logo.evaluate((el) => getComputedStyle(el).color);

      // A logo turns --foreground on hover.
      await page.mouse.move(0, 0);
      const resting = await color();
      await logo.hover();
      await expect.poll(color, `${scheme}: logo hover`).not.toBe(resting);

      // Keyboard focus draws the --ring outline.
      await page.mouse.move(0, 0);
      await logo.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const outline = await logo.evaluate((el) => ({
        focused: el.matches(":focus-visible"),
        style: getComputedStyle(el).outlineStyle,
      }));
      expect(outline.focused, `${scheme}: logo keyboard focus`).toBe(true);
      expect(outline.style, `${scheme}: logo focus ring`).not.toBe("none");
    });

    test("keeps a disabled logo still and out of the tab order", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "disabled");
      const logo = page
        .locator(`[data-demo-state="disabled"] ${BLOCK}`)
        .getByRole("link", { name: LOGOS[0] });
      await expect(logo).toHaveAttribute("aria-disabled", "true");
      await expect(logo).not.toHaveAttribute("href");

      await page.mouse.move(0, 0);
      const resting = await logo.evaluate((el) => getComputedStyle(el).color);
      await logo.hover();
      // Past the colour transition, so a hover that did fire would show.
      await page.waitForTimeout(300);
      expect(await logo.evaluate((el) => getComputedStyle(el).color)).toBe(resting);
      expect(await logo.evaluate((el) => getComputedStyle(el).cursor)).toBe("not-allowed");
      // An anchor without `href` cannot take focus.
      const focusable = await logo.evaluate((el) => {
        (el as HTMLElement).focus();
        return document.activeElement === el;
      });
      expect(focusable, `${scheme}: disabled logo focus`).toBe(false);
    });

    test("announces the loading logos once and the failed load as an alert", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const region = page.locator(`[data-demo-state="loading"] ${BLOCK} [role="status"]`);
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region).toContainText("Loading logos");
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

    test("treats an empty error string as no error", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "error");
      const block = page.locator(`[data-demo-state="error"] ${BLOCK}`);

      // The demo's retry clears its message to "", the way a consumer holding
      // the error as a string does once the load succeeds.
      await block.getByRole("button", { name: "Try again" }).click();

      await expect(block.locator('[data-scope="alert"]')).toHaveCount(0);
      await expect(block.locator("ul > li > a")).toHaveText(LOGOS);
    });
  });
}
