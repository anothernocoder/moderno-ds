/**
 * The reviews block, checked on the built docs page at the three widths of the
 * responsive policy (375 / 768 / 1280) in both colour schemes. It asserts text
 * and computed styles; no screenshot baseline is committed.
 *
 * Four claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` everything stacks in
 *    one column with the reviews at the small size; from `--container-sm` the
 *    reviews read a size larger; from `--container-md` the average sits beside
 *    the bars and the heading steps up a size; from `--container-lg` the
 *    summary moves into a column beside the reviews, with more room between
 *    the columns and above the section. Each copy on the page is measured
 *    against its own container width, so the narrow frame keeps one column at
 *    1280 while the wide frame has crossed every step.
 * 2. **Every state renders what it claims**, at every width: heading, average,
 *    stars, one bar per rating and three review cards by default; the empty
 *    message in place of the summary and the reviews; placeholders in a busy
 *    region while loading; an error Alert with a retry in place of the
 *    reviews; and disabled buttons when disabled. Every copy is centred in its
 *    box.
 * 3. **AA contrast** in both schemes on every text the block paints, and 3:1
 *    on the stars against their surface and on each bar against its track.
 * 4. **Hover and focus-visible** on "Write a review", and none on a disabled
 *    one.
 *
 * It also checks that an empty `error` string counts as no error: the reviews
 * come back, with no alert.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/reviews/";

const BLOCK = "section.moderno-block-reviews";

/** The copy the block ships with. */
const HEADING = "Customer reviews";
const AVERAGE = "4.4 out of 5 stars";
const BASED_ON = "Based on 132 reviews";
const BAR_LABELS = ["5 stars", "4 stars", "3 stars", "2 stars", "1 star"];
const BAR_VALUES = ["65%", "21%", "8%", "4%", "2%"];
const AUTHORS = ["Camila Restrepo", "Julián Torres", "Marcela Gómez"];
const INITIALS = ["CR", "JT", "MG"];
const DATES = ["June 3, 2026", "May 22, 2026", "May 8, 2026"];
const RATINGS = ["5 out of 5 stars", "4 out of 5 stars", "5 out of 5 stars"];
/** Filled stars per review, then in the summary (4.4 rounds to four). */
const FILLED = [5, 4, 5];
const SUMMARY_FILLED = 4;
/** The first two sample reviews are verified purchases. */
const VERIFIED = ["Verified purchase", "Verified purchase", ""];
const WRITE = "Write a review";
const EMPTY = "No reviews yet. Be the first to write one.";
const ERROR = "We could not load the reviews.";

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  heading: string | null;
  headingSize: number | null;
  serifHeading: boolean | null;
  /** Columns of the block's outer grid (summary and reviews). */
  columns: number;
  /** The gap between those columns, in px. */
  columnGap: number;
  /** Whether the reviews column spans every column after the summary's. */
  reviewsSpan: boolean;
  /** Columns of the summary's own grid (average and bars). */
  summaryColumns: number;
  /** The average as read out (visible number plus its hidden unit). */
  average: string | null;
  /** Filled stars in the summary's row. */
  summaryFilled: number;
  basedOn: string | null;
  barLabels: string[];
  barValues: string[];
  /** Each bar's `aria-label` and `aria-valuenow`. */
  barNames: string[];
  barNow: string[];
  /** Whether every bar's range is as wide as its value says, within 1%. */
  barsFilled: boolean;
  /** Review cards, each a Card inside a list item. */
  cards: number;
  authors: string[];
  initials: string[];
  dates: string[];
  ratings: string[];
  filled: number[];
  badges: string[];
  /** One entry per distinct review-text size, in px. */
  textSizes: number[];
  /** The block's padding above its content, in px. */
  paddingTop: number;
  empty: string | null;
  buttons: string[];
  buttonVariants: string[];
  disabledButtons: string[];
  placeholderCards: number;
  /** Whether the summary's placeholders are hidden from assistive tech. */
  summaryPlaceholdersHidden: boolean;
  alert: boolean;
  /** Horizontal offset between the content's centre and the block's, in px. */
  offCentre: number;
}

