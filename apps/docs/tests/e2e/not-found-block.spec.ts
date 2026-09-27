/**
 * The Not Found block, checked on the built docs page at the three widths of
 * the responsive policy (375 / 768 / 1280) in both colour schemes. It asserts
 * text and computed styles; no screenshot baseline is committed.
 *
 * Four claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` the actions stack,
 *    each as wide as the message; at `--container-sm` they sit side by side; at
 *    `--container-md` the title steps up a size; at `--container-lg` the
 *    message moves to the start and the popular pages beside it, in two
 *    columns. Each copy on the page is measured against its own container
 *    width, so the narrow frame stays stacked at 1280 while the wide frame has
 *    crossed every step.
 * 2. **Every state renders what it claims**, at every width: the code, a serif
 *    h1, the description, both actions and the popular pages by default; the
 *    message alone and centred without pages; placeholders in a busy region
 *    while the pages load; an error Alert with a retry where they failed; and
 *    inert buttons when disabled. Every copy is centred in its box.
 * 3. **AA contrast** in both schemes on every text the block paints.
 * 4. **Hover and focus-visible** on both actions and on a popular page.
 *
 * It also checks that an empty `error` string counts as no error: the popular
 * pages come back, with no alert.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/not-found/";

const BLOCK = "section.moderno-block-not-found";

/** The copy the block ships with. */
const CODE = "404";
const TITLE = "Page not found";
const ACTIONS = ["Back to home", "Contact support"];
const LINKS_TITLE = "Popular pages";
const LINKS = ["Pricing", "Help centre", "Changelog"];
const ERROR = "We could not load the popular pages.";

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** The code badge's text, or null when there is none. */
  code: string | null;
  /** The h1's text. */
  title: string | null;
  /** The h1's font size, in px. */
  titleSize: number | null;
  /** Whether the h1 is set in the contract's `--font-serif`. */
  serifTitle: boolean | null;
  /** The description's text, or null when there is none. */
  description: string | null;
  /** The text alignment of the message. */
  textAlign: string;
  /** Whether the pages part (list, alert or placeholders) sits beside the message, or null without one. */
  split: boolean | null;
  /** Horizontal offset between the message text's centre and the block's, in px. */
  messageOffCentre: number;
  /** Horizontal offset between the pages part's centre and the block's, in px, or null without one. */
  pagesOffCentre: number | null;
  /** The action labels, in order, including the retry inside an error. */
  actions: string[];
  /** The `data-variant` of every action, in order. */
  actionVariants: string[];
  /** Whether the second action sits beside the first rather than under it. */
  actionsBeside: boolean | null;
  /** Whether the first action spans the message's whole width. */
  actionFullWidth: boolean | null;
  /** Whether every button in this copy is disabled. */
  allActionsInert: boolean;
  /** The popular pages' heading, and the name of their nav. */
  linksTitle: string | null;
  navName: string | null;
  /** The popular pages' labels, in order. */
  links: string[];
  /** The list's own background and border, as painted, or null without a list. */
  list: { background: string; border: string; borderWidth: number } | null;
  /** `--card` and `--border` resolved inside the block, the same way. */
  tokens: { card: string; border: string };
  /** Skeleton placeholders inside a busy status region. */
  placeholders: number;
  /** Whether an error Alert is announced. */
  alert: boolean;
}

