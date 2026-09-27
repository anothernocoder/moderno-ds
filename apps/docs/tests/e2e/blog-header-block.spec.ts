/**
 * The blog-header block, checked on the built docs page at the three widths of
 * the responsive policy (375 / 768 / 1280) in both colour schemes. It asserts
 * text and computed styles; no screenshot baseline is committed.
 *
 * Four claims:
 *
 * 1. **Container, not viewport.** From `--container-sm` the description steps
 *    up a size; from `--container-md` the title steps up and the chips spread
 *    out; from `--container-lg` the header gets more room above and between
 *    its parts. Each copy on the page is measured against its own container
 *    width, so the narrow frame keeps the smallest type at 1280 while the wide
 *    frame has crossed every step.
 * 2. **Every state renders what it claims**, at every width: kicker, title,
 *    description and six category chips (the current one filled) by default;
 *    the empty message in place of the chips; placeholder chips in a busy
 *    region while loading; an error Alert with a retry in place of the chips;
 *    and inert, muted category links when disabled. Every copy is centred in
 *    its box.
 * 3. **AA contrast** in both schemes on every text the block paints.
 * 4. **Hover and focus-visible** on a category link, and none on a disabled
 *    one.
 *
 * It also checks that an empty `error` string counts as no error: the chips
 * come back, with no alert.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/blog-header/";

const BLOCK = "header.moderno-block-blog-header";

/** The copy the block ships with. */
const KICKER = "Blog";
const TITLE = "Notes from the ledger";
const CATEGORIES = ["All posts", "Product", "Engineering", "Design", "Company", "Guides"];
/** The sample's current category: the first, "All posts". */
const CURRENT = CATEGORIES[0]!;
const EMPTY = "No categories yet.";
const ERROR = "We could not load the categories.";

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** The kicker's text, or null. */
  kicker: string | null;
  /** The title's text and font size, in px. */
  title: string | null;
  titleSize: number | null;
  /** Whether the title is set in the contract's `--font-serif`. */
  serifTitle: boolean | null;
  /** The description's font size, in px. */
  descriptionSize: number | null;
  /** The category chips' labels, in order. */
  chips: string[];
  /** Each chip's `data-variant`, in order. */
  chipVariants: string[];
  /** The labels of the links marked `aria-current="page"`. */
  current: string[];
  /** Whether the chips sit in a nav named "Categories". */
  namedNav: boolean;
  /** The gap between chips, in px. */
  chipGap: number;
  /** The gap between the text and the chips, in px. */
  partGap: number;
  /** Whether every category link is inert: no href and `aria-disabled`. */
  allLinksInert: boolean;
  /** Whether every category link is live: an href and no `aria-disabled`. */
  allLinksLive: boolean;
  /** The empty message, or null. */
  empty: string | null;
  /** The block's padding above its content, in px. */
  paddingTop: number;
  /** The button labels, in order (the retry inside an error). */
  buttons: string[];
  /** The `data-variant` of every button, in order. */
  buttonVariants: string[];
  /** Placeholder chips inside a busy status region. */
  placeholders: number;
  /** Whether an error Alert is announced. */
  alert: boolean;
  /** Horizontal offset between the text block's centre and the block's, in px. */
  offCentre: number;
}