/**
 * The page's previews (islands/ReviewsBlockDemo.svelte): the main preview
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

async function blockMetrics(page: Page, state: State): Promise<BlockMetrics[]> {
  return page.evaluate(
    ({ state, selector }) => {
      const wrapper = document.querySelector(`[data-demo-state="${state}"]`);
      if (!wrapper) throw new Error(`no preview for the ${state} state on the page`);
      const normalise = (family: string) => family.replace(/["'\s]/g, "");
      const serif = normalise(
        getComputedStyle(document.documentElement).getPropertyValue("--font-serif"),
      );
      const text = (el: Element | null | undefined) =>
        el?.textContent?.replace(/\s+/g, " ").trim() ?? "";
      const filledStars = (row: Element | null | undefined) =>
        row ? row.querySelectorAll('svg[fill="currentColor"]').length : 0;

      return [...wrapper.querySelectorAll<HTMLElement>(selector)].map((section) => {
        const body = section.firstElementChild as HTMLElement | null;
        const summaryColumn = body?.children[0] as HTMLElement | undefined;
        const reviewsColumn = body?.children[1] as HTMLElement | undefined;
        if (!body || !summaryColumn || !reviewsColumn)
          throw new Error("the reviews block did not render its own markup");

        const heading = section.querySelector("h2");
        const bars = [
          ...section.querySelectorAll<HTMLElement>('[data-scope="progress"][data-part="root"]'),
        ];
        const summary = bars[0]?.parentElement?.parentElement ?? null;
        const averageLine = summary?.querySelector("p.font-serif") ?? null;
        const summaryStars = averageLine?.nextElementSibling?.firstElementChild ?? null;
        const cards = [
          ...section.querySelectorAll<HTMLElement>(
            'ul > li > [data-scope="card"][data-part="root"]',
          ),
        ];
        const busy = section.querySelector('[role="status"][aria-busy="true"]');
        const buttons = [...section.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];
        const empty = section.querySelector("p.border-dashed");
        const blockBox = section.getBoundingClientRect();
        const bodyBox = body.getBoundingClientRect();
        const bodyStyle = getComputedStyle(body);
        const summaryPlaceholders = summaryColumn.querySelectorAll('[data-scope="skeleton"]');

        return {
          containerWidth: section.offsetWidth,
          heading: heading ? text(heading) : null,
          headingSize: heading ? parseFloat(getComputedStyle(heading).fontSize) : null,
          serifHeading: heading ? normalise(getComputedStyle(heading).fontFamily) === serif : null,
          columns: bodyStyle.gridTemplateColumns.split(" ").filter(Boolean).length,
          columnGap: parseFloat(bodyStyle.columnGap),
          reviewsSpan:
            Math.abs(
              reviewsColumn.getBoundingClientRect().right -
                (bodyBox.right - parseFloat(bodyStyle.paddingRight)),
            ) < 1,
          summaryColumns: summary
            ? getComputedStyle(summary).gridTemplateColumns.split(" ").filter(Boolean).length
            : 0,
          average: averageLine ? text(averageLine) : null,
          summaryFilled: filledStars(summaryStars),
          basedOn: summary ? text(summary.querySelector("p.text-ui-sm")) : null,
          barLabels: bars.map((bar) => text(bar.querySelector('[data-part="label"]'))),
          barValues: bars.map((bar) => text(bar.querySelector('[data-part="value-text"]'))),
          barNames: bars.map(
            (bar) => bar.querySelector('[data-part="track"]')?.getAttribute("aria-label") ?? "",
          ),
          barNow: bars.map(
            (bar) => bar.querySelector('[data-part="track"]')?.getAttribute("aria-valuenow") ?? "",
          ),
          barsFilled: bars.every((bar) => {
            const track = bar.querySelector('[data-part="track"]')!.getBoundingClientRect();
            const range = bar.querySelector('[data-part="range"]')!.getBoundingClientRect();
            const now = Number(
              bar.querySelector('[data-part="track"]')!.getAttribute("aria-valuenow"),
            );
            return Math.abs((range.width / track.width) * 100 - now) <= 1;
          }),
          cards: cards.length,
          authors: cards.map((card) => text(card.querySelector("p.font-semibold"))),
          initials: cards.map((card) =>
            text(card.querySelector('[data-scope="avatar"][data-part="fallback"]')),
          ),
          dates: cards.map((card) => text(card.querySelector('[role="img"] + p'))),
          ratings: cards.map(
            (card) => card.querySelector('[role="img"]')?.getAttribute("aria-label") ?? "",
          ),
          filled: cards.map((card) => filledStars(card.querySelector('[role="img"]'))),
          badges: cards.map((card) => text(card.querySelector('[data-scope="badge"]'))),
          textSizes: [
            ...new Set(
              cards.map((card) => {
                const content = card.querySelector('[data-part="content"] > p');
                return content ? parseFloat(getComputedStyle(content).fontSize) : 0;
              }),
            ),
          ],
          paddingTop: parseFloat(bodyStyle.paddingTop),
          empty: empty ? text(empty) : null,
          buttons: buttons.map((b) => text(b)),
          buttonVariants: buttons.map((b) => b.getAttribute("data-variant") ?? ""),
          disabledButtons: buttons.filter((b) => b.disabled).map((b) => text(b)),
          placeholderCards: busy
            ? [...busy.querySelectorAll('[data-scope="card"][data-part="root"]')].filter(
                (card) => card.querySelector('[data-scope="skeleton"]') !== null,
              ).length
            : 0,
          summaryPlaceholdersHidden:
            summaryPlaceholders.length > 0 &&
            [...summaryPlaceholders].every((el) => el.closest('[aria-hidden="true"]') !== null),
          alert: section.querySelector('[data-scope="alert"][role="alert"]') !== null,
          offCentre: Math.abs(
            bodyBox.left + bodyBox.width / 2 - (blockBox.left + blockBox.width / 2),
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
      const ratios: Record<string, number> = {};
      const measure = (name: string, el: Element | null) => {
        if (el) ratios[`${state} ${name}`] = against(el);
      };

      measure("heading", block.querySelector("h2"));
      measure("average", block.querySelector("p.font-serif.text-heading-lg"));
      measure("based on", block.querySelector("p.font-serif.text-heading-lg + div p"));
      measure("share heading", block.querySelector("h3"));
      measure("share sentence", block.querySelector("h3 + p"));
      measure("empty message", block.querySelector("p.border-dashed"));
      measure("alert title", block.querySelector('[data-scope="alert"] [data-part="title"]'));
      measure(
        "alert description",
        block.querySelector('[data-scope="alert"] [data-part="description"]'),
      );
      block.querySelectorAll("p.font-serif.text-heading-lg + div svg").forEach((star, index) => {
        ratios[`${state} summary star ${index + 1}`] = against(star);
      });
      for (const bar of block.querySelectorAll('[data-scope="progress"][data-part="root"]')) {
        const label = bar.querySelector('[data-part="label"]')!;
        const name = label.textContent?.trim() ?? "bar";
        measure(`${name} label`, label);
        measure(`${name} value`, bar.querySelector('[data-part="value-text"]'));
        // Non-text contrast (WCAG 1.4.11): the filled part against its track.
        ratios[`${state} ${name} bar`] = ratio(
          getComputedStyle(bar.querySelector('[data-part="range"]')!).backgroundColor,
          getComputedStyle(bar.querySelector('[data-part="track"]')!).backgroundColor,
        );
      }
      for (const card of block.querySelectorAll('ul > li > [data-scope="card"]')) {
        const author = card.querySelector("p.font-semibold")!;
        const name = author.textContent?.trim() ?? "author";
        measure(`${name} name`, author);
        measure(
          `${name} initials`,
          card.querySelector('[data-scope="avatar"][data-part="fallback"]'),
        );
        measure(`${name} badge`, card.querySelector('[data-scope="badge"]'));
        measure(`${name} date`, card.querySelector('[role="img"] + p'));
        measure(`${name} text`, card.querySelector('[data-part="content"] > p'));
        card.querySelectorAll('[role="img"] svg').forEach((star, index) => {
          ratios[`${state} ${name} star ${index + 1}`] = against(star);
        });
      }
      for (const button of block.querySelectorAll('[data-scope="button"]')) {
        measure(`${button.textContent?.trim() ?? "button"} button`, button);
      }
      return ratios;
    },
    { state, selector: BLOCK },
  );
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`reviews — ${scheme}`, () => {
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

          expect(block.paddingTop, `${where}: room above`).toBe(wide ? 64 : 48);
          expect(block.columns, `${where}: columns`).toBe(wide ? 3 : 1);
          expect(block.columnGap, `${where}: gap between columns`).toBe(wide ? 48 : 40);
          expect(block.reviewsSpan, `${where}: reviews reach the end`).toBe(true);
          expect(block.offCentre, `${where}: centred`).toBeLessThan(1);
          expect(block.alert, `${where}: error announced`).toBe(state === "error");
          expect(block.heading, `${where}: heading`).toBe(HEADING);
          expect(block.serifHeading, `${where}: serif heading`).toBe(true);
          expect(block.buttons[0], `${where}: write a review`).toBe(WRITE);
          expect(block.buttonVariants, `${where}: outline buttons`).toEqual(
            block.buttons.map(() => "outline"),
          );
          expect(block.disabledButtons, `${where}: disabled buttons`).toEqual(
            state === "disabled" ? [WRITE] : [],
          );

          if (state === "loading") {
            expect(block.placeholderCards, `${where}: placeholder cards`).toBe(3);
            expect(block.summaryPlaceholdersHidden, `${where}: hidden summary`).toBe(true);
            expect(block.barLabels, `${where}: no bars while loading`).toEqual([]);
            expect(block.cards, `${where}: no reviews while loading`).toBe(0);
            expect(block.buttons, `${where}: write only`).toEqual([WRITE]);
          } else if (state === "empty") {
            expect(block.empty, `${where}: empty message`).toBe(EMPTY);
            expect(block.average, `${where}: no average`).toBeNull();
            expect(block.barLabels, `${where}: no bars`).toEqual([]);
            expect(block.cards, `${where}: no reviews`).toBe(0);
            expect(block.buttons, `${where}: write only`).toEqual([WRITE]);
          } else if (state === "error") {
            expect(block.average, `${where}: no average`).toBeNull();
            expect(block.barLabels, `${where}: no bars`).toEqual([]);
            expect(block.cards, `${where}: no reviews`).toBe(0);
            expect(block.buttons, `${where}: write and retry`).toEqual([WRITE, "Try again"]);
          } else {
            const sideBySide = block.containerWidth >= CONTAINER_MD && !wide;
            expect(block.summaryColumns, `${where}: average beside bars`).toBe(sideBySide ? 2 : 1);
            expect(block.average, `${where}: average`).toBe(AVERAGE);
            expect(block.summaryFilled, `${where}: summary stars`).toBe(SUMMARY_FILLED);
            expect(block.basedOn, `${where}: review count`).toBe(BASED_ON);
            expect(block.barLabels, `${where}: bar labels`).toEqual(BAR_LABELS);
            expect(block.barValues, `${where}: bar values`).toEqual(BAR_VALUES);
            expect(block.barNames, `${where}: bar names`).toEqual(BAR_LABELS);
            expect(block.barNow, `${where}: bar values read out`).toEqual(
              BAR_VALUES.map((value) => value.replace("%", "")),
            );
            expect(block.barsFilled, `${where}: bars filled to their share`).toBe(true);
            expect(block.cards, `${where}: one card per review`).toBe(AUTHORS.length);
            expect(block.authors, `${where}: authors`).toEqual(AUTHORS);
            expect(block.initials, `${where}: avatar initials`).toEqual(INITIALS);
            expect(block.dates, `${where}: dates`).toEqual(DATES);
            expect(block.ratings, `${where}: ratings read out`).toEqual(RATINGS);
            expect(block.filled, `${where}: filled stars`).toEqual(FILLED);
            expect(block.badges, `${where}: verified badges`).toEqual(VERIFIED);
            expect(block.textSizes, `${where}: one text size`).toHaveLength(1);
            expect(block.empty, `${where}: no empty message`).toBeNull();
            expect(block.buttons, `${where}: write only`).toEqual([WRITE]);
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

        // A step is one size below it and one larger size from it on.
        function stepsUp(sizes: Array<[number, number | null]>, step: number, what: string) {
          const below = new Set(sizes.filter(([w]) => w < step).map(([, s]) => s));
          const above = new Set(sizes.filter(([w]) => w >= step).map(([, s]) => s));
          expect(below.size, `one ${what} size below ${step}px`).toBe(1);
          expect(above.size, `one ${what} size from ${step}px`).toBe(1);
          expect([...above][0]!, `${what} steps up at ${step}px`).toBeGreaterThan([...below][0]!);
        }
        stepsUp(
          blocks.map((b) => [b.containerWidth, b.headingSize]),
          CONTAINER_MD,
          "heading",
        );
        stepsUp(
          blocks.filter((b) => b.cards > 0).map((b) => [b.containerWidth, b.textSizes[0]!]),
          CONTAINER_SM,
          "review text",
        );

        // Each step is exercised on both sides at every viewport, so a step that
        // silently stopped firing cannot pass this file.
        const containerWidths = blocks.filter((b) => b.cards > 0).map((b) => b.containerWidth);
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
        "default average",
        "default based on",
        "default share heading",
        "default share sentence",
        "default Write a review button",
        ...[1, 2, 3, 4, 5].map((n) => `default summary star ${n}`),
        ...BAR_LABELS.flatMap((bar) => [
          `default ${bar} label`,
          `default ${bar} value`,
          `default ${bar} bar`,
        ]),
        ...AUTHORS.flatMap((author) => [
          `default ${author} name`,
          `default ${author} initials`,
          `default ${author} date`,
          `default ${author} text`,
          ...[1, 2, 3, 4, 5].map((n) => `default ${author} star ${n}`),
        ]),
        ...AUTHORS.filter((_, index) => VERIFIED[index]).map((author) => `default ${author} badge`),
        "empty empty message",
        "error alert title",
        "error alert description",
        "error Try again button",
      ]) {
        expect(Object.keys(ratios), `${scheme}: ${label} measured`).toContain(label);
      }
      for (const [what, ratio] of Object.entries(ratios)) {
        const floor = / star \d$| bar$/.test(what) ? 3 : 4.5;
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(floor);
      }
    });

    test('shows hover and focus-visible on "Write a review"', async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const button = page
        .locator(`[data-demo-state="default"] ${BLOCK}`)
        .getByRole("button", { name: WRITE });
      await expect(button).toHaveCount(1);

      // The outline button takes the --accent fill on hover.
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

    test('keeps a disabled "Write a review" out of reach', async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "disabled");
      const button = page
        .locator(`[data-demo-state="disabled"] ${BLOCK}`)
        .getByRole("button", { name: WRITE });
      await expect(button).toBeDisabled();

      // A disabled button takes no focus, so the keyboard skips it.
      await button.evaluate((el) => (el as HTMLElement).focus());
      await expect(button).not.toBeFocused();
    });

    test("puts its heading in the page outline as an h2", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      await expect(block.getByRole("heading", { level: 2 })).toHaveText(HEADING);
      await expect(block.getByRole("img", { name: RATINGS[1] })).toHaveCount(1);
      await expect(block.getByRole("progressbar", { name: BAR_LABELS[0] })).toHaveAttribute(
        "aria-valuenow",
        "65",
      );
    });

    test("announces the loading reviews once and the failed load as an alert", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const block = page.locator(`[data-demo-state="loading"] ${BLOCK}`);
      await expect(block.locator('[role="status"]')).toHaveCount(1);
      const region = block.locator('[role="status"]');
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region).toContainText("Loading reviews");
      const hidden = await block.evaluate((el) =>
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
      await expect(block.locator("ul > li > [data-scope='card'][data-part='root']")).toHaveCount(
        AUTHORS.length,
      );
      await expect(block.getByRole("progressbar")).toHaveCount(BAR_LABELS.length);
    });
  });
}
