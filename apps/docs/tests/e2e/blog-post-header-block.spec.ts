/**
 * The blog post header block, checked on the built docs page at the three
 * widths of the responsive policy (375 / 768 / 1280) in both colour schemes. It
 * asserts text and computed styles; no screenshot baseline is committed.
 *
 * Four claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` everything lines up at
 *    the start; from `--container-sm` the excerpt steps up a size; from
 *    `--container-md` the title steps up a size and the meta line, the title,
 *    the excerpt and the byline centre; from `--container-lg` the header gets
 *    more room above, below and between its parts. Each copy on the page is
 *    measured against its own container width, so the narrow frame stays
 *    start-aligned at 1280 while the wide frame has crossed every step.
 * 2. **Every state renders what it claims**, at every width: the meta line
 *    (category Badge, `<time>`, reading time), the title as an `h1`, the
 *    excerpt and the byline (avatar, linked name, role) by default; the title
 *    alone when every other text is `""` and the author `null`; placeholders
 *    in a busy region while loading; an error Alert with a retry; and an inert
 *    author link when disabled. Every copy is centred in its box.
 * 3. **AA contrast** in both schemes on every text the block paints.
 * 4. **Hover and focus-visible** on the author link, and none on a disabled one.
 *
 * It also checks that an empty `error` string counts as no error: the header
 * comes back, with no alert.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/blog-post-header/";

const BLOCK = "section.moderno-block-blog-post-header";

/** The copy the block ships with. */
const CATEGORY = "Product";
const TITLE = "How we closed the books in one afternoon";
const EXCERPT =
  "Month-end used to take our finance team three days. Here is what we changed, step by step, and what we would do differently.";
const DATE = "September 12, 2026";
const DATE_TIME = "2026-09-12";
const READING_TIME = "6 min read";
const AUTHOR = "Nora Castillo";
const ROLE = "Co-founder, CEO";
const INITIALS = "NC";
const ERROR = "We could not load this post.";

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** The title's text, font size (px), alignment and face. */
  title: string | null;
  titleSize: number | null;
  titleAlign: string | null;
  serifTitle: boolean | null;
  /** The excerpt's text and font size (px). */
  excerpt: string | null;
  excerptSize: number | null;
  /** The meta line: Badge text, the `<time>`'s text and value, and every visible text in order. */
  category: string | null;
  date: string | null;
  dateTime: string | null;
  meta: string[];
  /** Whether the `·` between the date and the reading time sits on another line than the date. */
  separatorAlone: boolean;
  /** The byline: the author's name, the link around it, their role, avatar initials and size. */
  author: string | null;
  authorLink: "live" | "inert" | "none";
  role: string | null;
  initials: string | null;
  avatarSize: number | null;
  /**
   * Where the meta line and the byline sit in the header: both at its start,
   * both around its centre, or `mixed`. Parts that are not rendered are left
   * out.
   */
  placement: "start" | "centre" | "mixed" | "none";
  /** How far the excerpt's start and centre sit from the header's, in px. */
  excerptFromStart: number | null;
  excerptFromCentre: number | null;
  /** The header's padding above and gap between its parts, in px. */
  paddingTop: number;
  gap: number | null;
  /** The button labels and `data-variant`s, in order (the retry inside an error). */
  buttons: string[];
  buttonVariants: string[];
  /** Placeholders inside a busy status region. */
  placeholders: number;
  /** Whether an error Alert is announced. */
  alert: boolean;
  /** Horizontal offset between the rendered content's centre and the block's, in px. */
  offCentre: number;
}

