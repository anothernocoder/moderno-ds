/**
 * The status-monitoring block, checked on the built docs page at the three
 * widths of the responsive policy (375 / 768 / 1280) in both colour schemes. It
 * asserts text and computed styles; no screenshot baseline is committed.
 *
 * Four claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` everything stacks; at
 *    `--container-sm` the header and each service's name and status line up;
 *    at `--container-md` the bars grow and the heading steps up; at
 *    `--container-lg` two services share a row. Each copy on the page is
 *    measured against its own container width, so the narrow frame stays
 *    stacked at 1280 while the wide frame is two-up.
 * 2. **Every state renders what it claims**, at every width: the worst status
 *    in the badge, one bar per day painted from the status slots, a card when
 *    nothing is monitored, placeholders in a busy region while loading, one
 *    alert with a retry on a failed load, and inert buttons when disabled.
 * 3. **AA contrast** in both schemes on every text the block paints.
 * 4. **Hover, focus-visible and naming**: the action reacts to hover and
 *    keyboard focus; each service's bars are one image named by its days; the
 *    loading region is announced once.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/status-monitoring/";

const BLOCK = "section.moderno-block-status-monitoring";

/**
 * The page's previews (islands/StatusMonitoringBlockDemo.svelte): the main
 * preview mounts the sample; the Examples frame the same block at 18rem, 30rem,
 * 40rem and 50rem, then mount an outage, the empty, loading, error and disabled
 * states. Every copy is found by the `data-demo-state` its wrapper carries.
 */
const STATES = [
  "default",
  "narrow",
  "compact",
  "panel",
  "wide",
  "outage",
  "empty",
  "loading",
  "error",
  "disabled",
] as const;
type State = (typeof STATES)[number];

/** What each service in the sample shows: its Indicator tone and its days. */
const SAMPLE_SERVICES = [
  { name: "API", tone: "success", days: "Last 30 days: 29 operational, 1 degraded" },
  { name: "Dashboard", tone: "success", days: "Last 30 days: 30 operational" },
  {
    name: "Webhooks",
    tone: "warning",
    days: "Last 30 days: 27 operational, 2 degraded, 1 outage",
  },
  {
    name: "Email delivery",
    tone: "info",
    days: "Last 30 days: 28 operational, 2 maintenance",
  },
];

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** `display` of the header row: `grid` stacked, `flex` once it lines up. */
  headerDisplay: string;
  /** Whether the heading is set at `--text-heading-sm` rather than `--text-body-lg`. */
  largeHeading: boolean;
  /** The overall badge's status and text, when the services render. */
  badge: { variant: string; text: string } | null;
  /** Each service's name, Indicator tone and bar count, in order. */
  services: { name: string; tone: string; bars: number }[];
  /** `display` of each service's name-and-status row. */
  serviceRowDisplays: string[];
  /** How many services (or placeholders) share the first row. */
  perRow: number | null;
  /** Bar height over the root font size: 1.5 below `@md`, 2 from it. */
  barHeightRem: number | null;
  /** Whether each day's bar is painted from its status slot. */
  barsPainted: boolean;
  /** Whether every button in this copy is disabled. */
  allButtonsInert: boolean;
  /** Skeletons inside a busy `status` region. */
  busyPlaceholders: number;
  /** Whether this copy renders the "No services yet" card. */
  emptyCard: boolean;
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
    ({ state, selector }) => {
      const panel = document.querySelector(`[data-demo-state="${state}"]`);
      if (!panel) throw new Error(`no preview for the ${state} state on the page`);

      return [...panel.querySelectorAll<HTMLElement>(selector)].map((section) => {
        const shell = section.firstElementChild;
        const header = shell?.firstElementChild;
        const heading = section.querySelector("h2");
        if (!shell || !header || !heading) {
          throw new Error("the status-monitoring block did not render its own markup");
        }

        const probe = (style: Partial<CSSStyleDeclaration>): CSSStyleDeclaration => {
          const el = document.createElement("span");
          Object.assign(el.style, style);
          section.append(el);
          const computed = getComputedStyle(el);
          const copy = { color: computed.color, fontSize: computed.fontSize };
          el.remove();
          return copy as CSSStyleDeclaration;
        };

        const list = shell.querySelector("ul");
        const busy = shell.querySelector('[role="status"][aria-busy="true"]');
        const cells = list
          ? [...list.children]
          : busy
            ? [...busy.querySelectorAll(':scope > [data-scope="card"]')]
            : [];

        let perRow: number | null = null;
        if (cells.length > 0) {
          const top = cells[0]!.getBoundingClientRect().top;
          perRow = cells.filter(
            (cell) => Math.abs(cell.getBoundingClientRect().top - top) < 1,
          ).length;
        }

        const items = list ? [...list.querySelectorAll(":scope > li")] : [];
        const barRows = items.map((item) => item.querySelector('[role="img"]'));
        const rootSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

        const slotFor: Record<string, string> = {
          operational: "--success",
          degraded: "--warning",
          outage: "--destructive",
          maintenance: "--info",
          "no-data": "--muted",
        };
        const bars = barRows.flatMap((row) => [...(row?.children ?? [])]) as HTMLElement[];
        const barsPainted =
          bars.length > 0 &&
          bars.every((bar) => {
            const slot = slotFor[bar.dataset.day ?? ""];
            if (!slot) return false;
            return getComputedStyle(bar).backgroundColor === probe({ color: `var(${slot})` }).color;
          });

        const badge = header.querySelector('[data-scope="badge"][data-part="root"]');
        const buttons = [...section.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];
        const alert = section.querySelector('[data-scope="alert"][data-part="root"]');

        return {
          containerWidth: section.getBoundingClientRect().width,
          headerDisplay: getComputedStyle(header).display,
          largeHeading:
            getComputedStyle(heading).fontSize ===
            probe({ fontSize: "var(--text-heading-sm)" }).fontSize,
          badge: badge
            ? {
                variant: badge.getAttribute("data-variant") ?? "",
                text: badge.textContent?.trim() ?? "",
              }
            : null,
          services: items.map((item, index) => ({
            name: item.querySelector("h3")?.textContent?.trim() ?? "",
            tone:
              item
                .querySelector('[data-scope="indicator"][data-part="root"]')
                ?.getAttribute("data-variant") ?? "",
            bars: barRows[index]?.children.length ?? 0,
          })),
          serviceRowDisplays: items.map(
            (item) => getComputedStyle(item.querySelector("h3")!.parentElement!).display,
          ),
          perRow,
          barHeightRem: barRows[0] ? barRows[0].getBoundingClientRect().height / rootSize : null,
          barsPainted,
          allButtonsInert: buttons.length > 0 && buttons.every((button) => button.disabled),
          busyPlaceholders: busy ? busy.querySelectorAll('[data-scope="skeleton"]').length : 0,
          emptyCard:
            !list &&
            section
              .querySelector('[data-scope="card"][data-part="title"]')
              ?.textContent?.includes("No services yet") === true,
          failedLoad:
            !list &&
            alert?.getAttribute("data-variant") === "error" &&
            alert.querySelector('[data-scope="button"]')?.textContent?.includes("Try again") ===
              true,
        };
      });
    },
    { state, selector: BLOCK },
  );
}

