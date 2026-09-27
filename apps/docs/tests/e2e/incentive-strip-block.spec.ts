/**
 * The incentive strip block, checked on the built docs page at the three widths
 * of the responsive policy (375 / 768 / 1280) in both colour schemes. It
 * asserts text and computed styles; no screenshot baseline is committed.
 *
 * Four claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` the incentives sit one
 *    per row with the icon beside the text; at `--container-sm` two per row
 *    with the icon above the text; at `--container-md` the heading steps up one
 *    size; at `--container-lg` all four sit on one row, with more room above
 *    and below. Each copy on the page is measured against its own container
 *    width, so the narrow frame stays at one per row at 1280 while the wide
 *    frame has crossed every step. Every incentive's text fits its column.
 * 2. **Every state renders what it claims**, at every width: the heading and
 *    four incentives by default (icon tile, title, sentence, policy link);
 *    the empty message; placeholders in a busy region while loading; an error
 *    Alert with a retry in place of the incentives; inert links when
 *    disabled. Every copy is centred in its box.
 * 3. **AA contrast** in both schemes on every text the block paints, and 3:1 on
 *    each icon against its tile.
 * 4. **Hover and focus-visible** on the links and the retry, and neither on a
 *    disabled link.
 *
 * It also checks that an empty `error` string counts as no error: the
 * incentives come back, with no alert.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/incentive-strip/";

const BLOCK = "section.moderno-block-incentive-strip";

/** The copy the block ships with. */
const HEADING = "Shop with confidence";
const DESCRIPTION = "Every order is covered, from the moment you pay to the day it arrives.";
const TITLES = ["Free shipping", "30-day returns", "Secure payment", "Gift wrapping"];
const SENTENCES = [
  "On every order over €50, at your door in two to four days.",
  "Changed your mind? Send it back within a month, on us.",
  "Card details are encrypted and never stored on our servers.",
  "Add recycled paper and a handwritten note at checkout.",
];
/** The sample's policy links; the gift wrapping incentive has none. */
const LINKS = ["Shipping rates", "Returns policy", "How we keep it safe"];
const EMPTY = "No incentives to show yet.";
const ERROR = "We could not load our store promises.";

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** The heading's text. */
  heading: string | null;
  /** The heading's font size, in px. */
  headingSize: number;
  /** Whether the heading is set in the serif face. */
  headingSerif: boolean;
  /** The description's text. */
  description: string | null;
  /** The incentives' titles, in order. */
  titles: string[];
  /** The incentives' sentences, in order. */
  sentences: string[];
  /** The link labels, in order. */
  links: string[];
  /** Where each incentive's icon sits against its text (one value when they agree). */
  iconPlacements: Array<"beside" | "above" | "overlap">;
  /** Whether every icon is an inline SVG hidden from assistive technology, in a painted tile. */
  iconsInTiles: boolean;
  /** Tracks of the incentive grid, or of the placeholders while loading. */
  tracks: number | null;
  /** Rows the incentives fill. */
  rows: number;
  /** Whether every incentive's text stays inside its own column. */
  textFits: boolean;
  /** The block's padding above its content, in px. */
  paddingTop: number;
  /** The empty message, if shown. */
  empty: string | null;
  /** The button labels, in order. */
  actions: string[];
  /** The `data-variant` of every button, in order. */
  actionVariants: string[];
  /** Whether every link in the block is inert: no href and `aria-disabled`. */
  linksInert: boolean;
  /** Whether every link in the block is live: an href and no `aria-disabled`. */
  linksLive: boolean;
  /** Placeholders inside a busy status region, each hidden from assistive technology. */
  placeholders: number;
  /** Whether an error Alert is announced. */
  alert: boolean;
}

/**
 * The page's previews (islands/IncentiveStripBlockDemo.svelte): the main
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

/** A contract type size resolved to px, the way the browser resolves it. */
async function typeSize(page: Page, slot: string): Promise<number> {
  return page.evaluate((slot) => {
    const probe = document.createElement("span");
    probe.style.fontSize = `var(${slot})`;
    document.body.append(probe);
    const size = parseFloat(getComputedStyle(probe).fontSize);
    probe.remove();
    return size;
  }, slot);
}