/**
 * The page's previews (islands/BlogPostHeaderBlockDemo.svelte): the main
 * preview mounts the default; the Examples frame the same block at 18rem,
 * 30rem, 40rem and 50rem, then mount the title-only, loading, error and
 * disabled states. Every copy is found by the `data-demo-state` its wrapper
 * carries.
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
      const size = (el: Element | null) => (el ? parseFloat(getComputedStyle(el).fontSize) : null);

      /** The box around an element's rendered children (or the element itself). */
      function contentBox(el: Element): { left: number; right: number } {
        const boxes = [...el.children]
          .filter((child) => child.getAttribute("aria-hidden") !== "true")
          .map((child) => child.getBoundingClientRect());
        if (boxes.length === 0) return el.getBoundingClientRect();
        return {
          left: Math.min(...boxes.map((b) => b.left)),
          right: Math.max(...boxes.map((b) => b.right)),
        };
      }

      return [...wrapper.querySelectorAll<HTMLElement>(selector)].map((section) => {
        const body = section.firstElementChild as HTMLElement | null;
        if (!body || !body.firstElementChild) {
          throw new Error("the blog post header block did not render its own markup");
        }

        const header = section.querySelector("header");
        const title = section.querySelector("h1");
        const excerpt = section.querySelector("h1 + p");
        const badge = section.querySelector('header [data-scope="badge"]');
        const time = section.querySelector("header time");
        const metaLine = (badge ?? time?.parentElement)?.parentElement ?? null;
        const avatar = section.querySelector<HTMLElement>(
          'header [data-scope="avatar"][data-part="root"]',
        );
        const byline = avatar?.parentElement ?? null;
        const bylineText = byline ? [...byline.querySelectorAll(":scope > div > p")] : [];
        const link = byline?.querySelector("a") ?? null;
        const busy = section.querySelector('[role="status"][aria-busy="true"]');
        const buttons = [...section.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];

        const headerBox = header?.getBoundingClientRect();
        const placements = new Set(
          [metaLine, byline]
            .filter((part): part is HTMLElement => part !== null)
            .map((part) => {
              if (!headerBox) return "mixed";
              const box = contentBox(part);
              const centre = (box.left + box.right) / 2;
              const headerCentre = headerBox.left + headerBox.width / 2;
              if (Math.abs(box.left - headerBox.left) < 1) return "start";
              if (Math.abs(centre - headerCentre) < 1) return "centre";
              return "mixed";
            }),
        );

        const excerptBox = excerpt?.getBoundingClientRect();

        const blockBox = section.getBoundingClientRect();
        const shown = [...body.children]
          .filter((el) => !el.classList.contains("sr-only"))
          .map((el) => el.getBoundingClientRect());
        const left = Math.min(...shown.map((r) => r.left));
        const right = Math.max(...shown.map((r) => r.right));

        return {
          containerWidth: section.offsetWidth,
          title: title ? text(title) : null,
          titleSize: size(title),
          titleAlign: title ? getComputedStyle(title).textAlign : null,
          serifTitle: title ? normalise(getComputedStyle(title).fontFamily) === serif : null,
          excerpt: excerpt ? text(excerpt) : null,
          excerptSize: size(excerpt),
          category: badge ? text(badge) : null,
          date: time ? text(time) : null,
          dateTime: time?.getAttribute("datetime") ?? null,
          meta: metaLine
            ? [...metaLine.querySelectorAll("*")]
                .filter(
                  (el) => el.children.length === 0 && el.getAttribute("aria-hidden") !== "true",
                )
                .map((el) => text(el))
            : [],
          separatorAlone: (() => {
            const dot = metaLine?.querySelector('[aria-hidden="true"]');
            const time = metaLine?.querySelector("time");
            if (!dot || !time) return false;
            return Math.abs(dot.getBoundingClientRect().top - time.getBoundingClientRect().top) > 1;
          })(),
          author: bylineText[0] ? text(bylineText[0]) : null,
          authorLink: !link
            ? "none"
            : link.hasAttribute("href") && !link.hasAttribute("aria-disabled")
              ? "live"
              : !link.hasAttribute("href") && link.getAttribute("aria-disabled") === "true"
                ? "inert"
                : "none",
          role: bylineText[1] ? text(bylineText[1]) : null,
          initials: avatar ? text(avatar.querySelector('[data-part="fallback"]')) : null,
          avatarSize: avatar ? avatar.offsetWidth : null,
          placement:
            placements.size === 0
              ? "none"
              : placements.size === 1
                ? ([...placements][0] as "start" | "centre" | "mixed")
                : "mixed",
          excerptFromStart:
            excerptBox && headerBox ? Math.abs(excerptBox.left - headerBox.left) : null,
          excerptFromCentre:
            excerptBox && headerBox
              ? Math.abs(
                  excerptBox.left + excerptBox.width / 2 - (headerBox.left + headerBox.width / 2),
                )
              : null,
          paddingTop: parseFloat(getComputedStyle(body).paddingTop),
          gap: header ? parseFloat(getComputedStyle(header).rowGap) : null,
          buttons: buttons.map((b) => text(b)),
          buttonVariants: buttons.map((b) => b.getAttribute("data-variant") ?? ""),
          placeholders: busy ? busy.querySelectorAll('[data-scope="skeleton"]').length : 0,
          alert: section.querySelector('[data-scope="alert"][role="alert"]') !== null,
          offCentre: Math.abs((left + right) / 2 - (blockBox.left + blockBox.width / 2)),
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
      const avatar = block.querySelector('[data-scope="avatar"][data-part="root"]');
      const byline = avatar ? [...avatar.parentElement!.querySelectorAll(":scope > div > p")] : [];
      const parts: Array<[string, Element | null | undefined]> = [
        ["title", block.querySelector("h1")],
        ["excerpt", block.querySelector("h1 + p")],
        ["category", block.querySelector('header [data-scope="badge"]')],
        ["date", block.querySelector("header time")],
        ["reading time", block.querySelector("header time ~ span:not([aria-hidden])")],
        ["author", byline[0]?.querySelector("a") ?? byline[0]],
        ["role", byline[1]],
        ["initials", avatar?.querySelector('[data-part="fallback"]')],
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
      for (const button of block.querySelectorAll('[data-scope="button"]')) {
        ratios[`${state} ${button.textContent?.trim() ?? "button"} button`] = against(button);
      }
      return ratios;
    },
    { state, selector: BLOCK },
  );
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`blog post header — ${scheme}`, () => {
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
          expect(block.offCentre, `${where}: centred`).toBeLessThan(1);
          expect(block.alert, `${where}: error announced`).toBe(state === "error");

          if (state === "loading") {
            expect(block.placeholders, `${where}: placeholders`).toBe(8);
            expect(block.title, `${where}: no title while loading`).toBeNull();
            expect(block.buttons, `${where}: no buttons while loading`).toEqual([]);
          } else if (state === "error") {
            expect(block.title, `${where}: no title`).toBeNull();
            expect(block.buttons, `${where}: retry only`).toEqual(["Try again"]);
            expect(block.buttonVariants, `${where}: retry variant`).toEqual(["outline"]);
          } else if (state === "empty") {
            expect(block.title, `${where}: title`).toBe(TITLE);
            expect(block.excerpt, `${where}: no excerpt`).toBeNull();
            expect(block.meta, `${where}: no meta line`).toEqual([]);
            expect(block.author, `${where}: no byline`).toBeNull();
            expect(block.gap, `${where}: gap between parts`).toBe(wide ? 32 : 24);
          } else {
            expect(block.title, `${where}: title`).toBe(TITLE);
            expect(block.serifTitle, `${where}: serif title`).toBe(true);
            expect(block.excerpt, `${where}: excerpt`).toBe(EXCERPT);
            expect(block.category, `${where}: category`).toBe(CATEGORY);
            expect(block.date, `${where}: date`).toBe(DATE);
            expect(block.dateTime, `${where}: machine-readable date`).toBe(DATE_TIME);
            expect(block.meta, `${where}: meta line`).toEqual([CATEGORY, DATE, READING_TIME]);
            expect(block.separatorAlone, `${where}: date and reading time wrap together`).toBe(
              false,
            );
            expect(block.author, `${where}: author`).toBe(AUTHOR);
            expect(block.role, `${where}: role`).toBe(ROLE);
            expect(block.initials, `${where}: avatar initials`).toBe(INITIALS);
            expect(block.avatarSize, `${where}: md avatar`).toBe(40);
            expect(block.authorLink, `${where}: author link`).toBe(
              state === "disabled" ? "inert" : "live",
            );
            expect(block.buttons, `${where}: no buttons`).toEqual([]);
            expect(block.gap, `${where}: gap between parts`).toBe(wide ? 32 : 24);
            expect(block.placement, `${where}: meta line and byline`).toBe(
              block.containerWidth >= CONTAINER_MD ? "centre" : "start",
            );
            if (block.containerWidth >= CONTAINER_MD) {
              expect(block.excerptFromCentre!, `${where}: excerpt centred`).toBeLessThan(1);
            } else {
              expect(block.excerptFromStart!, `${where}: excerpt at the start`).toBeLessThan(1);
            }
            expect(block.titleAlign, `${where}: title alignment`).toBe(
              block.containerWidth >= CONTAINER_MD ? "center" : "start",
            );
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

        const withTitle = blocks.filter((b) => b.title !== null);

        // The title is one size below `@md` and one larger size from it on.
        const titleBelow = new Set(
          withTitle.filter((b) => b.containerWidth < CONTAINER_MD).map((b) => b.titleSize),
        );
        const titleAbove = new Set(
          withTitle.filter((b) => b.containerWidth >= CONTAINER_MD).map((b) => b.titleSize),
        );
        expect(titleBelow.size, "one title size below @md").toBe(1);
        expect(titleAbove.size, "one title size from @md").toBe(1);
        expect([...titleAbove][0]!, "the title steps up at @md").toBeGreaterThan(
          [...titleBelow][0]!,
        );

        // The excerpt is one size below `@sm` and one larger size from it on.
        const withExcerpt = blocks.filter((b) => b.excerpt !== null);
        const excerptBelow = new Set(
          withExcerpt.filter((b) => b.containerWidth < CONTAINER_SM).map((b) => b.excerptSize),
        );
        const excerptAbove = new Set(
          withExcerpt.filter((b) => b.containerWidth >= CONTAINER_SM).map((b) => b.excerptSize),
        );
        expect(excerptBelow.size, "one excerpt size below @sm").toBe(1);
        expect(excerptAbove.size, "one excerpt size from @sm").toBe(1);
        expect([...excerptAbove][0]!, "the excerpt steps up at @sm").toBeGreaterThan(
          [...excerptBelow][0]!,
        );

        // Each step is exercised on both sides at every viewport, so a step that
        // silently stopped firing cannot pass this file.
        const containerWidths = withExcerpt.map((b) => b.containerWidth);
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
        "default title",
        "default excerpt",
        "default category",
        "default date",
        "default reading time",
        "default author",
        "default role",
        "default initials",
        "empty title",
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

    test("shows hover and focus-visible on the author link", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const link = page
        .locator(`[data-demo-state="default"] ${BLOCK}`)
        .getByRole("link", { name: AUTHOR });
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
        .getByRole("link", { name: AUTHOR });
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

    test("announces the loading header once and the failed load as an alert", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const region = page.locator(`[data-demo-state="loading"] ${BLOCK} [role="status"]`);
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region).toContainText("Loading the post");
      const hidden = await region.evaluate((el) =>
        [...el.querySelectorAll('[data-scope="skeleton"]')].every(
          (placeholder) => placeholder.closest('[aria-hidden="true"]') !== null,
        ),
      );
      expect(hidden).toBe(true);

      // The byline's placeholder stays a 40px circle, the size of the avatar
      // it stands in for.
      const circles = await region.evaluate((el) =>
        [...el.querySelectorAll<HTMLElement>('[data-scope="skeleton"][data-shape="circle"]')].map(
          (circle) => [circle.offsetWidth, circle.offsetHeight],
        ),
      );
      expect(circles).toEqual([[40, 40]]);

      await showState(page, "error");
      const alert = page.locator(`[data-demo-state="error"] ${BLOCK} [role="alert"]`);
      await expect(alert).toContainText(ERROR);
      await expect(alert.getByRole("button", { name: "Try again" })).toBeVisible();
    });

    test("puts the title in the page outline as an h1", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      await expect(block.getByRole("heading", { level: 1 })).toHaveText(TITLE);
      await expect(block.getByRole("heading")).toHaveCount(1);
      // The block is not a page landmark: its <header> sits inside a section.
      await expect(block.getByRole("banner")).toHaveCount(0);
    });

    test("treats an empty error string as no error", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "error");
      const block = page.locator(`[data-demo-state="error"] ${BLOCK}`);

      // The demo's retry clears its message to "", the way a consumer holding
      // the error as a string does once the load succeeds.
      await block.getByRole("button", { name: "Try again" }).click();

      await expect(block.locator('[data-scope="alert"]')).toHaveCount(0);
      await expect(block.getByRole("heading", { level: 1 })).toHaveText(TITLE);
      await expect(block.getByRole("link", { name: AUTHOR })).toHaveCount(1);
    });
  });
}
