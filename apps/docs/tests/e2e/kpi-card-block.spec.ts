/**
 * The kpi-card block, checked on the built docs page at the three widths of
 * the responsive policy (375 / 768 / 1280) in both colour schemes. It asserts
 * text and computed styles, never pixels (see `playwright.config.ts`).
 *
 * Four claims:
 *
 * 1. **Container, not viewport**: the sparkline spans the card under the value
 *    below `--container-sm` and sits beside it from there; the value steps up
 *    to `--text-heading-lg` at `--container-md`; the sparkline widens at
 *    `--container-md` and again at `--container-lg`. Each copy is measured
 *    against its own container width, so the narrow frame keeps its stacked
 *    layout at 1280 while the wide one is laid out side by side.
 * 2. **Every state renders what it claims**: the number with its change tinted
 *    by its tone and its sparkline painted from `--chart-1`, "No data yet"
 *    when there is no metric, placeholders in a busy region while loading, one
 *    alert with a retry when the load failed, and inert buttons when disabled.
 * 3. **Hover and focus-visible** on the header button.
 * 4. **AA contrast** on every text the block paints, per scheme.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/kpi-card/";
const BLOCK = "section.moderno-block-kpi-card";

const STATES = [
  "default",
  "narrow",
  "compact",
  "panel",
  "wide",
  "negative",
  "empty",
  "loading",
  "error",
  "disabled",
] as const;
type State = (typeof STATES)[number];

interface BlockMetrics {
  /** Width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** The card's title text. */
  title: string;
  /** `display` of the body row: `grid` stacked, `flex` once value and line sit side by side. */
  bodyDisplay: string | null;
  /** Whether the value is set at `--text-heading-lg` rather than `--text-heading`. */
  largeValue: boolean | null;
  /** The Badge status of the change. */
  tone: string | null;
  /** The sparkline's rendered width, and the width its step asks for (`null` = the full row). */
  spark: { width: number; rowWidth: number; expected: number | null } | null;
  /** Whether the sparkline's line is drawn in `--chart-1`, with its label. */
  sparkPainted: boolean;
  sparkLabel: string | null;
  /** Whether every button in this copy is disabled. */
  allButtonsInert: boolean;
  /** Placeholders inside a busy `status` region. */
  busyPlaceholders: number;
  /** Whether this copy renders the "No data yet" message. */
  emptyMessage: boolean;
  /** Whether this copy renders the failed-load alert with its retry. */
  failedLoad: boolean;
}

async function showState(page: Page, state: State): Promise<void> {
  const block = page.locator(`[data-demo-state="${state}"] ${BLOCK}`);
  await block.scrollIntoViewIfNeeded();
  await block.waitFor({ state: "visible" });
}

async function blockMetrics(page: Page, state: State): Promise<BlockMetrics[]> {
  return page.evaluate(
    ({ state, BLOCK, CONTAINER_SM, CONTAINER_MD, CONTAINER_LG }) => {
      const panel = document.querySelector(`[data-demo-state="${state}"]`);
      if (!panel) throw new Error(`no preview for the ${state} state on the page`);

      // Resolves a CSS length against the block, so the expected sizes follow
      // the theme's own `--spacing` and type scale.
      function probe(section: Element, property: "width" | "fontSize", value: string): string {
        const el = document.createElement("span");
        el.style.display = "block";
        el.style[property] = value;
        section.append(el);
        const resolved = getComputedStyle(el)[property];
        el.remove();
        return resolved;
      }

      return [...panel.querySelectorAll(BLOCK)].map((section) => {
        const containerWidth = section.getBoundingClientRect().width;
        const content = section.querySelector('[data-scope="card"][data-part="content"]');
        const title = section.querySelector('[data-scope="card"][data-part="title"]');
        if (!content || !title) throw new Error("the kpi-card block did not render its own markup");

        const busy = content.querySelector('[role="status"][aria-busy="true"]');
        const alert = content.querySelector('[data-scope="alert"][data-part="root"]');
        const value = content.querySelector("p.font-serif");
        const row = value?.parentElement?.parentElement ?? null;
        const svg = content.querySelector<SVGSVGElement>('svg[data-chart="spark"]');

        let largeValue: boolean | null = null;
        if (value) {
          largeValue =
            getComputedStyle(value).fontSize ===
            probe(section, "fontSize", "var(--text-heading-lg)");
        }

        let spark: BlockMetrics["spark"] = null;
        let sparkPainted = false;
        if (svg && row) {
          const steps = [
            [CONTAINER_LG, 72],
            [CONTAINER_MD, 56],
            [CONTAINER_SM, 40],
          ] as const;
          const step = steps.find(([min]) => containerWidth >= min);
          spark = {
            width: svg.getBoundingClientRect().width,
            rowWidth: row.getBoundingClientRect().width,
            expected: step
              ? parseFloat(probe(section, "width", `calc(var(--spacing) * ${step[1]})`))
              : null,
          };
          const line = svg.querySelector('[data-part="line"]');
          const chart1 = document.createElement("span");
          chart1.style.color = "var(--chart-1)";
          section.append(chart1);
          const expectedStroke = getComputedStyle(chart1).color;
          chart1.remove();
          sparkPainted =
            line !== null &&
            (line.getAttribute("d") ?? "").startsWith("M") &&
            getComputedStyle(line).stroke === expectedStroke;
        }

        const buttons = [...section.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];

        return {
          containerWidth,
          title: title.textContent?.trim() ?? "",
          bodyDisplay: row ? getComputedStyle(row).display : null,
          largeValue,
          tone:
            content
              .querySelector('[data-scope="badge"][data-part="root"]')
              ?.getAttribute("data-variant") ?? null,
          spark,
          sparkPainted,
          sparkLabel: svg?.getAttribute("aria-label") ?? null,
          allButtonsInert: buttons.length > 0 && buttons.every((button) => button.disabled),
          busyPlaceholders: busy ? busy.querySelectorAll('[data-scope="skeleton"]').length : 0,
          emptyMessage: !value && content.textContent?.includes("No data yet") === true,
          failedLoad:
            !value &&
            alert?.getAttribute("data-variant") === "error" &&
            alert.querySelector('[data-scope="button"]')?.textContent?.includes("Try again") ===
              true,
        };
      });
    },
    { state, BLOCK, CONTAINER_SM, CONTAINER_MD, CONTAINER_LG },
  );
}

