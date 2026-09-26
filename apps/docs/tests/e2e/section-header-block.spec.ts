/**
 * The section-header block, checked on the built docs page at the three widths
 * of the responsive policy (375 / 768 / 1280) in both colour schemes. It
 * asserts text and computed styles; CI adds the screenshots to the PR body.
 *
 * Four claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` the actions sit under
 *    the heading and the trail shows only its parent crumb; from it they share
 *    a row and the full trail shows. The page and section headings step up at
 *    `--container-md`, and the page heading and the description again at
 *    `--container-lg`. Every copy is measured against its own container width,
 *    so the narrow frame stays stacked at 1280 while the wide one has crossed
 *    all three steps.
 * 2. **Every variant and state renders what it claims**: a page header (h1,
 *    trail, status line), a section header on a rule (h2), a card header in a
 *    card (h3) with the card's body under it, inside the same card; a count of
 *    0 that disables only the outline action; placeholders
 *    in a busy region while loading; an alert with a retry when the details
 *    failed; and every button inert when disabled.
 * 3. **AA contrast** on every text it paints, per scheme.
 * 4. **Hover and focus-visible** reach a breadcrumb link and an action.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/section-header/";
const BLOCK = ".moderno-block-section-header";

/**
 * The page's previews (islands/SectionHeaderBlockDemo.svelte): the main
 * preview mounts the default page header; the Examples frame it at 18rem, 30rem
 * and 50rem, then mount the section and card variants and the empty, loading,
 * error and disabled states. Every copy is found by its wrapper's
 * `data-demo-state`.
 */
const STATES = [
  "default",
  "narrow",
  "panel",
  "wide",
  "section",
  "card",
  "empty",
  "loading",
  "error",
  "disabled",
] as const;
type State = (typeof STATES)[number];

/** The contract type steps a heading or a description can land on. */
const TYPE_STEPS = ["ui-md", "body", "body-lg", "heading-sm", "heading", "heading-lg"] as const;
type TypeStep = (typeof TYPE_STEPS)[number];

interface BlockMetrics {
  /** Width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** The `variant` the copy renders. */
  variant: string;
  /** `display` of the row holding the heading and the actions: `grid` stacked, `flex` once they line up. */
  rowDisplay: string;
  /** The heading's tag, or null while it loads. */
  headingTag: string | null;
  /** The contract step the heading's size resolves to. */
  headingStep: TypeStep | null;
  /** The contract step the description's size resolves to. */
  descriptionStep: TypeStep | null;
  /** How many crumbs the trail shows, and how many it holds. */
  crumbsShown: number;
  crumbs: number;
  /** The current page's crumb text, read from `aria-current="page"`. */
  currentCrumb: string | null;
  /** The status badge's variant, and the meta line's items. */
  status: string | null;
  meta: string[];
  /** The count badge's text. */
  count: string | null;
  /** Whether the copy sits on a bottom rule, or inside a Card. */
  rule: boolean;
  inCard: boolean;
  /** The block root's tag: a `header` bar, or a `div` holding a whole card. */
  rootTag: string;
  /** The rows of the card's body, rendered in Card.Content after the header. */
  cardBody: string[];
  /** The actions, in order, with whether each is disabled. */
  actions: { label: string; disabled: boolean }[];
  /** Placeholders inside a busy `status` region. */
  busyPlaceholders: number;
  /** The failed-load alert's variant and whether its retry is usable. */
  alert: string | null;
  retryEnabled: boolean | null;
}

async function showState(page: Page, state: State): Promise<void> {
  const block = page.locator(`[data-demo-state="${state}"] ${BLOCK}`);
  await block.scrollIntoViewIfNeeded();
  await block.waitFor({ state: "visible" });
}