/**
 * The page's previews (islands/NotFoundBlockDemo.svelte): the main preview
 * mounts the default; the Examples frame the same block at 18rem, 30rem, 40rem
 * and 50rem, then mount the empty (no popular pages), loading, error and
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
      const root = getComputedStyle(document.documentElement);
      const serif = normalise(root.getPropertyValue("--font-serif"));

      /** A token as the browser paints it inside `host`, so it compares to a computed style. */
      function resolve(host: Element, token: string): string {
        const probe = document.createElement("span");
        host.append(probe);
        probe.style.color = `var(${token})`;
        const painted = getComputedStyle(probe).color;
        probe.remove();
        return painted;
      }

      const centreOf = (box: DOMRect) => box.left + box.width / 2;

      return [...wrapper.querySelectorAll<HTMLElement>(selector)].map((section) => {
        const grid = section.firstElementChild as HTMLElement | null;
        const message = grid?.firstElementChild as HTMLElement | null;
        if (!grid || !message) throw new Error("the Not Found block did not render its own markup");
        const pages = message.nextElementSibling as HTMLElement | null;
        const tokens = { card: resolve(section, "--card"), border: resolve(section, "--border") };

        const heading = section.querySelector("h1");
        const text = heading?.parentElement ?? null;
        const description = section.querySelector("h1 + p");
        const badge = message.querySelector('[data-scope="badge"]');
        const buttons = [...section.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];
        const calls = buttons.filter((b) => !b.closest('[data-scope="alert"]'));
        const [one, two] = calls.map((b) => b.getBoundingClientRect());
        const busy = section.querySelector('[role="status"][aria-busy="true"]');
        const nav = section.querySelector("nav");
        const list = nav?.querySelector("ul") ?? null;
        const listStyle = list ? getComputedStyle(list) : null;

        const sectionBox = section.getBoundingClientRect();
        const messageBox = message.getBoundingClientRect();
        const pagesBox = pages?.getBoundingClientRect() ?? null;

        return {
          containerWidth: section.offsetWidth,
          code: badge?.textContent?.trim() ?? null,
          title: heading?.textContent?.trim() ?? null,
          titleSize: heading ? parseFloat(getComputedStyle(heading).fontSize) : null,
          serifTitle: heading ? normalise(getComputedStyle(heading).fontFamily) === serif : null,
          description: description?.textContent?.trim() ?? null,
          textAlign: getComputedStyle(message).textAlign,
          split: pagesBox
            ? pagesBox.left >= messageBox.right - 0.5 && pagesBox.top < messageBox.bottom
            : null,
          messageOffCentre: text
            ? Math.abs(centreOf(text.getBoundingClientRect()) - centreOf(sectionBox))
            : 0,
          pagesOffCentre: pagesBox ? Math.abs(centreOf(pagesBox) - centreOf(sectionBox)) : null,
          actions: buttons.map((b) => b.textContent?.trim() ?? ""),
          actionVariants: buttons.map((b) => b.getAttribute("data-variant") ?? ""),
          actionsBeside: one && two ? two.top < one.bottom : null,
          actionFullWidth: one ? Math.abs(one.width - message.clientWidth) < 1 : null,
          allActionsInert: buttons.length > 0 && buttons.every((b) => b.disabled),
          linksTitle: nav?.querySelector("h2")?.textContent?.trim() ?? null,
          navName: nav?.getAttribute("aria-label") ?? null,
          links: nav
            ? [...nav.querySelectorAll("a")].map(
                (a) => a.firstElementChild?.textContent?.trim() ?? "",
              )
            : [],
          list: listStyle
            ? {
                background: listStyle.backgroundColor,
                border: listStyle.borderTopColor,
                borderWidth: parseFloat(listStyle.borderTopWidth),
              }
            : null,
          tokens,
          placeholders: busy ? busy.querySelectorAll('[data-scope="skeleton"]').length : 0,
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
async function textRatios(page: Page, state: "default" | "error"): Promise<Record<string, number>> {
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
        ["code", block.querySelector('[data-scope="badge"]')],
        ["title", block.querySelector("h1")],
        ["description", block.querySelector("h1 + p")],
        ["pages title", block.querySelector("nav h2")],
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
      for (const link of block.querySelectorAll("nav a")) {
        const [label, description] = [...link.children];
        const name = label?.textContent?.trim() ?? "page";
        if (label) ratios[`${state} ${name} label`] = against(label);
        if (description) ratios[`${state} ${name} description`] = against(description);
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
  test.describe(`not-found — ${scheme}`, () => {
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

          const sm = block.containerWidth >= CONTAINER_SM;
          const lg = block.containerWidth >= CONTAINER_LG;
          const split = lg && state !== "empty";
          expect(block.actionsBeside, `${where}: actions side by side`).toBe(sm);
          expect(block.actionFullWidth, `${where}: action as wide as the message`).toBe(!sm);
          expect(block.split, `${where}: message and pages in two columns`).toBe(
            state === "empty" ? null : lg,
          );
          expect(block.textAlign, `${where}: text alignment`).toBe(split ? "start" : "center");
          if (!split) {
            expect(block.messageOffCentre, `${where}: message centred`).toBeLessThan(1);
            if (block.pagesOffCentre !== null) {
              expect(block.pagesOffCentre, `${where}: pages centred`).toBeLessThan(1);
            }
          }
          expect(block.alert, `${where}: error announced`).toBe(state === "error");

          // The message is the same in every state: the code, a serif h1 and
          // the description, then both actions.
          expect(block.code, `${where}: code`).toBe(CODE);
          expect(block.title, `${where}: title`).toBe(TITLE);
          expect(block.serifTitle, `${where}: serif title`).toBe(true);
          expect(block.description, `${where}: description`).not.toBeNull();

          if (state === "error") {
            expect(block.actions, `${where}: actions and retry`).toEqual([...ACTIONS, "Try again"]);
            expect(block.actionVariants, `${where}: variants`).toEqual([
              "primary",
              "outline",
              "outline",
            ]);
          } else {
            expect(block.actions, `${where}: actions`).toEqual(ACTIONS);
            expect(block.actionVariants, `${where}: variants`).toEqual(["primary", "outline"]);
          }

          if (state === "loading") {
            expect(block.placeholders, `${where}: placeholders`).toBe(7);
          } else {
            expect(block.placeholders, `${where}: no placeholders`).toBe(0);
          }

          if (state === "empty" || state === "loading" || state === "error") {
            expect(block.links, `${where}: no popular pages`).toEqual([]);
          } else {
            expect(block.links, `${where}: popular pages`).toEqual(LINKS);
            expect(block.linksTitle, `${where}: pages title`).toBe(LINKS_TITLE);
            expect(block.navName, `${where}: nav name`).toBe(LINKS_TITLE);
            // The list is the --card surface with a --border hairline.
            expect(block.list?.background, `${where}: list surface`).toBe(block.tokens.card);
            expect(block.list?.border, `${where}: list border colour`).toBe(block.tokens.border);
            expect(block.list?.borderWidth, `${where}: list border`).toBeGreaterThan(0);
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

        // The title steps up at `--container-md`: one size below it, one
        // larger size from it on.
        const below = new Set(
          blocks.filter((b) => b.containerWidth < CONTAINER_MD).map((b) => b.titleSize),
        );
        const above = new Set(
          blocks.filter((b) => b.containerWidth >= CONTAINER_MD).map((b) => b.titleSize),
        );
        expect(below.size, "one title size below @md").toBe(1);
        expect(above.size, "one title size from @md").toBe(1);
        expect([...above][0]!, "the title steps up at @md").toBeGreaterThan([...below][0]!);

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
            const content = wrapper
              .querySelector(selector)!
              .firstElementChild!.getBoundingClientRect();
            return {
              above: content.top - panel.top,
              below: panel.bottom - content.bottom,
              before: content.left - panel.left,
              after: panel.right - content.right,
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
        ...(await textRatios(page, "default")),
        ...(await textRatios(page, "error")),
      };
      for (const label of [
        "default code",
        "default title",
        "default description",
        "default pages title",
        ...LINKS.flatMap((link) => [`default ${link} label`, `default ${link} description`]),
        ...ACTIONS.map((action) => `default ${action} button`),
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

    test("shows hover and focus-visible on both actions and on a popular page", async ({
      page,
    }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      const buttons = block.locator('[data-scope="button"]');
      await expect(buttons).toHaveCount(2);
      const targets = [
        { name: ACTIONS[0]!, control: buttons.nth(0) },
        { name: ACTIONS[1]!, control: buttons.nth(1) },
        { name: LINKS[0]!, control: block.locator("nav a").first() },
      ];

      for (const { name, control } of targets) {
        await expect(control).toHaveAccessibleName(new RegExp(`^${name}`));

        // The primary action darkens through a filter; the outline one and the
        // popular page take a fill.
        const surface = () =>
          control.evaluate((el) => {
            const style = getComputedStyle(el);
            return `${style.backgroundColor} ${style.filter}`;
          });
        await page.mouse.move(0, 0);
        const resting = await surface();
        await control.hover();
        await expect.poll(surface, { message: `${scheme}: ${name} hover` }).not.toBe(resting);

        await page.mouse.move(0, 0);
        await control.focus();
        await page.keyboard.press("Shift+Tab");
        await page.keyboard.press("Tab");
        const outline = await control.evaluate((el) => ({
          focused: el.matches(":focus-visible"),
          style: getComputedStyle(el).outlineStyle,
        }));
        expect(outline.focused, `${scheme}: ${name} keyboard focus`).toBe(true);
        expect(outline.style, `${scheme}: ${name} focus ring`).not.toBe("none");
      }
    });

    test("heads the page with an h1 and names the popular pages", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      await expect(block.getByRole("heading", { level: 1 })).toHaveText(TITLE);
      const nav = block.getByRole("navigation", { name: LINKS_TITLE });
      await expect(nav.getByRole("heading", { level: 2 })).toHaveText(LINKS_TITLE);
      await expect(nav.getByRole("link")).toHaveCount(LINKS.length);
    });

    test("announces the loading pages once and the failed load as an alert", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const region = page.locator(`[data-demo-state="loading"] ${BLOCK} [role="status"]`);
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region).toContainText("Loading");
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
      await expect(block.locator("nav a")).toHaveCount(LINKS.length);
      await expect(block.locator('[data-scope="button"]')).toHaveText(ACTIONS);
    });
  });
}
