/**
 * The long-form content block, checked on the built docs page at the three
 * widths of the responsive policy (375 / 768 / 1280) in both colour schemes. It
 * asserts text and computed styles; no screenshot baseline is committed.
 *
 * Four claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` the lead is set at
 *    body size and the facts sit in two columns; at `--container-sm` the lead
 *    steps up and the pull-quote moves inward; at `--container-md` the heading
 *    and the quote step up a size and the facts go to one row; at
 *    `--container-lg` the facts move beside the story and the section gets
 *    more room above and below. The block never grows past `--container-lg`.
 *    Each copy on the page is measured against its own container width, so the
 *    narrow frame keeps its small sizes at 1280 while the wide frame has
 *    crossed every step.
 * 2. **Every state renders what it claims**, at every width: kicker, heading,
 *    lead, the facts, three sections, the pull-quote after the first one and
 *    the action by default; the empty message in place of the story; the
 *    placeholders in a busy region while loading; an error Alert with a retry
 *    in place of the facts and the story; an inert action when disabled. Every
 *    copy is centred in its box.
 * 3. **AA contrast** in both schemes on every text the block paints.
 * 4. **Hover and focus-visible** on the action.
 *
 * It also checks that an empty `error` string counts as no error: the case
 * study comes back, with no alert.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/long-form-content/";

const BLOCK = "section.moderno-block-long-form-content";

/** The copy the block ships with. */
const KICKER = "Case study";
const HEADING = "How Northwind closes its books in a day";
const FACTS = ["Client", "Industry", "Team", "Timeline"];
const FACT_VALUES = ["Northwind Studio", "Architecture", "12 people", "Six weeks"];
const SECTIONS = ["The challenge", "Our approach", "The outcome"];
const PARAGRAPHS = 5;
const QUOTE_AUTHOR = "Maya Lindqvist";
const QUOTE_ROLE = "Operations lead, Northwind Studio";
const QUOTE_INITIALS = "ML";
const ACTION = "Read the next case study";
const EMPTY = "This case study has no story yet.";
const ERROR = "We could not load this case study.";

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** Width of the article, in px. */
  articleWidth: number;
  /** The kicker's text, or null. */
  kicker: string | null;
  /** The heading's text. */
  heading: string | null;
  /** The heading's font size, in px. */
  headingSize: number | null;
  /** Whether the heading is set in the contract's `--font-serif`. */
  serifHeading: boolean | null;
  /** The lead's font size, in px. */
  leadSize: number | null;
  /** The facts' labels (`dt`), in order. */
  facts: string[];
  /** The facts' values (`dd`), in order. */
  factValues: string[];
  /** How many columns the facts sit in: distinct left edges of the facts. */
  factColumns: number;
  /** Whether the facts sit beside the story (left of it, sharing its top band). */
  factsBeside: boolean | null;
  /** The section headings, in order. */
  sections: string[];
  /** Paragraphs across every section. */
  paragraphs: number;
  /** The section heading right before the pull-quote, or null. */
  quoteAfter: string | null;
  /** The quote's author, or null when there is no quote. */
  quoteAuthor: string | null;
  /** The quote author's role. */
  quoteRole: string | null;
  /** The initials in the quote's Avatar. */
  quoteInitials: string | null;
  /** Whether the quote is set in `--font-serif`. */
  serifQuote: boolean | null;
  /** The quote's font size, in px. */
  quoteSize: number | null;
  /** The quote's inset from its rule, in px. */
  quoteInset: number | null;
  /** The empty message, or null. */
  empty: string | null;
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
  /** Horizontal offset between the article's centre and the block's, in px. */
  offCentre: number;
}