/**
 * The page's previews (islands/BlogHeaderBlockDemo.svelte): the main preview
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

      return [...wrapper.querySelectorAll<HTMLElement>(selector)].map((header) => {
        const body = header.firstElementChild as HTMLElement | null;
        const first = body?.firstElementChild as HTMLElement | null;
        if (!body || !first) throw new Error("the blog-header block did not render its own markup");

        const title = header.querySelector("h1");
        const kicker = title?.previousElementSibling ?? null;
        const description = header.querySelector("h1 + p");
        const nav = header.querySelector("nav");
        const list = header.querySelector<HTMLElement>("nav ul");
        const links = [...header.querySelectorAll<HTMLAnchorElement>("nav a")];
        const chips = links.map((a) => a.querySelector('[data-scope="chip"][data-part="root"]'));
        const busy = header.querySelector('[role="status"][aria-busy="true"]');
        const buttons = [...header.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];
        const empty = [...body.children].find(
          (el) => el.tagName === "P" && el.classList.contains("border-dashed"),
        );
        const blockBox = header.getBoundingClientRect();
        const firstBox = first.getBoundingClientRect();

        return {
          containerWidth: header.offsetWidth,
          kicker: kicker ? text(kicker) : null,
          title: title ? text(title) : null,
          titleSize: title ? parseFloat(getComputedStyle(title).fontSize) : null,
          serifTitle: title ? normalise(getComputedStyle(title).fontFamily) === serif : null,
          descriptionSize: description ? parseFloat(getComputedStyle(description).fontSize) : null,
          chips: chips.map((chip) => text(chip)),
          chipVariants: chips.map((chip) => chip?.getAttribute("data-variant") ?? ""),
          current: links.filter((a) => a.getAttribute("aria-current") === "page").map(text),
          namedNav: nav?.getAttribute("aria-label") === "Categories",
          chipGap: list ? parseFloat(getComputedStyle(list).columnGap) : 0,
          partGap: parseFloat(getComputedStyle(body).rowGap),
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
          placeholders: busy
            ? busy.querySelectorAll('[aria-hidden="true"][data-scope="skeleton"]').length
            : 0,
          alert: header.querySelector('[data-scope="alert"][role="alert"]') !== null,
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
  state: "default" | "empty" | "error" | "disabled",
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
      const title = block.querySelector("h1");
      const parts: Array<[string, Element | null | undefined]> = [
        ["kicker", title?.previousElementSibling],
        ["title", title],
        ["description", block.querySelector("h1 + p")],
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
      for (const label of block.querySelectorAll('nav [data-scope="chip"] [data-part="label"]')) {
        ratios[`${state} ${label.textContent?.trim() ?? "chip"} chip`] = against(label);
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
  test.describe(`blog-header — ${scheme}`, () => {
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
          const lg = block.containerWidth >= CONTAINER_LG;

          expect(block.paddingTop, `${where}: room above`).toBe(lg ? 64 : 48);
          expect(block.partGap, `${where}: room between the parts`).toBe(lg ? 40 : 32);
          expect(block.offCentre, `${where}: centred`).toBeLessThan(1);
          expect(block.alert, `${where}: error announced`).toBe(state === "error");
          expect(block.kicker, `${where}: kicker`).toBe(KICKER);
          expect(block.title, `${where}: title`).toBe(TITLE);
          expect(block.serifTitle, `${where}: serif title`).toBe(true);
          expect(block.titleSize, `${where}: title size`).toBe(
            block.containerWidth >= CONTAINER_MD ? 36 : 24,
          );
          expect(block.descriptionSize, `${where}: description size`).toBe(
            block.containerWidth >= CONTAINER_SM ? 16 : 14,
          );

          if (state === "loading") {
            expect(block.placeholders, `${where}: placeholder chips`).toBe(5);
            expect(block.chips, `${where}: no chips while loading`).toEqual([]);
            expect(block.buttons, `${where}: no buttons while loading`).toEqual([]);
          } else if (state === "empty") {
            expect(block.empty, `${where}: empty message`).toBe(EMPTY);
            expect(block.chips, `${where}: no chips`).toEqual([]);
            expect(block.buttons, `${where}: no buttons`).toEqual([]);
          } else if (state === "error") {
            expect(block.chips, `${where}: no chips`).toEqual([]);
            expect(block.buttons, `${where}: retry only`).toEqual(["Try again"]);
            expect(block.buttonVariants, `${where}: retry variant`).toEqual(["outline"]);
          } else {
            expect(block.namedNav, `${where}: a named nav`).toBe(true);
            expect(block.chips, `${where}: one chip per category`).toEqual(CATEGORIES);
            expect(block.current, `${where}: the current category`).toEqual([CURRENT]);
            expect(block.chipVariants, `${where}: chip variants`).toEqual(
              CATEGORIES.map((label) =>
                label === CURRENT ? "solid" : state === "disabled" ? "muted" : "outline",
              ),
            );
            expect(block.chipGap, `${where}: gap between chips`).toBe(
              block.containerWidth >= CONTAINER_MD ? 12 : 8,
            );
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
          "every other render with chips",
        ).toEqual(["default", "narrow", "compact", "panel", "wide"]);

        // Each step is exercised on both sides at every viewport, so a step that
        // silently stopped firing cannot pass this file.
        const containerWidths = blocks
          .filter((b) => b.chips.length > 0)
          .map((b) => b.containerWidth);
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
        ...(await contrastRatios(page, "disabled")),
      };
      for (const label of [
        "default kicker",
        "default title",
        "default description",
        ...CATEGORIES.map((category) => `default ${category} chip`),
        ...CATEGORIES.map((category) => `disabled ${category} chip`),
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

    test("shows hover and focus-visible on a category link", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const link = page
        .locator(`[data-demo-state="default"] ${BLOCK}`)
        .getByRole("link", { name: CATEGORIES[1] });
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAttribute("href", "#");
      const chip = link.locator('[data-scope="chip"][data-part="root"]');

      // Hovering the link darkens the chip's outline to the foreground colour.
      const colours = () =>
        chip.evaluate((el) => ({
          border: getComputedStyle(el).borderTopColor,
          foreground: getComputedStyle(el).color,
        }));
      await page.mouse.move(0, 0);
      const resting = await colours();
      expect(resting.border, `${scheme}: resting outline`).not.toBe(resting.foreground);
      await link.hover();
      const hovered = await colours();
      expect(hovered.border, `${scheme}: hover outline`).toBe(hovered.foreground);

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

    test("keeps a disabled category link out of reach", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "disabled");
      const link = page
        .locator(`[data-demo-state="disabled"] ${BLOCK}`)
        .getByRole("link", { name: CATEGORIES[1] });
      await expect(link).toHaveAttribute("aria-disabled", "true");
      await expect(link).not.toHaveAttribute("href");

      // A link with no href takes no focus, so the keyboard skips it.
      await link.evaluate((el) => (el as HTMLElement).focus());
      await expect(link).not.toBeFocused();

      // No outline on hover — a muted chip has none to darken — and the
      // not-allowed cursor of an inert control.
      await link.hover();
      const style = await link.evaluate((el) => ({
        border: getComputedStyle(el.querySelector('[data-scope="chip"]')!).borderTopColor,
        cursor: getComputedStyle(el).cursor,
      }));
      expect(style.border, `${scheme}: no hover outline`).toBe("rgba(0, 0, 0, 0)");
      expect(style.cursor, `${scheme}: not-allowed cursor`).toBe("not-allowed");
    });

    test("announces the loading chips once and the failed load as an alert", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const region = page.locator(`[data-demo-state="loading"] ${BLOCK} [role="status"]`);
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region).toContainText("Loading the categories");
      const placeholders = await region.evaluate((el) =>
        [...el.querySelectorAll<HTMLElement>('[data-scope="skeleton"]')].map((placeholder) => ({
          hidden: placeholder.closest('[aria-hidden="true"]') !== null,
          height: placeholder.offsetHeight,
        })),
      );
      // Five hidden placeholders, each as tall as a chip.
      expect(placeholders).toEqual(Array(5).fill({ hidden: true, height: 28 }));

      await showState(page, "error");
      const alert = page.locator(`[data-demo-state="error"] ${BLOCK} [role="alert"]`);
      await expect(alert).toContainText(ERROR);
      await expect(alert.getByRole("button", { name: "Try again" })).toBeVisible();
    });

    test("puts the title at the top of the page outline", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      await expect(block.getByRole("heading", { level: 1 })).toHaveText(TITLE);
      await expect(block.getByRole("navigation", { name: "Categories" })).toBeVisible();
      await expect(block.getByRole("link")).toHaveText(CATEGORIES);
    });

    test("treats an empty error string as no error", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "error");
      const block = page.locator(`[data-demo-state="error"] ${BLOCK}`);

      // The demo's retry clears its message to "", the way a consumer holding
      // the error as a string does once the load succeeds.
      await block.getByRole("button", { name: "Try again" }).click();

      await expect(block.locator('[data-scope="alert"]')).toHaveCount(0);
      await expect(block.getByRole("link")).toHaveText(CATEGORIES);
    });
  });
}
