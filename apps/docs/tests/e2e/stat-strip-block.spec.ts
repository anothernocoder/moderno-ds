/**
 * The stat strip block, checked on the built docs page at the three widths of
 * the responsive policy (375 / 768 / 1280) in both colour schemes. It asserts
 * text and computed styles; no screenshot baseline is committed.
 *
 * Four claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` the figures sit two per
 *    row and the action sits under the heading; at `--container-sm` the action
 *    moves beside the heading; at `--container-md` the heading and the values
 *    step up one size; at `--container-lg` all four figures sit on one row,
 *    with more room above and below. Each copy on the page is measured against
 *    its own container width, so the narrow frame stays at two per row at 1280
 *    while the wide frame has crossed every step. Every value fits its column.
 * 2. **Every state renders what it claims**, at every width: the heading, the
 *    action and four figures by default (value above label, both in one `dl`);
 *    the empty message; placeholders in a busy region while loading; an error
 *    Alert with a retry in place of the figures; a disabled action and retry
 *    when disabled. Every copy is centred in its box.
 * 3. **AA contrast** in both schemes on every text the block paints.
 * 4. **Hover and focus-visible** on the action, and neither on a disabled one.
 *
 * It also checks that an empty `error` string counts as no error: the figures
 * come back, with no alert.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/stat-strip/";

const BLOCK = "section.moderno-block-stat-strip";

/** The copy the block ships with. */
const HEADING = "The numbers behind a calmer close";
const DESCRIPTION = "Finance teams of every size run their books on one workspace.";
const ACTION = "Read the customer report";
const VALUES = ["$2.4B", "12,000+", "3 days", "99.99%"];
const LABELS = [
  "Invoiced by our customers",
  "Finance teams on board",
  "Saved on every month-end close",
  "Uptime over the last year",
];
const EMPTY = "No numbers to show yet.";
const ERROR = "We could not load the numbers.";

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** The heading's text. */
  heading: string | null;
  /** The heading's font size, in px. */
  headingSize: number;
  /** Whether the heading is set in the serif face. */
  headingSerif: boolean;
  /** The description's text. */
  description: string | null;
  /** Where the action sits against the heading's text: beside it, or below it. */
  actionPlacement: "beside" | "below" | null;
  /** The figures' values, in order. */
  values: string[];
  /** The figures' labels, in order. */
  labels: string[];
  /** Whether every value sits above its own label on screen. */
  valuesAboveLabels: boolean;
  /** Whether the values on one row share one top edge, however their labels wrap. */
  valuesAligned: boolean;
  /** Whether every value is set in the serif face. */
  valuesSerif: boolean;
  /** Tracks of the figure grid, or of the placeholders while loading. */
  tracks: number | null;
  /** Rows the figures fill. */
  rows: number;
  /** Whether every value fits inside its column. */
  valuesFit: boolean;
  /** Each value's font size, in px (one value when they agree). */
  valueSizes: number[];
  /** Each figure's top border width, in px (one value when they agree). */
  rules: number[];
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
  /** Placeholder pairs inside a busy status region, each hidden from assistive technology. */
  placeholders: number;
  /** Whether an error Alert is announced. */
  alert: boolean;
}

