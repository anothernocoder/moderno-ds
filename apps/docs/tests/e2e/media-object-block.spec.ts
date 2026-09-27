/**
 * The media-object block, checked on the built docs page at the three widths
 * of the responsive policy (375 / 768 / 1280) in both colour schemes. It
 * asserts text and computed styles; no screenshot baseline is committed.
 *
 * Four claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` the avatar sits over
 *    the text; at `--container-sm` it moves beside the text, on the side
 *    `mediaPosition` names; at `--container-md` the heading and body step up a
 *    size; at `--container-lg` the meta moves to the far edge of the heading's
 *    line. Each copy on the page is measured against its own container width,
 *    so the narrow frame stays stacked at 1280 while the wide frame is split.
 * 2. **Every state renders what it claims**, at every width: the sample
 *    comment with its action, the avatar at the end, a muted line when there is
 *    no body, placeholders in a busy region while loading, one alert with a
 *    retry on a failed load, and an inert action when disabled.
 * 3. **AA contrast** in both schemes on every text the block paints.
 * 4. **Hover, focus-visible and naming**: the action reacts to hover and
 *    keyboard focus, keeps its label as its name and is described by the
 *    heading; the loading region is announced once.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/media-object/";

const BLOCK = "article.moderno-block-media-object";

/** The sample comment the block ships with. */
const SAMPLE_HEADING = "Ada Lovelace";

/** The note the docs page passes to the avatar-at-the-end example. */
const END_HEADING = "Grace Hopper";

type Placement = "over" | "start" | "end";

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** The heading's text, when the object is not loading. */
  heading: string | null;
  /** Where the avatar sits against the text column. */
  placement: Placement | null;
  /** Whether the heading is set at `--text-body-lg` rather than `--text-body`. */
  largeHeading: boolean | null;
  /** Whether the body is set at `--text-body` rather than `--text-ui-md`. */
  largeBody: boolean | null;
  /** Whether the meta sits on the heading's line, at the header's far edge. */
  metaBesideHeading: boolean | null;
  /** The action's label, when one renders. */
  action: string | null;
  /** Whether every button in this copy is disabled. */
  allButtonsInert: boolean;
  /** Skeletons inside a busy `status` region. */
  busyPlaceholders: number;
  /** Whether this copy renders the "Nothing written yet." line. */
  emptyMessage: boolean;
  /** Whether this copy renders the failed-load alert with its retry. */
  failedLoad: boolean;
}

/**
 * The page's previews (islands/MediaObjectBlockDemo.svelte): the main preview
 * mounts the default; the Examples frame the same block at 18rem, 30rem, 40rem
 * and 50rem, then mount the avatar-at-the-end, empty, loading, error and
 * disabled states. Every copy is found by the `data-demo-state` its wrapper
 * carries.
 */