async function textRatios(
  page: Page,
  state: "default" | "negative" | "empty" | "error",
): Promise<Record<string, number>> {
  return page.evaluate(
    ({ state, BLOCK }) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("no 2d context");

      // Colours are resolved through a canvas: the contract's values are OKLCH,
      // and the browser is the only thing that converts them the way it painted.
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

      function surfaceOf(el: Element): string {
        let node: Element | null = el;
        while (node) {
          const bg = getComputedStyle(node).backgroundColor;
          if (toRgba(bg)[3] > 0) return bg;
          node = node.parentElement;
        }
        return getComputedStyle(document.body).backgroundColor;
      }

      const block = document.querySelector(`[data-demo-state="${state}"] ${BLOCK}`);
      if (!block) throw new Error(`the ${state} kpi-card demo did not render`);

      const pick = (selector: string): Element => {
        const el = block.querySelector(selector);
        if (!el) throw new Error(`${state}: missing ${selector}`);
        return el;
      };
      const against = (el: Element) => ratio(getComputedStyle(el).color, surfaceOf(el));

      const ratios: Record<string, number> = {
        [`${state} title`]: against(pick('[data-scope="card"][data-part="title"]')),
        [`${state} period`]: against(pick('[data-scope="card"][data-part="description"]')),
        [`${state} action`]: against(
          pick('[data-scope="card"][data-part="header"] [data-scope="button"]'),
        ),
      };
      if (state === "empty") {
        const [message, hint] = [...block.querySelectorAll('[data-part="content"] p')];
        if (!message || !hint) throw new Error("empty: missing its message");
        ratios["empty message"] = against(message);
        ratios["empty hint"] = against(hint);
      } else if (state === "error") {
        ratios["error alert title"] = against(pick('[data-scope="alert"][data-part="title"]'));
        ratios["error alert description"] = against(
          pick('[data-scope="alert"][data-part="description"]'),
        );
        ratios["error Try again button"] = against(
          pick('[data-scope="alert"] [data-scope="button"]'),
        );
      } else {
        ratios[`${state} value`] = against(pick("p.font-serif"));
        ratios[`${state} change`] = against(pick('[data-scope="badge"]'));
        ratios[`${state} caption`] = against(pick('[data-scope="badge"] + span'));
      }
      return ratios;
    },
    { state, BLOCK },
  );
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`kpi-card — ${scheme}`, () => {
    test.use({ colorScheme: scheme });

    for (const width of WIDTHS) {
      test(`lays itself out from its container at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1200 });
        await page.goto(PAGE, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready.then(() => true));

        expect(await page.evaluate(() => document.documentElement.classList.contains("dark"))).toBe(
          scheme === "dark",
        );

        const blocks: (BlockMetrics & { state: State })[] = [];
        for (const state of STATES) {
          await showState(page, state);
          const mounted = await blockMetrics(page, state);
          expect(mounted, `${state}: mounted copies`).toHaveLength(1);
          const block = mounted[0]!;
          blocks.push({ ...block, state });
          const where = `${scheme} ${width}px, ${state} (${block.containerWidth}px)`;

          if (block.bodyDisplay !== null) {
            expect(block.bodyDisplay, `${where}: value beside the line`).toBe(
              block.containerWidth >= CONTAINER_SM ? "flex" : "grid",
            );
          }
          if (block.largeValue !== null) {
            expect(block.largeValue, `${where}: value size`).toBe(
              block.containerWidth >= CONTAINER_MD,
            );
          }
          if (block.spark !== null) {
            const expected = block.spark.expected ?? block.spark.rowWidth;
            expect(
              Math.abs(block.spark.width - expected),
              `${where}: sparkline width`,
            ).toBeLessThan(1);
            expect(block.sparkPainted, `${where}: sparkline drawn in --chart-1`).toBe(true);
          }

          const panel = await page.evaluate((state) => {
            const el = document
              .querySelector(`[data-demo-state="${state}"]`)!
              .closest(".preview-panel--demo") as HTMLElement;
            return { scroll: el.scrollWidth, client: el.clientWidth };
          }, state);
          expect(panel.scroll, `${where}: demo panel overflow`).toBeLessThanOrEqual(panel.client);
        }

        const byState = (state: State) => blocks.find((block) => block.state === state)!;
        const numbers = blocks.filter((block) => block.tone !== null);
        expect(numbers.length, `${scheme} ${width}px: copies rendering the number`).toBe(7);

        // The tint follows what the change means, not its sign: the sample's
        // revenue rose (good news), the negative example's churn rose (bad news).
        for (const block of numbers.filter((block) => block.state !== "negative")) {
          expect(block.tone, `${block.state}: tone`).toBe("success");
          expect(block.title, `${block.state}: title`).toBe("Revenue");
          expect(block.sparkLabel, `${block.state}: sparkline label`).toBe("Revenue trend");
        }
        expect(byState("negative").tone).toBe("error");
        expect(byState("negative").sparkLabel).toBe("Churn rate trend");

        expect(byState("empty").emptyMessage, "the empty render").toBe(true);
        expect(
          byState("loading").busyPlaceholders,
          "the loading render: value, change and line placeholders",
        ).toBe(3);
        expect(byState("error").failedLoad, "the failed-load render").toBe(true);
        expect(byState("disabled").allButtonsInert, "the disabled render").toBe(true);
        expect(byState("default").allButtonsInert, "the default render").toBe(false);

        // Each step is exercised on both sides at every viewport.
        const widths = numbers.map((block) => block.containerWidth);
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

    test("shows hover and focus-visible on the header button", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      await expect(block.getByRole("heading", { level: 3 })).toHaveText("Revenue");
      await expect(block.getByRole("img", { name: "Revenue trend" })).toBeVisible();

      const action = block.getByRole("button", { name: "View report" });
      const fill = () =>
        action.evaluate((el) => {
          const canvas = document.createElement("canvas").getContext("2d")!;
          canvas.fillStyle = getComputedStyle(el).backgroundColor;
          canvas.fillRect(0, 0, 1, 1);
          return canvas.getImageData(0, 0, 1, 1).data[3]!;
        });

      // Ghost: no fill at rest, the accent fill on hover.
      await page.mouse.move(0, 0);
      expect(await fill(), `${scheme}: resting fill`).toBe(0);
      await action.hover();
      await expect.poll(fill, { message: `${scheme}: hover fill` }).toBeGreaterThan(0);

      // Keyboard focus draws a ring.
      await page.mouse.move(0, 0);
      await action.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      await expect(action).toBeFocused();
      const ring = await action.evaluate((el) => ({
        focused: el.matches(":focus-visible"),
        style: getComputedStyle(el).outlineStyle,
      }));
      expect(ring.focused, `${scheme}: keyboard focus`).toBe(true);
      expect(ring.style, `${scheme}: focus ring`).not.toBe("none");
    });

    test("announces the loading number and the failed load, and retries", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const region = page.locator(`[data-demo-state="loading"] ${BLOCK} [role="status"]`);
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region).toContainText("Loading Revenue");

      await showState(page, "error");
      const block = page.locator(`[data-demo-state="error"] ${BLOCK}`);
      const alert = block.locator('[role="alert"]');
      await expect(alert).toContainText("We could not load this number.");
      await expect(block.getByRole("button", { name: "View report" })).toBeDisabled();

      // The demo's retry clears its message to "", which counts as no error.
      await alert.getByRole("button", { name: "Try again" }).click();
      await expect(alert).toHaveCount(0);
      await expect(block.locator("p.font-serif")).toHaveText("$48,294");
      await expect(block.getByRole("button", { name: "View report" })).toBeEnabled();
    });

    test("clears AA contrast on every text it paints", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      let ratios: Record<string, number> = {};
      for (const state of ["default", "negative", "empty", "error"] as const) {
        await showState(page, state);
        ratios = { ...ratios, ...(await textRatios(page, state)) };
      }
      for (const label of [
        "default value",
        "default change",
        "negative change",
        "empty message",
        "error alert title",
      ]) {
        expect(Object.keys(ratios), `${scheme}: ${label} measured`).toContain(label);
      }
      for (const [what, ratio] of Object.entries(ratios)) {
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
      }
    });
  });
}