async function blockMetrics(page: Page, state: State): Promise<BlockMetrics[]> {
  return page.evaluate(
    ({ state, selector }) => {
      const wrapper = document.querySelector(`[data-demo-state="${state}"]`);
      if (!wrapper) throw new Error(`no preview for the ${state} state on the page`);

      const probe = document.createElement("span");
      probe.style.fontFamily = "var(--font-serif)";
      document.body.append(probe);
      const serif = getComputedStyle(probe).fontFamily;
      probe.remove();

      const painted = (el: Element) => {
        const bg = getComputedStyle(el).backgroundColor;
        return bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)";
      };

      return [...wrapper.querySelectorAll<HTMLElement>(selector)].map((section) => {
        const body = section.firstElementChild as HTMLElement | null;
        if (!body) throw new Error("the incentive strip block did not render its own markup");

        const header = body.firstElementChild as HTMLElement;
        const heading = header.querySelector("h2");
        const description = header.querySelector("h2 + p");
        const list = body.querySelector(":scope > ul");
        const busy = body.querySelector(':scope > [role="status"][aria-busy="true"]');
        const grid = list ?? busy;
        const items = [...(list?.querySelectorAll<HTMLElement>(":scope > li") ?? [])];
        const tiles = items.map((li) => li.firstElementChild as HTMLElement);
        const texts = items.map((li) => li.lastElementChild as HTMLElement);
        const links = [...section.querySelectorAll<HTMLAnchorElement>("a")];
        const buttons = [...section.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];

        const placements = items.map((_, i) => {
          const tile = tiles[i]!.getBoundingClientRect();
          const text = texts[i]!.getBoundingClientRect();
          if (tile.right <= text.left + 0.5 && tile.top < text.bottom) return "beside" as const;
          if (tile.bottom <= text.top + 0.5) return "above" as const;
          return "overlap" as const;
        });

        return {
          containerWidth: section.offsetWidth,
          heading: heading?.textContent?.trim() ?? null,
          headingSize: heading ? parseFloat(getComputedStyle(heading).fontSize) : 0,
          headingSerif: heading ? getComputedStyle(heading).fontFamily === serif : false,
          description: description?.textContent?.trim() ?? null,
          titles: items.map((li) => li.querySelector("h3")?.textContent?.trim() ?? ""),
          sentences: items.map((li) => li.querySelector("h3 + p")?.textContent?.trim() ?? ""),
          links: links.map((a) => a.textContent?.trim() ?? ""),
          iconPlacements: [...new Set(placements)],
          iconsInTiles: tiles.every((tile) => {
            const svg = tile.querySelector(":scope > svg");
            return (
              svg !== null &&
              svg.getAttribute("aria-hidden") === "true" &&
              painted(tile) &&
              parseFloat(getComputedStyle(tile).borderTopWidth) === 1
            );
          }),
          tracks: grid
            ? getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length
            : null,
          rows: new Set(items.map((li) => Math.round(li.getBoundingClientRect().top))).size,
          textFits: items.every((li, i) => {
            const cell = li.getBoundingClientRect();
            return [...texts[i]!.children].every((child) => {
              const range = document.createRange();
              range.selectNodeContents(child);
              const box = range.getBoundingClientRect();
              return box.left >= cell.left - 0.5 && box.right <= cell.right + 0.5;
            });
          }),
          paddingTop: parseFloat(getComputedStyle(body).paddingTop),
          empty: body.querySelector(":scope > p")?.textContent?.trim() ?? null,
          actions: buttons.map((b) => b.textContent?.trim() ?? ""),
          actionVariants: buttons.map((b) => b.getAttribute("data-variant") ?? ""),
          linksInert:
            links.length > 0 &&
            links.every(
              (a) => !a.hasAttribute("href") && a.getAttribute("aria-disabled") === "true",
            ),
          linksLive:
            links.length > 0 &&
            links.every((a) => a.hasAttribute("href") && !a.hasAttribute("aria-disabled")),
          placeholders: busy
            ? [...busy.querySelectorAll(':scope > [aria-hidden="true"]')].filter(
                (placeholder) =>
                  placeholder.querySelectorAll('[data-scope="skeleton"]').length === 3,
              ).length
            : 0,
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
      const body = block.firstElementChild!;
      const parts: Array<[string, Element | null]> = [
        ["heading", body.querySelector("h2")],
        ["description", body.querySelector("h2 + p")],
        ["empty message", body.querySelector(":scope > p")],
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
      for (const item of block.querySelectorAll("ul > li")) {
        const title = item.querySelector("h3")!;
        const name = title.textContent?.trim();
        ratios[`${state} ${name} title`] = against(title);
        ratios[`${state} ${name} sentence`] = against(item.querySelector("h3 + p")!);
        const link = item.querySelector("a");
        if (link) ratios[`${state} ${link.textContent?.trim()} link`] = against(link);
        // The icon is a graphic that carries meaning: WCAG 1.4.11 asks 3:1
        // against its tile. Stored under its own prefix, checked separately.
        const svg = item.querySelector("svg")!;
        // Its stroke is currentColor, so its colour is the one it draws with.
        ratios[`icon ${state} ${name}`] = against(svg);
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
  test.describe(`incentive strip — ${scheme}`, () => {
    test.use({ colorScheme: scheme });

    for (const width of WIDTHS) {
      test(`lays itself out from its container at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1200 });
        await page.goto(PAGE, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready.then(() => true));

        expect(await page.evaluate(() => document.documentElement.classList.contains("dark"))).toBe(
          scheme === "dark",
        );

        const headingSm = await typeSize(page, "--text-heading-sm");
        const headingMd = await typeSize(page, "--text-heading");
        expect(headingMd, "the two heading sizes differ").toBeGreaterThan(headingSm);

        const blocks: Array<BlockMetrics & { state: State }> = [];
        for (const state of STATES) {
          await showState(page, state);
          const mounted = await blockMetrics(page, state);
          expect(mounted, `${state}: mounted copies`).toHaveLength(1);
          const block = mounted[0]!;
          blocks.push({ ...block, state });
          const where = `${scheme} ${width}px, ${state} (${block.containerWidth}px)`;
          const perRow =
            block.containerWidth >= CONTAINER_LG ? 4 : block.containerWidth >= CONTAINER_SM ? 2 : 1;

          if (block.tracks !== null) {
            expect(block.tracks, `${where}: incentives per row`).toBe(perRow);
          }
          expect(block.paddingTop, `${where}: room above`).toBe(
            block.containerWidth >= CONTAINER_LG ? 64 : 48,
          );
          expect(block.alert, `${where}: error announced`).toBe(state === "error");

          // What every state keeps: the heading and its line.
          expect(block.heading, `${where}: heading`).toBe(HEADING);
          expect(block.headingSerif, `${where}: heading in the serif face`).toBe(true);
          expect(block.headingSize, `${where}: heading size`).toBe(
            block.containerWidth >= CONTAINER_MD ? headingMd : headingSm,
          );
          expect(block.description, `${where}: description`).toBe(DESCRIPTION);

          if (state === "loading") {
            expect(block.placeholders, `${where}: placeholders`).toBe(TITLES.length);
            expect(block.titles, `${where}: no incentives while loading`).toEqual([]);
            expect(block.actions, `${where}: no buttons`).toEqual([]);
          } else if (state === "empty") {
            expect(block.titles, `${where}: no incentives`).toEqual([]);
            expect(block.tracks, `${where}: no incentive grid`).toBeNull();
            expect(block.empty, `${where}: empty message`).toBe(EMPTY);
            expect(block.links, `${where}: no links`).toEqual([]);
          } else if (state === "error") {
            expect(block.titles, `${where}: no incentives`).toEqual([]);
            expect(block.tracks, `${where}: no incentive grid`).toBeNull();
            expect(block.actions, `${where}: retry`).toEqual(["Try again"]);
            expect(block.actionVariants, `${where}: variant`).toEqual(["outline"]);
          } else {
            expect(block.titles, `${where}: titles`).toEqual(TITLES);
            expect(block.sentences, `${where}: sentences`).toEqual(SENTENCES);
            expect(block.links, `${where}: links`).toEqual(LINKS);
            expect(block.iconsInTiles, `${where}: an icon in a tile each`).toBe(true);
            expect(block.iconPlacements, `${where}: icon placement`).toEqual([
              block.containerWidth >= CONTAINER_SM ? "above" : "beside",
            ]);
            expect(block.rows, `${where}: rows`).toBe(TITLES.length / perRow);
            expect(block.textFits, `${where}: every text fits its column`).toBe(true);
            expect(block.actions, `${where}: no buttons`).toEqual([]);
            expect(block.linksInert, `${where}: links inert`).toBe(state === "disabled");
            expect(block.linksLive, `${where}: links live`).toBe(state !== "disabled");
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
        "default description",
        ...TITLES.map((title) => `default ${title} title`),
        ...TITLES.map((title) => `default ${title} sentence`),
        ...TITLES.map((title) => `icon default ${title}`),
        ...LINKS.map((link) => `default ${link} link`),
        "empty empty message",
        "error alert title",
        "error alert description",
        "error Try again button",
      ]) {
        expect(Object.keys(ratios), `${scheme}: ${label} measured`).toContain(label);
      }
      for (const [what, ratio] of Object.entries(ratios)) {
        const floor = what.startsWith("icon ") ? 3 : 4.5;
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(floor);
      }
    });

    test("shows hover and focus-visible on its links and its retry", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      const link = block.getByRole("link", { name: LINKS[0] });
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAttribute("href", "#");

      // The policy link underlines on hover.
      const decoration = () => link.evaluate((el) => getComputedStyle(el).textDecorationLine);
      await page.mouse.move(0, 0);
      expect(await decoration(), `${scheme}: resting`).toBe("none");
      await link.hover();
      expect(await decoration(), `${scheme}: hover`).toBe("underline");

      // Keyboard focus draws a ring on the link, then on the next one.
      await page.mouse.move(0, 0);
      await link.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const ring = (el: Element) => ({
        focused: el.matches(":focus-visible"),
        style: getComputedStyle(el).outlineStyle,
      });
      const linkRing = await link.evaluate(ring);
      expect(linkRing.focused, `${scheme}: keyboard focus on the link`).toBe(true);
      expect(linkRing.style, `${scheme}: focus ring on the link`).not.toBe("none");

      await page.keyboard.press("Tab");
      const next = block.getByRole("link", { name: LINKS[1] });
      await expect(next).toBeFocused();
      expect((await next.evaluate(ring)).style, `${scheme}: focus ring on the next link`).not.toBe(
        "none",
      );

      // The retry (Button outline) takes a ring from the keyboard and fills on hover.
      await showState(page, "error");
      const retry = page
        .locator(`[data-demo-state="error"] ${BLOCK}`)
        .getByRole("button", { name: "Try again" });
      await retry.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const retryRing = await retry.evaluate(ring);
      expect(retryRing.focused, `${scheme}: keyboard focus on the retry`).toBe(true);
      expect(retryRing.style, `${scheme}: focus ring on the retry`).not.toBe("none");

      const fill = () => retry.evaluate((el) => getComputedStyle(el).backgroundColor);
      await retry.blur();
      await page.mouse.move(0, 0);
      const resting = await fill();
      await retry.hover();
      await expect.poll(fill, { message: `${scheme}: retry hover` }).not.toBe(resting);
    });

    test("keeps the disabled links out of reach", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "disabled");
      const block = page.locator(`[data-demo-state="disabled"] ${BLOCK}`);
      for (const name of LINKS) {
        const link = block.getByRole("link", { name });
        await expect(link).toHaveAttribute("aria-disabled", "true");
        await expect(link).not.toHaveAttribute("href");

        // A link with no href takes no focus, so the keyboard skips it.
        await link.evaluate((el) => (el as HTMLElement).focus());
        await expect(link).not.toBeFocused();
      }

      // No underline on hover, and the not-allowed cursor of an inert control.
      const link = block.getByRole("link", { name: LINKS[0] });
      await link.hover();
      const style = await link.evaluate((el) => ({
        decoration: getComputedStyle(el).textDecorationLine,
        cursor: getComputedStyle(el).cursor,
      }));
      expect(style.decoration, `${scheme}: no hover underline`).toBe("none");
      expect(style.cursor, `${scheme}: not-allowed cursor`).toBe("not-allowed");
    });

    test("puts the incentives in the page outline", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      await expect(block.getByRole("heading", { level: 2 })).toHaveText(HEADING);
      await expect(block.getByRole("list")).toHaveCount(1);
      await expect(block.getByRole("listitem")).toHaveCount(TITLES.length);
      await expect(block.getByRole("heading", { level: 3 })).toHaveText(TITLES);
      await expect(block.getByRole("img")).toHaveCount(0);
    });

    test("announces the loading incentives once and the failed load as an alert", async ({
      page,
    }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const region = page.locator(`[data-demo-state="loading"] ${BLOCK} [role="status"]`);
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region).toContainText("Loading incentives");
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
      await expect(block.getByRole("heading", { level: 3 })).toHaveText(TITLES);
    });
  });
}