const STATES = [
  "default",
  "narrow",
  "compact",
  "panel",
  "wide",
  "end",
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
      const panel = document.querySelector(`[data-demo-state="${state}"]`);
      if (!panel) throw new Error(`no preview for the ${state} state on the page`);

      return [...panel.querySelectorAll<HTMLElement>(selector)].map((article) => {
        const sizeOf = (token: string): string => {
          const probe = document.createElement("span");
          probe.style.fontSize = `var(${token})`;
          article.append(probe);
          const size = getComputedStyle(probe).fontSize;
          probe.remove();
          return size;
        };

        const heading = article.querySelector("h3");
        const avatar = article.querySelector('[data-scope="avatar"][data-part="root"]');
        const text = avatar?.nextElementSibling;
        const header = heading?.parentElement;
        const meta = header?.querySelector("p");
        const body = header?.nextElementSibling;
        const busy = article.querySelector('[role="status"][aria-busy="true"]');
        const alert = article.querySelector('[data-scope="alert"][data-part="root"]');
        const buttons = [...article.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];
        const action = buttons.find((button) => !alert?.contains(button));

        let placement: Placement | null = null;
        if (avatar && text) {
          const a = avatar.getBoundingClientRect();
          const t = text.getBoundingClientRect();
          if (a.bottom <= t.top + 1) placement = "over";
          else if (a.right <= t.left + 1) placement = "start";
          else if (a.left >= t.right - 1) placement = "end";
        }

        let metaBesideHeading: boolean | null = null;
        if (heading && header && meta) {
          const h = heading.getBoundingClientRect();
          const m = meta.getBoundingClientRect();
          const edge = header.getBoundingClientRect().right;
          metaBesideHeading =
            m.left >= h.right - 1 && m.top < h.bottom && Math.abs(m.right - edge) < 1;
        }

        const bodyIsText = body instanceof HTMLParagraphElement;

        return {
          containerWidth: article.getBoundingClientRect().width,
          heading: heading?.textContent?.trim() ?? null,
          placement,
          largeHeading: heading
            ? getComputedStyle(heading).fontSize === sizeOf("--text-body-lg")
            : null,
          largeBody:
            bodyIsText && body.textContent?.trim() !== "Nothing written yet."
              ? getComputedStyle(body).fontSize === sizeOf("--text-body")
              : null,
          metaBesideHeading,
          action: action?.textContent?.trim() ?? null,
          allButtonsInert: buttons.length > 0 && buttons.every((button) => button.disabled),
          busyPlaceholders: busy ? busy.querySelectorAll('[data-scope="skeleton"]').length : 0,
          emptyMessage: bodyIsText && body.textContent?.trim() === "Nothing written yet.",
          failedLoad:
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
  state: "default" | "end" | "empty" | "error",
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
      if (!block) throw new Error(`the ${state} media-object demo did not render`);

      const pick = (selector: string): Element => {
        const el = block.querySelector(selector);
        if (!el) throw new Error(`${state}: missing ${selector}`);
        return el;
      };
      const against = (el: Element) => ratio(getComputedStyle(el).color, surfaceOf(el));

      const ratios: Record<string, number> = {
        [`${state} heading`]: against(pick("h3")),
        [`${state} meta`]: against(pick("header p")),
        [`${state} initials`]: against(pick('[data-scope="avatar"][data-part="fallback"]')),
      };
      if (state === "error") {
        ratios["error title"] = against(pick('[data-scope="alert"][data-part="title"]'));
        ratios["error description"] = against(
          pick('[data-scope="alert"][data-part="description"]'),
        );
        ratios["error retry"] = against(pick('[data-scope="alert"] [data-scope="button"]'));
      } else {
        ratios[`${state} body`] = against(pick("header + p"));
        ratios[`${state} action`] = against(pick('[data-scope="button"]'));
      }
      return ratios;
    },
    { state, selector: BLOCK },
  );
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`media-object — ${scheme}`, () => {
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
          const block = { ...mounted[0]!, state };
          blocks.push(block);
          const where = `${scheme} ${width}px, ${state} (${block.containerWidth}px)`;

          if (state === "loading") {
            expect(block.heading, `${where}: no heading while loading`).toBeNull();
            expect(block.busyPlaceholders, `${where}: placeholders`).toBe(4);
          } else {
            const expected: Placement =
              block.containerWidth < CONTAINER_SM ? "over" : state === "end" ? "end" : "start";
            expect(block.placement, `${where}: avatar placement`).toBe(expected);
            expect(block.largeHeading, `${where}: heading size`).toBe(
              block.containerWidth >= CONTAINER_MD,
            );
            expect(block.metaBesideHeading, `${where}: meta beside heading`).toBe(
              block.containerWidth >= CONTAINER_LG,
            );
            expect(block.heading, `${where}: heading`).toBe(
              state === "end" ? END_HEADING : SAMPLE_HEADING,
            );
            if (block.largeBody !== null) {
              expect(block.largeBody, `${where}: body size`).toBe(
                block.containerWidth >= CONTAINER_MD,
              );
            }
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

        const byState = (state: State) => blocks.find((block) => block.state === state)!;
        for (const state of ["default", "narrow", "compact", "panel", "wide"] as const) {
          expect(byState(state).action, `${state}: the action`).toBe("Reply");
          expect(byState(state).largeBody, `${state}: a body renders`).not.toBeNull();
          expect(byState(state).allButtonsInert, `${state}: the action is live`).toBe(false);
        }
        expect(byState("end").action, "end: its own action").toBe("Open thread");
        expect(
          blocks.filter((block) => block.emptyMessage).map((block) => block.state),
          "the empty render",
        ).toEqual(["empty"]);
        expect(byState("empty").action, "empty: the action stays").toBe("Reply");
        expect(
          blocks.filter((block) => block.busyPlaceholders > 0).map((block) => block.state),
          "the loading render",
        ).toEqual(["loading"]);
        expect(
          blocks.filter((block) => block.failedLoad).map((block) => block.state),
          "the failed-load render",
        ).toEqual(["error"]);
        expect(byState("error").action, "error: the alert replaces the action").toBeNull();
        expect(
          blocks.filter((block) => block.allButtonsInert).map((block) => block.state),
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

    test("clears AA contrast on every text it paints", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      let ratios: Record<string, number> = {};
      for (const state of ["default", "end", "empty", "error"] as const) {
        ratios = { ...ratios, ...(await textRatios(page, state)) };
      }
      for (const measured of ["default body", "end action", "empty body", "error retry"]) {
        expect(ratios[measured], `${scheme}: ${measured} measured`).toBeDefined();
      }
      for (const [what, ratio] of Object.entries(ratios)) {
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
      }
    });

    test("shows hover and focus-visible on its action", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const action = page.locator(`[data-demo-state="default"] ${BLOCK} [data-scope="button"]`);

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

    test("names its action by its label and describes it by the heading", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      for (const [state, label, heading] of [
        ["default", "Reply", SAMPLE_HEADING],
        ["end", "Open thread", END_HEADING],
      ] as const) {
        await showState(page, state);
        const action = page.locator(`[data-demo-state="${state}"] ${BLOCK} [data-scope="button"]`);
        await expect(action).toHaveAccessibleName(label);
        await expect(action).toHaveAccessibleDescription(heading);
      }
      // Each copy describes its action by its own heading: ids never repeat.
      const ids = await page.evaluate(
        (selector) => [...document.querySelectorAll(`${selector} h3`)].map((h) => h.id),
        BLOCK,
      );
      expect(new Set(ids).size, "one heading id per copy").toBe(ids.length);
    });

    test("announces the loading object once, not each placeholder", async ({ page }) => {
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