async function textRatios(
  page: Page,
  state: "default" | "outage" | "empty" | "error",
): Promise<Record<string, number>> {
  await showState(page, state);
  return page.evaluate(
    ({ state, selector }) => {
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

      const block = document.querySelector(`[data-demo-state="${state}"] ${selector}`);
      if (!block) throw new Error(`the ${state} status-monitoring demo did not render`);

      const pick = (root: Element, css: string): Element => {
        const el = root.querySelector(css);
        if (!el) throw new Error(`${state}: missing ${css}`);
        return el;
      };
      const against = (el: Element) => ratio(getComputedStyle(el).color, surfaceOf(el));

      if (state === "empty") {
        return {
          "empty title": against(pick(block, '[data-scope="card"][data-part="title"]')),
          "empty description": against(pick(block, '[data-scope="card"][data-part="description"]')),
        };
      }
      if (state === "error") {
        return {
          "error title": against(pick(block, '[data-scope="alert"][data-part="title"]')),
          "error description": against(
            pick(block, '[data-scope="alert"][data-part="description"]'),
          ),
          "error retry": against(pick(block, '[data-scope="alert"] [data-scope="button"]')),
        };
      }

      const ratios: Record<string, number> = {
        [`${state} heading`]: against(pick(block, "h2")),
        [`${state} description`]: against(pick(block, "h2 + p")),
        [`${state} badge`]: against(pick(block, '[data-scope="badge"][data-part="root"]')),
        [`${state} action`]: against(pick(block, ':scope > div > div > [data-scope="button"]')),
      };
      // One entry per service, so a tone whose label is too light fails by name.
      for (const item of block.querySelectorAll("ul > li")) {
        const name = pick(item, "h3");
        const label = name.textContent?.trim() ?? "service";
        ratios[`${state} ${label} name`] = against(name);
        ratios[`${state} ${label} status`] = against(
          pick(item, '[data-scope="indicator"][data-part="label"]'),
        );
        for (const [index, span] of [...pick(item, '[role="img"] + p').children].entries()) {
          ratios[`${state} ${label} legend ${index}`] = against(span);
        }
      }
      return ratios;
    },
    { state, selector: BLOCK },
  );
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`status-monitoring — ${scheme}`, () => {
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
          const overSm = block.containerWidth >= CONTAINER_SM;
          const overMd = block.containerWidth >= CONTAINER_MD;
          const overLg = block.containerWidth >= CONTAINER_LG;

          expect(block.headerDisplay, `${where}: header row`).toBe(overSm ? "flex" : "grid");
          expect(block.largeHeading, `${where}: heading size`).toBe(overMd);
          for (const display of block.serviceRowDisplays) {
            expect(display, `${where}: name and status row`).toBe(overSm ? "flex" : "grid");
          }
          if (block.perRow !== null) {
            expect(block.perRow, `${where}: services a row`).toBe(overLg ? 2 : 1);
          }
          if (block.barHeightRem !== null) {
            expect(block.barHeightRem, `${where}: bar height`).toBe(overMd ? 2 : 1.5);
            expect(block.barsPainted, `${where}: bars painted from the status slots`).toBe(true);
          }

          const panel = await page.evaluate((state) => {
            const el = document
              .querySelector(`[data-demo-state="${state}"]`)!
              .closest(".preview-panel--demo") as HTMLElement;
            return { scroll: el.scrollWidth, client: el.clientWidth };
          }, state);
          expect(panel.scroll, `${where}: demo panel overflow`).toBeLessThanOrEqual(panel.client);
        }

        // The sample: the worst status wins the badge, one tone and 30 bars a service.
        const withServices = blocks.filter(
          (block) => block.state !== "outage" && block.services.length > 0,
        );
        expect(withServices.length, `${scheme} ${width}px: copies rendering the sample`).toBe(6);
        for (const block of withServices) {
          expect(block.badge).toEqual({ variant: "warning", text: "Degraded performance" });
          expect(block.services).toEqual(
            SAMPLE_SERVICES.map(({ name, tone }) => ({ name, tone, bars: 30 })),
          );
        }

        const outage = blocks.find((block) => block.state === "outage")!;
        expect(outage.badge, "an outage wins the badge").toEqual({
          variant: "error",
          text: "Service outage",
        });
        expect(outage.services.map((service) => service.tone)).toEqual(["error", "success"]);

        const byState = (state: State) => blocks.find((block) => block.state === state)!;
        expect(byState("empty").emptyCard, "the empty render").toBe(true);
        expect(byState("empty").badge, "no badge without services").toBeNull();
        expect(
          byState("loading").busyPlaceholders,
          "the loading render: four placeholder cards of three shapes",
        ).toBe(12);
        expect(byState("error").failedLoad, "the failed-load render").toBe(true);
        expect(byState("disabled").allButtonsInert, "the disabled render").toBe(true);
        expect(byState("default").allButtonsInert, "the default render is live").toBe(false);

        // Each step is exercised on both sides at every viewport.
        const widths = withServices.map((block) => block.containerWidth);
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

    test("clears AA contrast on every text it paints", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      let ratios: Record<string, number> = {};
      for (const state of ["default", "outage", "empty", "error"] as const) {
        ratios = { ...ratios, ...(await textRatios(page, state)) };
      }
      for (const measured of [
        "default badge",
        "default Webhooks status",
        "outage badge",
        "outage API status",
        "empty title",
        "error retry",
      ]) {
        expect(ratios[measured], `${scheme}: ${measured} measured`).toBeDefined();
      }
      for (const [what, ratio] of Object.entries(ratios)) {
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
      }
    });

    test("shows hover and focus-visible on its action", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const action = page
        .locator(`[data-demo-state="default"] ${BLOCK} [data-scope="button"]`)
        .filter({ hasText: "Subscribe to updates" });

      const background = () => action.evaluate((el) => getComputedStyle(el).backgroundColor);
      const resting = await background();
      await action.hover();
      expect(await background(), `${scheme}: hover background`).not.toBe(resting);

      await page.mouse.move(0, 0);
      await action.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const outline = await action.evaluate((el) => ({
        focused: el.matches(":focus-visible"),
        style: getComputedStyle(el).outlineStyle,
      }));
      expect(outline.focused, `${scheme}: keyboard focus`).toBe(true);
      expect(outline.style, `${scheme}: focus ring`).not.toBe("none");
    });

    test("names each service's bars as one image of its days", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const rows = page.locator(`[data-demo-state="default"] ${BLOCK} ul > li [role="img"]`);
      await expect(rows).toHaveCount(SAMPLE_SERVICES.length);
      for (const [index, { days }] of SAMPLE_SERVICES.entries()) {
        await expect(rows.nth(index)).toHaveAccessibleName(days);
      }

      await showState(page, "outage");
      const outage = page.locator(`[data-demo-state="outage"] ${BLOCK} ul > li [role="img"]`);
      await expect(outage.nth(1)).toHaveAccessibleName("Last 30 days: 12 operational, 18 no data");
    });

    test("announces the loading status once, not each placeholder", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const region = page.locator(`[data-demo-state="loading"] ${BLOCK} [role="status"]`);
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region).toContainText("Loading");
      const hidden = await region.evaluate((el) =>
        [...el.children]
          .filter((child) => !child.classList.contains("sr-only"))
          .every((child) => child.getAttribute("aria-hidden") === "true"),
      );
      expect(hidden).toBe(true);
    });
  });
}