async function blockMetrics(page: Page, state: State): Promise<BlockMetrics[]> {
  return page.evaluate(
    ({ state, selector, steps }) => {
      const panel = document.querySelector(`[data-demo-state="${state}"]`);
      if (!panel) throw new Error(`no preview for the ${state} state on the page`);
      return [...panel.querySelectorAll(selector)].map((header) => {
        // Each contract step, resolved the way the browser resolves it here.
        const stepSizes = steps.map((step) => {
          const probe = document.createElement("span");
          probe.style.fontSize = `var(--text-${step})`;
          header.append(probe);
          const size = getComputedStyle(probe).fontSize;
          probe.remove();
          return [step, size] as const;
        });
        const stepOf = (el: Element | null) =>
          el
            ? (stepSizes.find(([, size]) => size === getComputedStyle(el).fontSize)?.[0] ?? null)
            : null;

        const card = header.querySelector(':scope > [data-scope="card"][data-part="root"]');
        const shell = card
          ? card.querySelector(':scope > [data-part="header"]')
          : header.firstElementChild;
        const bar = shell?.firstElementChild;
        if (!shell || !bar) throw new Error("the section-header block did not render its markup");
        const row = [...bar.children].find(
          (child) => child.tagName === "DIV" && !child.matches('[data-scope="alert"]'),
        );
        if (!row) throw new Error("the section-header block rendered no heading row");

        const heading = row.querySelector("h1, h2, h3");
        const crumbs = [...bar.querySelectorAll('nav[aria-label="Breadcrumb"] li')];
        const busy = row.querySelector('[role="status"][aria-busy="true"]');
        const alert = bar.querySelector(':scope > [data-scope="alert"][data-part="root"]');
        const retry = alert?.querySelector<HTMLButtonElement>('[data-scope="button"]');
        const actions = [
          ...row.querySelectorAll<HTMLButtonElement>(
            ':scope > div:last-child > [data-scope="button"]',
          ),
        ];
        const statusLine = row.querySelector("ul");

        return {
          containerWidth: header.getBoundingClientRect().width,
          variant: header.getAttribute("data-variant") ?? "",
          rowDisplay: getComputedStyle(row).display,
          headingTag: heading?.tagName.toLowerCase() ?? null,
          headingStep: stepOf(heading),
          descriptionStep: stepOf(
            heading?.nextElementSibling?.matches("p") ? heading.nextElementSibling : null,
          ),
          crumbsShown: crumbs.filter((li) => getComputedStyle(li).display !== "none").length,
          crumbs: crumbs.length,
          currentCrumb: bar.querySelector('[aria-current="page"]')?.textContent?.trim() ?? null,
          status:
            statusLine
              ?.querySelector('[data-scope="badge"][data-part="root"]')
              ?.getAttribute("data-variant") ?? null,
          meta: statusLine
            ? [...statusLine.querySelectorAll(":scope > li:not(:has([data-scope]))")].map(
                (li) => li.textContent?.trim() ?? "",
              )
            : [],
          count: heading?.querySelector('[data-scope="badge"]')?.textContent?.trim() ?? null,
          rule: !card && parseFloat(getComputedStyle(shell).borderBottomWidth) > 0,
          inCard: card !== null,
          rootTag: header.tagName.toLowerCase(),
          cardBody: card
            ? [
                ...card.querySelectorAll(
                  ':scope > [data-part="header"] + [data-scope="card"][data-part="content"] li',
                ),
              ].map((li) => li.textContent?.replace(/\s+/g, " ").trim() ?? "")
            : [],
          actions: actions.map((button) => ({
            label: button.textContent?.trim() ?? "",
            disabled: button.disabled,
          })),
          busyPlaceholders: busy ? busy.querySelectorAll('[data-scope="skeleton"]').length : 0,
          alert: alert?.getAttribute("data-variant") ?? null,
          retryEnabled: retry
            ? !retry.disabled && retry.textContent?.includes("Try again") === true
            : null,
        };
      });
    },
    { state, selector: BLOCK, steps: [...TYPE_STEPS] },
  );
}

/** What the block's own rules say each copy should look like at its width. */
function expectedHeadingStep(variant: string, width: number): TypeStep {
  if (variant === "page") {
    if (width >= CONTAINER_LG) return "heading-lg";
    return width >= CONTAINER_MD ? "heading" : "heading-sm";
  }
  if (variant === "section") return width >= CONTAINER_MD ? "heading-sm" : "body-lg";
  return "body";
}

