/**
 * The testimonials block, checked on the built docs page at the three widths of
 * the responsive policy (375 / 768 / 1280) in both colour schemes. It asserts
 * text and computed styles; no screenshot baseline is committed.
 *
 * Four claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` the cards stack in one
 *    column with the quotes at the small size; from `--container-sm` the quotes
 *    read a size larger; from `--container-md` the cards sit in two columns and
 *    the heading steps up a size; from `--container-lg` three columns, with
 *    more room between the cards and above the section. Each copy on the page
 *    is measured against its own container width, so the narrow frame keeps
 *    one column at 1280 while the wide frame has crossed every step.
 * 2. **Every state renders what it claims**, at every width: heading,
 *    introduction and six quote cards, each with its author's avatar, name and
 *    role, by default; the empty message in place of the cards; placeholder
 *    cards in a busy region while loading; an error Alert with a retry in place
 *    of the cards; and inert author links when disabled. Every copy is centred
 *    in its box.
 * 3. **AA contrast** in both schemes on every text the block paints, and 3:1 on
 *    the quote mark against its card.
 * 4. **Hover and focus-visible** on an author link, and none on a disabled one.
 *
 * It also checks that an empty `error` string counts as no error: the quotes
 * come back, with no alert.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/testimonials/";

const BLOCK = "section.moderno-block-testimonials";

/** The copy the block ships with. */
const HEADING = "What our customers say";
const NAMES = [
  "Maya Lindqvist",
  "Tomás Herrera",
  "Aiko Tanaka",
  "David Okafor",
  "Lena Fischer",
  "Sam Rivera",
];
const ROLES = [
  "Founder, Northwind Studio",
  "Operations Lead, Brightline",
  "CFO, Parcelworks",
  "Owner, Okafor Bakery",
  "Freelance Designer",
  "Co-founder, Fieldnote",
];
const INITIALS = ["ML", "TH", "AT", "DO", "LF", "SR"];
/** Every sample author but the last carries an `href`, so their name is a link. */
const LINKED = NAMES.slice(0, 5);
const EMPTY = "No testimonials yet. Check back soon.";
const ERROR = "We could not load the testimonials.";

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** The heading's text. */
  heading: string | null;
  /** The heading's font size, in px. */
  headingSize: number | null;
  /** Whether the heading is set in the contract's `--font-serif`. */
  serifHeading: boolean | null;
  /** The number of quote cards, each a Card inside a list item. */
  cards: number;
  /** Whether every quote sits in a blockquote wrapped in typographic quotation marks. */
  quotesMarked: boolean;
  /** Each quote's font size, in px (one entry per distinct size). */
  quoteSizes: number[];
  /** Each card's author name, role and avatar initials, in order. */
  names: string[];
  roles: string[];
  initials: string[];
  /** Cards whose content opens with an aria-hidden quote mark. */
  quoteMarks: number;
  /** The accessible names of the author links, in order. */
  linkNames: string[];
  /** Columns of the card grid. */
  columns: number;
  /** The gap between cards, in px. */
  columnGap: number;
  /** Whether every author link is inert: no href and `aria-disabled`. */
  allLinksInert: boolean;
  /** Whether every author link is live: an href and no `aria-disabled`. */
  allLinksLive: boolean;
  /** The empty message, or null. */
  empty: string | null;
  /** The block's padding above its content, in px. */
  paddingTop: number;
  /** The button labels, in order (the retry inside an error). */
  buttons: string[];
  /** The `data-variant` of every button, in order. */
  buttonVariants: string[];
  /** Whether every button in this copy is disabled. */
  allButtonsDisabled: boolean;
  /** Placeholder cards inside a busy status region. */
  placeholderCards: number;
  /** Whether an error Alert is announced. */
  alert: boolean;
  /** Horizontal offset between the heading block's centre and the block's, in px. */
  offCentre: number;
}