/**
 * The page's previews (islands/LongFormContentBlockDemo.svelte): the main
 * preview mounts the default; the Examples frame the same block at 18rem,
 * 30rem, 40rem and 50rem, then mount the empty, loading, error and disabled
 * states. Every copy is found by the `data-demo-state` its wrapper carries.
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
      const size = (el: Element | null) => (el ? parseFloat(getComputedStyle(el).fontSize) : null);
      const isSerif = (el: Element | null) =>
        el ? normalise(getComputedStyle(el).fontFamily) === serif : null;
      const text = (el: Element | null | undefined) => el?.textContent?.trim() ?? null;

      return [...wrapper.querySelectorAll<HTMLElement>(selector)].map((section) => {
        const body = section.firstElementChild as HTMLElement | null;
        const article = section.querySelector("article");
        if (!body || !article) {
          throw new Error("the long-form content block did not render its own markup");
        }

        const heading = article.querySelector("header h2");
        const kicker = heading?.previousElementSibling ?? null;
        const lead = heading?.nextElementSibling ?? null;
        const busy = section.querySelector('[role="status"][aria-busy="true"]');
        const list = article.querySelector("dl");
        const facts = list ? [...list.querySelectorAll<HTMLElement>(":scope > div")] : [];
        const figure = article.querySelector("figure");
        const story = [...article.querySelectorAll("h3")][0]?.parentElement?.parentElement ?? null;
        const buttons = [...section.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];
        const empty = article.querySelector("p.border-dashed");
        const blockBox = section.getBoundingClientRect();
        const articleBox = article.getBoundingClientRect();

        let factsBeside: boolean | null = null;
        const storyLike = story ?? empty?.parentElement ?? null;
        if (list && storyLike) {
          const listBox = list.getBoundingClientRect();
          const storyBox = storyLike.getBoundingClientRect();
          factsBeside = listBox.right <= storyBox.left && listBox.top < storyBox.bottom;
        }

        return {
          containerWidth: section.offsetWidth,
          articleWidth: articleBox.width,
          kicker: text(kicker),
          heading: text(heading),
          headingSize: size(heading),
          serifHeading: isSerif(heading),
          leadSize: size(lead),
          facts: facts.map((fact) => text(fact.querySelector("dt")) ?? ""),
          factValues: facts.map((fact) => text(fact.querySelector("dd")) ?? ""),
          factColumns: new Set(facts.map((fact) => Math.round(fact.getBoundingClientRect().left)))
            .size,
          factsBeside,
          sections: [...article.querySelectorAll("h3")].map((h) => text(h) ?? ""),
          paragraphs: article.querySelectorAll("h3 ~ p").length,
          quoteAfter: text(figure?.previousElementSibling?.querySelector("h3")),
          quoteAuthor: text(figure?.querySelector("figcaption p")),
          quoteRole: text(figure?.querySelector("figcaption p + p")),
          quoteInitials: text(
            figure?.querySelector('[data-scope="avatar"] [data-part="fallback"]'),
          ),
          serifQuote: isSerif(figure?.querySelector("blockquote") ?? null),
          quoteSize: size(figure?.querySelector("blockquote") ?? null),
          quoteInset: figure ? parseFloat(getComputedStyle(figure).paddingLeft) : null,
          empty: text(empty),
          paddingTop: parseFloat(getComputedStyle(body).paddingTop),
          actions: buttons.map((b) => b.textContent?.trim() ?? ""),
          actionVariants: buttons.map((b) => b.getAttribute("data-variant") ?? ""),
          allActionsInert: buttons.length > 0 && buttons.every((b) => b.disabled),
          placeholders: busy ? busy.querySelectorAll('[data-scope="skeleton"]').length : 0,
          alert: section.querySelector('[data-scope="alert"][role="alert"]') !== null,
          offCentre: Math.abs(
            articleBox.left + articleBox.width / 2 - (blockBox.left + blockBox.width / 2),
          ),
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
      const parts: Array<[string, Element | null]> = [
        ["kicker", block.querySelector("h2")?.previousElementSibling ?? null],
        ["heading", block.querySelector("h2")],
        ["lead", block.querySelector("h2 + p")],
        ["quote", block.querySelector("figure blockquote")],
        ["quote author", block.querySelector("figure figcaption p")],
        ["quote role", block.querySelector("figure figcaption p + p")],
        [
          "quote initials",
          block.querySelector('figure [data-scope="avatar"] [data-part="fallback"]'),
        ],
        ["empty message", block.querySelector("p.border-dashed")],
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
      for (const fact of block.querySelectorAll("dl > div")) {
        const name = fact.querySelector("dt")?.textContent?.trim() ?? "fact";
        ratios[`${state} ${name} label`] = against(fact.querySelector("dt")!);
        ratios[`${state} ${name} value`] = against(fact.querySelector("dd")!);
      }
      for (const title of block.querySelectorAll("h3")) {
        const name = title.textContent?.trim() ?? "section";
        ratios[`${state} ${name} heading`] = against(title);
        title.parentElement!.querySelectorAll("h3 ~ p").forEach((paragraph, index) => {
          ratios[`${state} ${name} paragraph ${index + 1}`] = against(paragraph);
        });
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
  test.describe(`long-form content — ${scheme}`, () => {
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
          const wide = block.containerWidth >= CONTAINER_LG;

          expect(block.paddingTop, `${where}: room above`).toBe(wide ? 80 : 48);
          expect(block.articleWidth, `${where}: article capped`).toBeLessThanOrEqual(CONTAINER_LG);
          expect(block.offCentre, `${where}: centred`).toBeLessThan(1);
          expect(block.alert, `${where}: error announced`).toBe(state === "error");
          expect(block.kicker, `${where}: kicker`).toBe(KICKER);
          expect(block.heading, `${where}: heading`).toBe(HEADING);
          expect(block.serifHeading, `${where}: serif heading`).toBe(true);

          if (state === "loading") {
            expect(block.placeholders, `${where}: placeholders`).toBe(12);
            expect(block.facts, `${where}: no facts while loading`).toEqual([]);
            expect(block.sections, `${where}: no sections while loading`).toEqual([]);
            expect(block.quoteAuthor, `${where}: no quote while loading`).toBeNull();
            expect(block.actions, `${where}: no action while loading`).toEqual([]);
          } else if (state === "error") {
            expect(block.facts, `${where}: no facts`).toEqual([]);
            expect(block.sections, `${where}: no sections`).toEqual([]);
            expect(block.quoteAuthor, `${where}: no quote`).toBeNull();
            expect(block.actions, `${where}: retry only`).toEqual(["Try again"]);
            expect(block.actionVariants, `${where}: retry variant`).toEqual(["outline"]);
          } else {
            expect(block.facts, `${where}: facts`).toEqual(FACTS);
            expect(block.factValues, `${where}: fact values`).toEqual(FACT_VALUES);
            expect(block.factColumns, `${where}: fact columns`).toBe(
              wide ? 1 : block.containerWidth >= CONTAINER_MD ? 4 : 2,
            );
            expect(block.factsBeside, `${where}: facts beside the story`).toBe(wide);

            if (state === "empty") {
              expect(block.empty, `${where}: empty message`).toBe(EMPTY);
              expect(block.sections, `${where}: no sections`).toEqual([]);
              expect(block.quoteAuthor, `${where}: no quote`).toBeNull();
              expect(block.actions, `${where}: no action`).toEqual([]);
            } else {
              expect(block.sections, `${where}: sections`).toEqual(SECTIONS);
              expect(block.paragraphs, `${where}: paragraphs`).toBe(PARAGRAPHS);
              expect(block.quoteAfter, `${where}: quote after the first section`).toBe(SECTIONS[0]);
              expect(block.quoteAuthor, `${where}: quote author`).toBe(QUOTE_AUTHOR);
              expect(block.quoteRole, `${where}: quote role`).toBe(QUOTE_ROLE);
              expect(block.quoteInitials, `${where}: quote avatar`).toBe(QUOTE_INITIALS);
              expect(block.serifQuote, `${where}: serif quote`).toBe(true);
              expect(block.quoteInset, `${where}: quote inset`).toBe(
                block.containerWidth >= CONTAINER_SM ? 24 : 16,
              );
              expect(block.empty, `${where}: no empty message`).toBeNull();
              expect(block.actions, `${where}: action`).toEqual([ACTION]);
              expect(block.actionVariants, `${where}: variant`).toEqual(["outline"]);
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

        expect(
          blocks.filter((block) => block.allActionsInert).map((block) => block.state),
          "the disabled render",
        ).toEqual(["disabled"]);

        // Each size steps up at its own contract width: one size below the
        // step, one larger size from it on.
        const withQuote = blocks.filter((b) => b.quoteSize !== null);
        for (const [what, step, measured, read] of [
          ["lead", CONTAINER_SM, blocks, (b: BlockMetrics) => b.leadSize],
          ["heading", CONTAINER_MD, blocks, (b: BlockMetrics) => b.headingSize],
          ["quote", CONTAINER_MD, withQuote, (b: BlockMetrics) => b.quoteSize],
        ] as const) {
          const below = new Set(measured.filter((b) => b.containerWidth < step).map(read));
          const above = new Set(measured.filter((b) => b.containerWidth >= step).map(read));
          expect(below.size, `one ${what} size below ${step}px`).toBe(1);
          expect(above.size, `one ${what} size from ${step}px`).toBe(1);
          expect([...above][0]!, `${what} steps up at ${step}px`).toBeGreaterThan([...below][0]!);
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
            const article = wrapper.querySelector(`${selector} article`)!.getBoundingClientRect();
            return {
              above: article.top - panel.top,
              below: panel.bottom - article.bottom,
              before: article.left - panel.left,
              after: panel.right - article.right,
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
        "default kicker",
        "default heading",
        "default lead",
        ...FACTS.flatMap((fact) => [`default ${fact} label`, `default ${fact} value`]),
        ...SECTIONS.flatMap((section) => [
          `default ${section} heading`,
          `default ${section} paragraph 1`,
        ]),
        "default quote",
        "default quote author",
        "default quote role",
        "default quote initials",
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
      const button = page.locator(`[data-demo-state="default"] ${BLOCK} [data-scope="button"]`);
      await expect(button).toHaveCount(1);
      await expect(button).toHaveAccessibleName(ACTION);

      // The outline action takes the --accent fill on hover.
      const surface = () => button.evaluate((el) => getComputedStyle(el).backgroundColor);
      await page.mouse.move(0, 0);
      const resting = await surface();
      await button.hover();
      expect(await surface(), `${scheme}: hover`).not.toBe(resting);

      await page.mouse.move(0, 0);
      await button.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const outline = await button.evaluate((el) => ({
        focused: el.matches(":focus-visible"),
        style: getComputedStyle(el).outlineStyle,
      }));
      expect(outline.focused, `${scheme}: keyboard focus`).toBe(true);
      expect(outline.style, `${scheme}: focus ring`).not.toBe("none");
    });

    test("announces the loading case study once and the failed load as an alert", async ({
      page,
    }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const region = page.locator(`[data-demo-state="loading"] ${BLOCK} [role="status"]`);
      await expect(region).toHaveCount(1);
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region).toContainText("Loading the case study");
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
      await expect(block.locator("dl dt")).toHaveText(FACTS);
      await expect(block.locator("article h3")).toHaveText(SECTIONS);
      await expect(block.locator("figure figcaption p").first()).toHaveText(QUOTE_AUTHOR);
      await expect(block.locator('[data-scope="button"]')).toHaveText([ACTION]);
    });
  });
}