/**
 * The page's previews (islands/StatStripBlockDemo.svelte): the main preview
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

      const probe = document.createElement("span");
      probe.style.fontFamily = "var(--font-serif)";
      document.body.append(probe);
      const serif = getComputedStyle(probe).fontFamily;
      probe.remove();

      return [...wrapper.querySelectorAll<HTMLElement>(selector)].map((section) => {
        const body = section.firstElementChild as HTMLElement | null;
        if (!body) throw new Error("the stat strip block did not render its own markup");

        const header = body.firstElementChild as HTMLElement;
        const heading = header.querySelector("h2");
        const description = header.querySelector("h2 + p");
        const action = header.querySelector<HTMLElement>(':scope > [data-scope="button"]');
        const list = body.querySelector(":scope > dl");
        const busy = body.querySelector(':scope > [role="status"][aria-busy="true"]');
        const grid = list ?? busy;
        const figures = [...(list?.querySelectorAll<HTMLElement>(":scope > div") ?? [])];
        const values = figures.map((figure) => figure.querySelector("dd")!);
        const labels = figures.map((figure) => figure.querySelector("dt")!);
        const buttons = [...section.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];

        let actionPlacement: BlockMetrics["actionPlacement"] = null;
        if (action && heading) {
          const text = heading.parentElement!.getBoundingClientRect();
          const button = action.getBoundingClientRect();
          actionPlacement =
            button.left >= text.right - 0.5 && button.top < text.bottom ? "beside" : "below";
          if (actionPlacement === "below" && button.top < text.bottom - 0.5) {
            throw new Error("the action overlaps the heading");
          }
        }

        return {
          containerWidth: section.offsetWidth,
          heading: heading?.textContent?.trim() ?? null,
          headingSize: heading ? parseFloat(getComputedStyle(heading).fontSize) : 0,
          headingSerif: heading ? getComputedStyle(heading).fontFamily === serif : false,
          description: description?.textContent?.trim() ?? null,
          actionPlacement,
          values: values.map((dd) => dd.textContent?.trim() ?? ""),
          labels: labels.map((dt) => dt.textContent?.trim() ?? ""),
          valuesAboveLabels: figures.every(
            (_, i) =>
              values[i]!.getBoundingClientRect().bottom <=
              labels[i]!.getBoundingClientRect().top + 0.5,
          ),
          valuesAligned: (() => {
            const rowOf = new Map<number, number[]>();
            figures.forEach((figure, i) => {
              const row = Math.round(figure.getBoundingClientRect().top);
              const top = values[i]!.getBoundingClientRect().top;
              rowOf.set(row, [...(rowOf.get(row) ?? []), top]);
            });
            return [...rowOf.values()].every((tops) => Math.max(...tops) - Math.min(...tops) < 1);
          })(),
          valuesSerif: values.every((dd) => getComputedStyle(dd).fontFamily === serif),
          tracks: grid
            ? getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length
            : null,
          rows: new Set(figures.map((figure) => Math.round(figure.getBoundingClientRect().top)))
            .size,
          valuesFit: values.every((dd) => {
            const cell = dd.parentElement!.getBoundingClientRect();
            const range = document.createRange();
            range.selectNodeContents(dd);
            const text = range.getBoundingClientRect();
            return text.left >= cell.left - 0.5 && text.right <= cell.right + 0.5;
          }),
          valueSizes: unique(values.map((dd) => parseFloat(getComputedStyle(dd).fontSize))),
          rules: unique(
            figures.map((figure) => parseFloat(getComputedStyle(figure).borderTopWidth)),
          ),
          paddingTop: parseFloat(getComputedStyle(body).paddingTop),
          empty: body.querySelector(":scope > p")?.textContent?.trim() ?? null,
          actions: buttons.map((b) => b.textContent?.trim() ?? ""),
          actionVariants: buttons.map((b) => b.getAttribute("data-variant") ?? ""),
          allActionsInert: buttons.length > 0 && buttons.every((b) => b.disabled),
          placeholders: busy
            ? [...busy.querySelectorAll(':scope > [aria-hidden="true"]')].filter(
                (pair) => pair.querySelectorAll('[data-scope="skeleton"]').length === 2,
              ).length
            : 0,
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
        ["heading", body.querySelector("h2")],
        ["description", body.querySelector("h2 + p")],
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
      for (const figure of block.querySelectorAll("dl > div")) {
        const value = figure.querySelector("dd")!;
        const label = figure.querySelector("dt")!;
        ratios[`${state} ${value.textContent?.trim()} value`] = against(value);
        ratios[`${state} ${label.textContent?.trim()} label`] = against(label);
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
  test.describe(`stat strip — ${scheme}`, () => {
    test.use({ colorScheme: scheme });

    for (const width of WIDTHS) {
      test(`lays itself out from its container at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1200 });
        await page.goto(PAGE, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready.then(() => true));

        expect(await page.evaluate(() => document.documentElement.classList.contains("dark"))).toBe(
          scheme === "dark",
        );

        const headingSm = await typeSize(page, "--text-heading-sm");
        const headingMd = await typeSize(page, "--text-heading");
        const headingLg = await typeSize(page, "--text-heading-lg");
        expect(headingMd, "the two heading sizes differ").toBeGreaterThan(headingSm);
        expect(headingLg, "the two value sizes differ").toBeGreaterThan(headingMd);

        const blocks: Array<BlockMetrics & { state: State }> = [];
        for (const state of STATES) {
          await showState(page, state);
          const mounted = await blockMetrics(page, state);
          expect(mounted, `${state}: mounted copies`).toHaveLength(1);
          const block = mounted[0]!;
          blocks.push({ ...block, state });
          const where = `${scheme} ${width}px, ${state} (${block.containerWidth}px)`;
          const perRow = block.containerWidth >= CONTAINER_LG ? 4 : 2;
          const stepped = block.containerWidth >= CONTAINER_MD;

          if (block.tracks !== null) {
            expect(block.tracks, `${where}: figures per row`).toBe(perRow);
          }
          expect(block.paddingTop, `${where}: room above`).toBe(
            block.containerWidth >= CONTAINER_LG ? 64 : 48,
          );
          expect(block.alert, `${where}: error announced`).toBe(state === "error");

          // What every state keeps: the heading, its line and the action.
          expect(block.heading, `${where}: heading`).toBe(HEADING);
          expect(block.headingSerif, `${where}: heading in the serif face`).toBe(true);
          expect(block.headingSize, `${where}: heading size`).toBe(stepped ? headingMd : headingSm);
          expect(block.description, `${where}: description`).toBe(DESCRIPTION);
          expect(block.actionPlacement, `${where}: action placement`).toBe(
            block.containerWidth >= CONTAINER_SM ? "beside" : "below",
          );
          expect(block.actions[0], `${where}: action`).toBe(ACTION);

          if (state === "loading") {
            expect(block.placeholders, `${where}: placeholder pairs`).toBe(VALUES.length);
            expect(block.values, `${where}: no figures while loading`).toEqual([]);
            expect(block.actions, `${where}: only the action`).toEqual([ACTION]);
          } else if (state === "empty") {
            expect(block.values, `${where}: no figures`).toEqual([]);
            expect(block.tracks, `${where}: no figure grid`).toBeNull();
            expect(block.empty, `${where}: empty message`).toBe(EMPTY);
          } else if (state === "error") {
            expect(block.values, `${where}: no figures`).toEqual([]);
            expect(block.tracks, `${where}: no figure grid`).toBeNull();
            expect(block.actions, `${where}: action and retry`).toEqual([ACTION, "Try again"]);
            expect(block.actionVariants, `${where}: variants`).toEqual(["outline", "outline"]);
          } else {
            expect(block.values, `${where}: values`).toEqual(VALUES);
            expect(block.labels, `${where}: labels`).toEqual(LABELS);
            expect(block.valuesAboveLabels, `${where}: value above label`).toBe(true);
            expect(block.valuesAligned, `${where}: values on a row share a top`).toBe(true);
            expect(block.valuesSerif, `${where}: values in the serif face`).toBe(true);
            expect(block.rows, `${where}: rows`).toBe(VALUES.length / perRow);
            expect(block.valuesFit, `${where}: every value fits its column`).toBe(true);
            expect(block.valueSizes, `${where}: value size`).toEqual([
              stepped ? headingLg : headingMd,
            ]);
            expect(block.rules, `${where}: one hairline over each figure`).toEqual([1]);
            expect(block.actions, `${where}: only the action`).toEqual([ACTION]);
            expect(block.actionVariants, `${where}: variant`).toEqual(["outline"]);
            expect(block.allActionsInert, `${where}: action disabled`).toBe(state === "disabled");
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
        "default description",
        ...VALUES.map((value) => `default ${value} value`),
        ...LABELS.map((label) => `default ${label} label`),
        `default ${ACTION} button`,
        "empty empty message",
        "error alert title",
        "error alert description",
        "error Try again button",
      ]) {
        expect(Object.keys(ratios), `${scheme}: ${label} measured`).toContain(label);
      }
      for (const [what, ratio] of Object.entries(ratios)) {
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
      }
    });

    test("shows hover and focus-visible on the action", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const button = page
        .locator(`[data-demo-state="default"] ${BLOCK}`)
        .getByRole("button", { name: ACTION });

      // The outline action takes the --accent fill on hover.
      const surface = () => button.evaluate((el) => getComputedStyle(el).backgroundColor);
      await page.mouse.move(0, 0);
      const resting = await surface();
      await button.hover();
      await expect.poll(surface, `${scheme}: action hover`).not.toBe(resting);

      // Keyboard focus draws the --ring outline.
      await page.mouse.move(0, 0);
      await button.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const outline = await button.evaluate((el) => ({
        focused: el.matches(":focus-visible"),
        style: getComputedStyle(el).outlineStyle,
      }));
      expect(outline.focused, `${scheme}: action keyboard focus`).toBe(true);
      expect(outline.style, `${scheme}: action focus ring`).not.toBe("none");
    });

    test("keeps a disabled action still and out of the tab order", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "disabled");
      const button = page
        .locator(`[data-demo-state="disabled"] ${BLOCK}`)
        .getByRole("button", { name: ACTION });
      await expect(button).toBeDisabled();

      await page.mouse.move(0, 0);
      const resting = await button.evaluate((el) => getComputedStyle(el).backgroundColor);
      await button.hover({ force: true });
      // Past the colour transition, so a hover that did fire would show.
      await page.waitForTimeout(300);
      expect(await button.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(resting);
      const focusable = await button.evaluate((el) => {
        (el as HTMLElement).focus();
        return document.activeElement === el;
      });
      expect(focusable, `${scheme}: disabled action focus`).toBe(false);
    });

    test("pairs each value with its label in one description list", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      await expect(block.getByRole("heading", { level: 2 })).toHaveText(HEADING);
      await expect(block.locator("dl > div > dt")).toHaveText(LABELS);
      await expect(block.locator("dl > div > dd")).toHaveText(VALUES);
    });

    test("announces the loading figures once and the failed load as an alert", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const region = page.locator(`[data-demo-state="loading"] ${BLOCK} [role="status"]`);
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region).toContainText("Loading stats");
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
      await expect(block.locator("dl > div > dd")).toHaveText(VALUES);
    });
  });
}