async function textRatios(
  page: Page,
  state: "default" | "section" | "card" | "error",
): Promise<Record<string, number>> {
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
      if (!block) throw new Error(`the ${state} section-header demo did not render`);
      const pick = (selector: string): Element => {
        const el = block.querySelector(selector);
        if (!el) throw new Error(`${state}: missing ${selector}`);
        return el;
      };
      const against = (el: Element) => ratio(getComputedStyle(el).color, surfaceOf(el));

      if (state === "error") {
        return {
          "failed title": against(pick('[data-scope="alert"][data-part="title"]')),
          "failed description": against(pick('[data-scope="alert"][data-part="description"]')),
          "failed retry": against(pick('[data-scope="alert"] [data-scope="button"]')),
        };
      }

      const heading = pick("h1, h2, h3");
      const ratios: Record<string, number> = {
        [`${state} heading`]: against(heading),
        [`${state} description`]: against(pick("h1 + p, h2 + p, h3 + p")),
      };
      const count = heading.querySelector('[data-scope="badge"]');
      if (count) ratios[`${state} count`] = against(count);
      for (const button of block.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')) {
        if (!button.disabled) ratios[`${state} ${button.textContent?.trim()}`] = against(button);
      }
      for (const crumb of block.querySelectorAll("nav li > a, nav li > [aria-current]")) {
        ratios[`crumb ${crumb.textContent?.trim()}`] = against(crumb);
      }
      const body = block.querySelector('[data-scope="card"][data-part="content"]');
      for (const item of block.querySelectorAll("ul > li")) {
        if (body?.contains(item)) continue;
        const badge = item.querySelector('[data-scope="badge"]');
        ratios[`meta ${item.textContent?.trim()}`] = against(badge ?? item);
      }
      for (const text of body?.querySelectorAll("li > span") ?? []) {
        ratios[`card body ${text.textContent?.trim()}`] = against(text);
      }
      return ratios;
    },
    { state, selector: BLOCK },
  );
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`section-header — ${scheme}`, () => {
    test.use({ colorScheme: scheme });

    for (const width of WIDTHS) {
      test(`lays itself out from its container at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1200 });
        await page.goto(PAGE, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready.then(() => true));

        expect(await page.evaluate(() => document.documentElement.classList.contains("dark"))).toBe(
          scheme === "dark",
        );

        const copies: Record<string, BlockMetrics> = {};
        for (const state of STATES) {
          await showState(page, state);
          const mounted = await blockMetrics(page, state);
          expect(mounted, `${state}: mounted copies`).toHaveLength(1);
          const block = mounted[0]!;
          copies[state] = block;
          const w = block.containerWidth;
          const where = `${scheme} ${width}px, ${state} (${w}px)`;

          expect(block.rowDisplay, `${where}: heading row`).toBe(
            w >= CONTAINER_SM ? "flex" : "grid",
          );
          if (block.headingStep !== null) {
            expect(block.headingStep, `${where}: heading size`).toBe(
              expectedHeadingStep(block.variant, w),
            );
          }
          if (block.descriptionStep !== null) {
            expect(block.descriptionStep, `${where}: description size`).toBe(
              w >= CONTAINER_LG ? "body" : "ui-md",
            );
          }
          if (block.crumbs > 0) {
            expect(block.crumbsShown, `${where}: crumbs shown`).toBe(
              w >= CONTAINER_SM ? block.crumbs : 1,
            );
          }

          const panel = await page.evaluate((state) => {
            const el = document
              .querySelector(`[data-demo-state="${state}"]`)!
              .closest(".preview-panel--demo") as HTMLElement;
            return { scroll: el.scrollWidth, client: el.clientWidth };
          }, state);
          expect(panel.scroll, `${where}: demo panel overflow`).toBeLessThanOrEqual(panel.client);
        }

        // The page header: an h1 under a three-crumb trail that ends on the
        // current page, with a success status and two facts after it.
        for (const state of ["default", "narrow", "panel", "wide", "disabled"] as const) {
          const block = copies[state]!;
          expect(block.variant, `${state}: variant`).toBe("page");
          expect(block.headingTag, `${state}: rank`).toBe("h1");
          expect(block.crumbs, `${state}: crumbs`).toBe(3);
          expect(block.currentCrumb, `${state}: current crumb`).toBe("Q3 redesign");
          expect(block.status, `${state}: status`).toBe("success");
          expect(block.meta, `${state}: meta`).toEqual(["Due Oct 14", "Owned by Ada Lovelace"]);
          expect(block.rule || block.inCard, `${state}: no frame of its own`).toBe(false);
          expect(block.rootTag, `${state}: root`).toBe("header");
        }
        expect(copies.default!.actions).toEqual([
          { label: "Share", disabled: false },
          { label: "New task", disabled: false },
        ]);

        // The section header sits on a rule; the card header sits in a card.
        const section = copies.section!;
        expect([section.variant, section.headingTag, section.rule, section.inCard]).toEqual([
          "section",
          "h2",
          true,
          false,
        ]);
        expect(section.count).toBe("12");
        expect(section.crumbs + section.meta.length, "no page-only parts").toBe(0);
        expect(section.actions.every((action) => !action.disabled)).toBe(true);
        const card = copies.card!;
        expect([card.variant, card.headingTag, card.rule, card.inCard]).toEqual([
          "card",
          "h3",
          false,
          true,
        ]);
        expect(card.count).toBe("8");
        // The card's body sits in the same card, under its header; the root is
        // no <header>, since it holds more than the header.
        expect(section.rootTag).toBe("header");
        expect(card.rootTag).toBe("div");
        expect(card.cardBody).toEqual([
          "Ada Lovelace Owner",
          "Grace Hopper Editor",
          "Alan Turing Viewer",
        ]);

        // Empty: the count reads 0, the outline action (it works on items) is
        // disabled, and the primary one stays usable — it adds the first item.
        const empty = copies.empty!;
        expect(empty.count).toBe("0");
        expect(empty.actions).toEqual([
          { label: "Export", disabled: true },
          { label: "New task", disabled: false },
        ]);

        // Loading: three placeholders in a busy region, no heading, no status.
        const loading = copies.loading!;
        expect(loading.headingTag).toBeNull();
        expect(loading.busyPlaceholders).toBe(3);
        expect(loading.status).toBeNull();
        expect(loading.actions.every((action) => action.disabled)).toBe(true);

        // Error: the heading stays, the status line goes, and the alert's retry
        // is the one usable control.
        const error = copies.error!;
        expect(error.headingTag).toBe("h1");
        expect(error.status).toBeNull();
        expect(error.alert).toBe("error");
        expect(error.retryEnabled).toBe(true);
        expect(error.actions.every((action) => action.disabled)).toBe(true);

        // Disabled: every button inert, nothing else missing.
        const disabled = copies.disabled!;
        expect(disabled.actions).toHaveLength(2);
        expect(disabled.actions.every((action) => action.disabled)).toBe(true);

        // Each step is exercised on both sides at every viewport.
        const widths = Object.values(copies)
          .filter((block) => block.variant === "page")
          .map((block) => block.containerWidth);
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
      for (const state of ["default", "section", "card", "error"] as const) {
        await showState(page, state);
        ratios = { ...ratios, ...(await textRatios(page, state)) };
      }
      for (const measured of [
        "default heading",
        "crumb Projects",
        "crumb Q3 redesign",
        "meta Active",
        "meta Due Oct 14",
        "default New task",
        "section count",
        "card heading",
        "card body Owner",
        "failed retry",
      ]) {
        expect(ratios[measured], `${scheme}: ${measured} measured`).toBeDefined();
      }
      for (const [what, ratio] of Object.entries(ratios)) {
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
      }
    });

    test("shows hover and focus-visible on a breadcrumb link and an action", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);

      for (const [what, target, property] of [
        ["breadcrumb link", block.locator("nav a").first(), "color"],
        ["outline action", block.locator('[data-scope="button"]').first(), "backgroundColor"],
      ] as const) {
        const read = () =>
          target.evaluate(
            (el, property) => getComputedStyle(el)[property as "color" | "backgroundColor"],
            property,
          );
        await page.mouse.move(0, 0);
        const resting = await read();
        await target.hover();
        // Polled: the colour eases in over the transition, it does not jump.
        await expect.poll(read, { message: `${scheme}: ${what} hover` }).not.toBe(resting);

        await page.mouse.move(0, 0);
        await target.focus();
        await page.keyboard.press("Shift+Tab");
        await page.keyboard.press("Tab");
        const outline = await target.evaluate((el) => ({
          focused: el.matches(":focus-visible"),
          style: getComputedStyle(el).outlineStyle,
        }));
        expect(outline.focused, `${scheme}: ${what} keyboard focus`).toBe(true);
        expect(outline.style, `${scheme}: ${what} focus ring`).not.toBe("none");
      }
    });
  });
}