/**
 * The page's previews (islands/TestimonialsBlockDemo.svelte): the main preview
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
      const text = (el: Element | null | undefined) => el?.textContent?.trim() ?? "";

      return [...wrapper.querySelectorAll<HTMLElement>(selector)].map((section) => {
        const body = section.firstElementChild as HTMLElement | null;
        const first = body?.firstElementChild as HTMLElement | null;
        if (!body || !first)
          throw new Error("the testimonials block did not render its own markup");

        const heading = section.querySelector("h2");
        const list = section.querySelector<HTMLElement>("ul");
        const cards = [
          ...section.querySelectorAll<HTMLElement>(
            'ul > li > [data-scope="card"][data-part="root"]',
          ),
        ];
        const quotes = cards.map((card) => card.querySelector("blockquote"));
        const footers = cards.map((card) =>
          card.querySelector<HTMLElement>('[data-scope="card"][data-part="footer"]'),
        );
        const links = [...section.querySelectorAll<HTMLAnchorElement>("ul a")];
        const busy = section.querySelector('[role="status"][aria-busy="true"]');
        const buttons = [...section.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];
        const empty = [...body.children].find(
          (el) => el.tagName === "P" && el.classList.contains("border-dashed"),
        );
        const blockBox = section.getBoundingClientRect();
        const firstBox = first.getBoundingClientRect();
        const listStyle = list ? getComputedStyle(list) : null;

        return {
          containerWidth: section.offsetWidth,
          heading: heading ? text(heading) : null,
          headingSize: heading ? parseFloat(getComputedStyle(heading).fontSize) : null,
          serifHeading: heading ? normalise(getComputedStyle(heading).fontFamily) === serif : null,
          cards: cards.length,
          quotesMarked: quotes.every((q) => {
            const said = text(q);
            return q !== null && said.startsWith("“") && said.endsWith("”");
          }),
          quoteSizes: [
            ...new Set(quotes.map((q) => (q ? parseFloat(getComputedStyle(q).fontSize) : 0))),
          ],
          names: footers.map((footer) => text(footer?.querySelector("p.font-semibold"))),
          roles: footers.map((footer) => text(footer?.querySelector("p.text-muted-foreground"))),
          initials: footers.map((footer) =>
            text(footer?.querySelector('[data-scope="avatar"][data-part="fallback"]')),
          ),
          quoteMarks: cards.filter((card) =>
            card.querySelector('[data-part="content"] > svg[aria-hidden="true"]:first-child path'),
          ).length,
          linkNames: links.map((a) => text(a)),
          columns: listStyle ? listStyle.gridTemplateColumns.split(" ").filter(Boolean).length : 0,
          columnGap: listStyle ? parseFloat(listStyle.columnGap) : 0,
          allLinksInert:
            links.length > 0 &&
            links.every(
              (a) => !a.hasAttribute("href") && a.getAttribute("aria-disabled") === "true",
            ),
          allLinksLive:
            links.length > 0 &&
            links.every((a) => a.hasAttribute("href") && !a.hasAttribute("aria-disabled")),
          empty: empty ? text(empty) : null,
          paddingTop: parseFloat(getComputedStyle(body).paddingTop),
          buttons: buttons.map((b) => text(b)),
          buttonVariants: buttons.map((b) => b.getAttribute("data-variant") ?? ""),
          allButtonsDisabled: buttons.length > 0 && buttons.every((b) => b.disabled),
          placeholderCards: busy
            ? [...busy.querySelectorAll('[data-scope="card"][data-part="root"]')].filter(
                (card) => card.querySelector('[data-scope="skeleton"]') !== null,
              ).length
            : 0,
          alert: section.querySelector('[data-scope="alert"][role="alert"]') !== null,
          offCentre: Math.abs(
            firstBox.left + firstBox.width / 2 - (blockBox.left + blockBox.width / 2),
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
        ["heading", block.querySelector("h2")],
        ["description", block.querySelector("h2 + p")],
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
      for (const card of block.querySelectorAll('ul > li > [data-scope="card"]')) {
        const nameLine = card.querySelector("p.font-semibold")!;
        const name = nameLine.textContent?.trim() ?? "author";
        ratios[`${state} ${name} quote`] = against(card.querySelector("blockquote")!);
        ratios[`${state} ${name} name`] = against(nameLine.querySelector("a") ?? nameLine);
        ratios[`${state} ${name} role`] = against(card.querySelector("p.text-muted-foreground")!);
        ratios[`${state} ${name} initials`] = against(
          card.querySelector('[data-scope="avatar"][data-part="fallback"]')!,
        );
        // Non-text contrast (WCAG 1.4.11): the quote mark's stroke against its card.
        ratios[`${state} ${name} quote mark`] = against(
          card.querySelector('[data-part="content"] > svg')!,
        );
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
  test.describe(`testimonials — ${scheme}`, () => {
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

          expect(block.paddingTop, `${where}: room above`).toBe(
            block.containerWidth >= CONTAINER_LG ? 64 : 48,
          );
          expect(block.offCentre, `${where}: centred`).toBeLessThan(1);
          expect(block.alert, `${where}: error announced`).toBe(state === "error");
          expect(block.heading, `${where}: heading`).toBe(HEADING);
          expect(block.serifHeading, `${where}: serif heading`).toBe(true);

          if (state === "loading") {
            expect(block.placeholderCards, `${where}: placeholder cards`).toBe(3);
            expect(block.cards, `${where}: no quotes while loading`).toBe(0);
            expect(block.buttons, `${where}: no buttons while loading`).toEqual([]);
          } else if (state === "empty") {
            expect(block.empty, `${where}: empty message`).toBe(EMPTY);
            expect(block.cards, `${where}: no quotes`).toBe(0);
            expect(block.buttons, `${where}: no buttons`).toEqual([]);
          } else if (state === "error") {
            expect(block.cards, `${where}: no quotes`).toBe(0);
            expect(block.buttons, `${where}: retry only`).toEqual(["Try again"]);
            expect(block.buttonVariants, `${where}: retry variant`).toEqual(["outline"]);
          } else {
            const columns =
              block.containerWidth >= CONTAINER_LG
                ? 3
                : block.containerWidth >= CONTAINER_MD
                  ? 2
                  : 1;
            expect(block.columns, `${where}: columns`).toBe(columns);
            expect(block.columnGap, `${where}: gap between cards`).toBe(
              block.containerWidth >= CONTAINER_LG ? 24 : 16,
            );
            expect(block.cards, `${where}: one card per quote`).toBe(NAMES.length);
            expect(block.quotesMarked, `${where}: quotes in marks`).toBe(true);
            expect(block.quoteSizes, `${where}: one quote size`).toHaveLength(1);
            expect(block.quoteMarks, `${where}: one hidden quote mark per card`).toBe(NAMES.length);
            expect(block.names, `${where}: names`).toEqual(NAMES);
            expect(block.roles, `${where}: roles`).toEqual(ROLES);
            expect(block.initials, `${where}: avatar initials`).toEqual(INITIALS);
            expect(block.linkNames, `${where}: author links`).toEqual(LINKED);
            expect(block.empty, `${where}: no empty message`).toBeNull();
            expect(block.buttons, `${where}: no buttons`).toEqual([]);
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
          blocks.filter((block) => block.allLinksInert).map((block) => block.state),
          "the disabled render",
        ).toEqual(["disabled"]);
        expect(
          blocks.filter((block) => block.allLinksLive).map((block) => block.state),
          "every other render with quotes",
        ).toEqual(["default", "narrow", "compact", "panel", "wide"]);

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
          blocks.filter((b) => b.cards > 0).map((b) => [b.containerWidth, b.quoteSizes[0]!]),
          CONTAINER_SM,
          "quote",
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
            const content = [...block.firstElementChild!.children]
              .filter((el) => !el.classList.contains("sr-only"))
              .map((el) => el.getBoundingClientRect());
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
        ...NAMES.flatMap((name) => [
          `default ${name} quote`,
          `default ${name} name`,
          `default ${name} role`,
          `default ${name} initials`,
          `default ${name} quote mark`,
        ]),
        "empty empty message",
        "error alert title",
        "error alert description",
        "error Try again button",
      ]) {
        expect(Object.keys(ratios), `${scheme}: ${label} measured`).toContain(label);
      }
      for (const [what, ratio] of Object.entries(ratios)) {
        const floor = what.endsWith(" quote mark") ? 3 : 4.5;
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(floor);
      }
    });

    test("shows hover and focus-visible on an author link", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const link = page
        .locator(`[data-demo-state="default"] ${BLOCK}`)
        .getByRole("link", { name: LINKED[0] });
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAttribute("href", "#");

      // The author link underlines on hover.
      const decoration = () => link.evaluate((el) => getComputedStyle(el).textDecorationLine);
      await page.mouse.move(0, 0);
      expect(await decoration(), `${scheme}: resting`).toBe("none");
      await link.hover();
      expect(await decoration(), `${scheme}: hover`).toBe("underline");

      await page.mouse.move(0, 0);
      await link.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const outline = await link.evaluate((el) => ({
        focused: el.matches(":focus-visible"),
        style: getComputedStyle(el).outlineStyle,
      }));
      expect(outline.focused, `${scheme}: keyboard focus`).toBe(true);
      expect(outline.style, `${scheme}: focus ring`).not.toBe("none");
    });

    test("keeps a disabled author link out of reach", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "disabled");
      const link = page
        .locator(`[data-demo-state="disabled"] ${BLOCK}`)
        .getByRole("link", { name: LINKED[0] });
      await expect(link).toHaveAttribute("aria-disabled", "true");
      await expect(link).not.toHaveAttribute("href");

      // A link with no href takes no focus, so the keyboard skips it.
      await link.evaluate((el) => (el as HTMLElement).focus());
      await expect(link).not.toBeFocused();

      // No underline on hover, and the not-allowed cursor of an inert control.
      await link.hover();
      const style = await link.evaluate((el) => ({
        decoration: getComputedStyle(el).textDecorationLine,
        cursor: getComputedStyle(el).cursor,
      }));
      expect(style.decoration, `${scheme}: no hover underline`).toBe("none");
      expect(style.cursor, `${scheme}: not-allowed cursor`).toBe("not-allowed");
    });

    test("announces the loading cards once and the failed load as an alert", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const region = page.locator(`[data-demo-state="loading"] ${BLOCK} [role="status"]`);
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region).toContainText("Loading testimonials");
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
      await expect(block.locator("ul > li blockquote")).toHaveCount(NAMES.length);
      await expect(block.getByRole("link")).toHaveCount(LINKED.length);
    });
  });
}
