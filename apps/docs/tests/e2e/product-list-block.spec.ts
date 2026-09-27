/**
 * The product-list block, checked on the built docs page at the three widths
 * of the responsive policy (375 / 768 / 1280) in both colour schemes. It
 * asserts text and computed styles; no screenshot baseline is committed.
 *
 * Four claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` the products sit in
 *    two columns and the product count under the introduction; from
 *    `--container-sm` the count sits beside the heading; from `--container-md`
 *    three columns and a larger heading; from `--container-lg` four columns,
 *    with more room between the columns and above the section. Each copy on
 *    the page is measured against its own container width, so the narrow
 *    frame keeps two columns at 1280 while the wide frame has crossed every
 *    step.
 * 2. **Every state renders what it claims**, at every width: heading,
 *    introduction, "48 products", twelve tiles (image, badge, linked name,
 *    price and old price) and a page row by default; muted boxes without
 *    images; the empty message; placeholder tiles in a busy region while
 *    loading, with the page row kept; an error Alert with a retry in place of
 *    the grid and the page row; and inert links with page buttons off when
 *    disabled. Every copy is centred in its box.
 * 3. **AA contrast** in both schemes on every text the block paints.
 * 4. **Hover and focus-visible** on a name link and on a page button, and none
 *    on the disabled ones.
 *
 * It also checks that the page row moves between pages, and that an empty
 * `error` string counts as no error: the products come back, with no alert.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/product-list/";

const BLOCK = "section.moderno-block-product-list";

/** The products the demo passes (the block's own samples, with images). */
const HEADING = "The collection";
const COUNT = "48 products";
const NAMES = [
  "Stoneware mug",
  "Serving bowl",
  "Bud vase",
  "Dinner plate",
  "Espresso cup",
  "Pasta bowl",
  "Tall vase",
  "Side plate",
  "Tea mug",
  "Salad bowl",
  "Stem vase",
  "Serving platter",
];
const PRICES = ["€28", "€46", "€32", "€24", "€18", "€30", "€54", "€16", "€26", "€58", "€38", "€64"];
/** The old price of each product on sale, or "" when it has none. */
const OLD_PRICES = ["€35", "", "", "", "", "", "", "€19", "", "", "", ""];
const BADGES = ["Sale", "", "New", "", "", "", "", "Sale", "", "", "New", ""];
const ALTS = [
  "A dark green stoneware mug with a bare clay foot",
  "A wide cream bowl with a brown glaze inside",
  "A rust-red vase with a narrow neck",
  "A slate-blue plate seen from the side",
];
/** Every product but the last carries an `href`, so its name is a link. */
const LINKED = NAMES.slice(0, 11);
/** 48 products, twelve to a page. */
const PAGES = ["1", "2", "3", "4"];
const EMPTY = "No products match yet.";
const ERROR = "We could not load the products.";

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** The heading's text, font size in px, and whether it is set in `--font-serif`. */
  heading: string | null;
  headingSize: number | null;
  serifHeading: boolean | null;
  /** The product count, and where it sits against the heading block. */
  count: string | null;
  countPlacement: "below" | "beside" | "mixed" | "none";
  /** One entry per product tile, in order. */
  names: string[];
  prices: string[];
  oldPrices: string[];
  /** Whether each old price is struck through and read with "Was" first. */
  oldPricesStruck: boolean;
  badges: string[];
  /** Whether every badge is Badge's solid variant, inside its image area. */
  badgesOnImage: boolean;
  /** Each image's alt text; "" for a tile with no image. */
  alts: string[];
  /** Whether every image loaded and covers its whole square area. */
  imagesFill: boolean;
  /** Whether every image area is square and paints --muted. */
  mediaSquareAndMuted: boolean;
  /** The accessible names of the name links, in order. */
  nameLinks: string[];
  /** Columns of the product grid, and its gaps in px. */
  columns: number;
  columnGap: number;
  rowGap: number;
  /** Whether every link in the block is inert: no href and `aria-disabled`. */
  allLinksInert: boolean;
  /** Whether every link in the block is live: an href and no `aria-disabled`. */
  allLinksLive: boolean;
  /** The page row: its buttons' text, the current page, and the disabled ones. */
  pages: string[];
  currentPage: string | null;
  disabledPageButtons: number;
  pageButtons: number;
  /** The empty message, or null. */
  empty: string | null;
  /** The block's padding above its content, in px. */
  paddingTop: number;
  /** The Button labels and variants, in order (the retry inside an error). */
  buttons: string[];
  buttonVariants: string[];
  /** Placeholder tiles inside a busy status region. */
  placeholders: number;
  /** Whether an error Alert is announced. */
  alert: boolean;
  /** Horizontal offset between the heading row's centre and the block's, in px. */
  offCentre: number;
}

/**
 * The page's previews (islands/ProductListBlockDemo.svelte): the main preview
 * mounts the default; the Examples frame the same block at 18rem, 30rem, 40rem
 * and 50rem, then mount the no-images, empty, loading, error and disabled
 * states. Every copy is found by the `data-demo-state` its wrapper carries.
 */
const STATES = [
  "default",
  "narrow",
  "compact",
  "panel",
  "wide",
  "no-images",
  "empty",
  "loading",
  "error",
  "disabled",
] as const;
type State = (typeof STATES)[number];

/** The copies that show the products, with the demo's images. */
const WITH_IMAGES: State[] = ["default", "narrow", "compact", "panel", "wide", "disabled"];

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
      const muted = (() => {
        const probe = document.createElement("div");
        probe.style.backgroundColor = "var(--muted)";
        document.body.append(probe);
        const colour = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return colour;
      })();
      const text = (el: Element | null | undefined) =>
        el?.textContent?.replace(/\s+/g, " ").trim() ?? "";

      return [...wrapper.querySelectorAll<HTMLElement>(selector)].map((section) => {
        const body = section.firstElementChild as HTMLElement | null;
        const first = body?.firstElementChild as HTMLElement | null;
        if (!body || !first)
          throw new Error("the product-list block did not render its own markup");

        const heading = section.querySelector("h2");
        const intro = heading?.parentElement ?? null;
        const count = first.querySelector(":scope > p");
        let countPlacement: "below" | "beside" | "mixed" | "none" = "none";
        if (count && intro) {
          const countBox = count.getBoundingClientRect();
          const introBox = intro.getBoundingClientRect();
          if (countBox.top >= introBox.bottom) countPlacement = "below";
          else if (countBox.left >= introBox.right) countPlacement = "beside";
          else countPlacement = "mixed";
        }

        const list = section.querySelector<HTMLElement>("ul");
        const tiles = [...section.querySelectorAll<HTMLElement>("ul > li")];
        const media = tiles.map((tile) => tile.firstElementChild as HTMLElement);
        const images = tiles.map((tile) => tile.querySelector("img"));
        const oldPrices = tiles.map((tile) => tile.querySelector("s"));
        const links = [...section.querySelectorAll<HTMLAnchorElement>("a")];
        const nameLinks = [...section.querySelectorAll<HTMLAnchorElement>("ul h3 a")];
        const nav = section.querySelector('nav[data-scope="pagination"]');
        const pageButtons = nav ? [...nav.querySelectorAll<HTMLButtonElement>("button")] : [];
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
          count: count ? text(count) : null,
          countPlacement,
          names: tiles.map((tile) => text(tile.querySelector("h3"))),
          prices: tiles.map((tile) => text(tile.querySelector("h3 + p > span"))),
          oldPrices: oldPrices.map((s) => (s ? text(s).replace(/^Was\s*/, "") : "")),
          oldPricesStruck: oldPrices
            .filter((s): s is HTMLElement => s !== null)
            .every(
              (s) =>
                getComputedStyle(s).textDecorationLine.includes("line-through") &&
                text(s.querySelector(".sr-only")) === "Was",
            ),
          badges: tiles.map((tile) =>
            text(tile.querySelector('[data-scope="badge"][data-part="root"]')),
          ),
          badgesOnImage: tiles.every((tile, i) => {
            const badge = tile.querySelector<HTMLElement>('[data-scope="badge"]');
            if (!badge) return true;
            const b = badge.getBoundingClientRect();
            const m = media[i]!.getBoundingClientRect();
            return (
              badge.getAttribute("data-variant") === "solid" &&
              badge.parentElement === media[i] &&
              b.left >= m.left &&
              b.top >= m.top &&
              b.right <= m.right &&
              b.bottom <= m.bottom
            );
          }),
          alts: images.map((img) => img?.getAttribute("alt") ?? ""),
          imagesFill: images.every((img, i) => {
            if (!img) return true;
            const box = img.getBoundingClientRect();
            const area = media[i]!.getBoundingClientRect();
            return (
              img.complete &&
              img.naturalWidth > 0 &&
              Math.abs(box.width - area.width) < 1 &&
              Math.abs(box.height - area.height) < 1
            );
          }),
          mediaSquareAndMuted: media.every((box) => {
            const r = box.getBoundingClientRect();
            return (
              Math.abs(r.width - r.height) < 1 && getComputedStyle(box).backgroundColor === muted
            );
          }),
          nameLinks: nameLinks.map((a) => text(a)),
          columns: listStyle ? listStyle.gridTemplateColumns.split(" ").filter(Boolean).length : 0,
          columnGap: listStyle ? parseFloat(listStyle.columnGap) : 0,
          rowGap: listStyle ? parseFloat(listStyle.rowGap) : 0,
          allLinksInert:
            links.length > 0 &&
            links.every(
              (a) => !a.hasAttribute("href") && a.getAttribute("aria-disabled") === "true",
            ),
          allLinksLive:
            links.length > 0 &&
            links.every((a) => a.hasAttribute("href") && !a.hasAttribute("aria-disabled")),
          pages: nav
            ? [...nav.querySelectorAll('[data-part="item"]')].map((item) => text(item))
            : [],
          currentPage: nav ? text(nav.querySelector('[aria-current="page"]')) || null : null,
          disabledPageButtons: pageButtons.filter((b) => b.disabled).length,
          pageButtons: pageButtons.length,
          empty: empty ? text(empty) : null,
          paddingTop: parseFloat(getComputedStyle(body).paddingTop),
          buttons: buttons.map((b) => text(b)),
          buttonVariants: buttons.map((b) => b.getAttribute("data-variant") ?? ""),
          placeholders: busy
            ? [...busy.querySelectorAll('[aria-hidden="true"]')].filter(
                (tile) => tile.querySelector('[data-scope="skeleton"]') !== null,
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
      const parts: Array<[string, Element | null | undefined]> = [
        ["heading", block.querySelector("h2")],
        ["description", block.querySelector("h2 + p")],
        ["count", block.firstElementChild?.firstElementChild?.querySelector(":scope > p")],
        ["empty message", block.querySelector("p.border-dashed")],
        ["alert title", block.querySelector('[data-scope="alert"] [data-part="title"]')],
        [
          "alert description",
          block.querySelector('[data-scope="alert"] [data-part="description"]'),
        ],
        ["current page", block.querySelector('nav [aria-current="page"]')],
        ["other page", block.querySelector('nav [data-part="item"]:not([aria-current])')],
        ["next page", block.querySelector('nav [data-part="next-trigger"]')],
      ];

      const ratios: Record<string, number> = {};
      for (const [name, el] of parts) {
        if (el) ratios[`${state} ${name}`] = against(el);
      }
      block.querySelectorAll("ul > li").forEach((tile, i) => {
        const name = tile.querySelector("h3")!;
        const n = `product ${i + 1}`;
        ratios[`${state} ${n} name`] = against(name.querySelector("a") ?? name);
        ratios[`${state} ${n} price`] = against(tile.querySelector("h3 + p > span")!);
        const old = tile.querySelector("s");
        if (old) ratios[`${state} ${n} old price`] = against(old);
        const badge = tile.querySelector('[data-scope="badge"][data-part="root"]');
        if (badge) ratios[`${state} ${n} badge`] = against(badge);
      });
      for (const button of block.querySelectorAll('[data-scope="button"]')) {
        ratios[`${state} ${button.textContent?.trim() ?? "button"} button`] = against(button);
      }
      return ratios;
    },
    { state, selector: BLOCK },
  );
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`product-list — ${scheme}`, () => {
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
          if (WITH_IMAGES.includes(state)) {
            // Each image is a data: URI; wait for every one to decode before measuring.
            await page
              .locator(`[data-demo-state="${state}"] ${BLOCK} ul img`)
              .evaluateAll((imgs) =>
                Promise.all(imgs.map((img) => (img as HTMLImageElement).decode())),
              );
          }
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
            expect(block.placeholders, `${where}: a placeholder per product on a page`).toBe(12);
            expect(block.names, `${where}: no products while loading`).toEqual([]);
            expect(block.count, `${where}: no count while loading`).toBeNull();
            expect(block.buttons, `${where}: no buttons while loading`).toEqual([]);
            expect(block.pages, `${where}: the page row stays`).toEqual(PAGES);
            expect(block.currentPage, `${where}: current page`).toBe("1");
          } else if (state === "empty") {
            expect(block.empty, `${where}: empty message`).toBe(EMPTY);
            expect(block.names, `${where}: no products`).toEqual([]);
            expect(block.count, `${where}: no count`).toBeNull();
            expect(block.buttons, `${where}: no buttons`).toEqual([]);
            expect(block.pageButtons, `${where}: no page row`).toBe(0);
          } else if (state === "error") {
            expect(block.names, `${where}: no products`).toEqual([]);
            expect(block.count, `${where}: no count`).toBeNull();
            expect(block.buttons, `${where}: retry only`).toEqual(["Try again"]);
            expect(block.buttonVariants, `${where}: retry variant`).toEqual(["outline"]);
            expect(block.pageButtons, `${where}: no page row`).toBe(0);
          } else {
            const columns =
              block.containerWidth >= CONTAINER_LG
                ? 4
                : block.containerWidth >= CONTAINER_MD
                  ? 3
                  : 2;
            expect(block.columns, `${where}: columns`).toBe(columns);
            expect(block.columnGap, `${where}: gap between columns`).toBe(
              block.containerWidth >= CONTAINER_LG ? 24 : 16,
            );
            expect(block.rowGap, `${where}: gap between rows`).toBe(32);
            expect(block.count, `${where}: product count`).toBe(COUNT);
            expect(block.countPlacement, `${where}: the product count`).toBe(
              block.containerWidth >= CONTAINER_SM ? "beside" : "below",
            );
            expect(block.names, `${where}: names`).toEqual(NAMES);
            expect(block.prices, `${where}: prices`).toEqual(PRICES);
            expect(block.oldPrices, `${where}: old prices`).toEqual(OLD_PRICES);
            expect(block.oldPricesStruck, `${where}: old prices struck, read as "Was"`).toBe(true);
            expect(block.badges, `${where}: badges`).toEqual(BADGES);
            expect(block.badgesOnImage, `${where}: solid badges on the image`).toBe(true);
            expect(block.mediaSquareAndMuted, `${where}: square, muted image areas`).toBe(true);
            expect(block.alts, `${where}: image alt text`).toEqual(
              state === "no-images" ? NAMES.map(() => "") : NAMES.map((_, i) => ALTS[i % 4]!),
            );
            expect(block.imagesFill, `${where}: images loaded and filling their area`).toBe(true);
            expect(block.nameLinks, `${where}: name links`).toEqual(LINKED);
            expect(block.empty, `${where}: no empty message`).toBeNull();
            expect(block.buttons, `${where}: no buttons`).toEqual([]);
            expect(block.pages, `${where}: pages`).toEqual(PAGES);
            expect(block.currentPage, `${where}: current page`).toBe("1");
            // Previous is off on the first page; disabled turns off every button.
            expect(block.disabledPageButtons, `${where}: page buttons off`).toBe(
              state === "disabled" ? block.pageButtons : 1,
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

        expect(
          blocks.filter((block) => block.allLinksInert).map((block) => block.state),
          "the disabled render",
        ).toEqual(["disabled"]);
        expect(
          blocks.filter((block) => block.allLinksLive).map((block) => block.state),
          "every other render with products",
        ).toEqual(["default", "narrow", "compact", "panel", "wide", "no-images"]);

        // The heading is one size below `@md` and one larger size from it on.
        const below = new Set(
          blocks.filter((b) => b.containerWidth < CONTAINER_MD).map((b) => b.headingSize),
        );
        const above = new Set(
          blocks.filter((b) => b.containerWidth >= CONTAINER_MD).map((b) => b.headingSize),
        );
        expect(below.size, "one heading size below @md").toBe(1);
        expect(above.size, "one heading size from @md").toBe(1);
        expect([...above][0]!, "the heading steps up at @md").toBeGreaterThan([...below][0]!);

        // Each step is exercised on both sides at every viewport, so a step that
        // silently stopped firing cannot pass this file.
        const containerWidths = blocks
          .filter((b) => b.names.length > 0)
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
      for (const state of [
        "default",
        "no-images",
        "empty",
        "loading",
        "error",
        "disabled",
      ] as const) {
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

    test("centres the page row under the grid", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const offset = await page.evaluate((selector) => {
        const block = document.querySelector(`[data-demo-state="default"] ${selector}`)!;
        const grid = block.querySelector("ul")!.getBoundingClientRect();
        const nav = block.querySelector("nav")!.getBoundingClientRect();
        return {
          centre: Math.abs(nav.left + nav.width / 2 - (grid.left + grid.width / 2)),
          below: nav.top >= grid.bottom,
        };
      }, BLOCK);
      expect(offset.centre, `${scheme}: page row centred`).toBeLessThan(1);
      expect(offset.below, `${scheme}: page row under the grid`).toBe(true);
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
        "default count",
        "default current page",
        "default other page",
        "default next page",
        ...NAMES.flatMap((_, i) => [
          `default product ${i + 1} name`,
          `default product ${i + 1} price`,
        ]),
        ...OLD_PRICES.flatMap((old, i) => (old ? [`default product ${i + 1} old price`] : [])),
        ...BADGES.flatMap((badge, i) => (badge ? [`default product ${i + 1} badge`] : [])),
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

    test("shows hover and focus-visible on a name link and a page button", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      const link = block.getByRole("link", { name: LINKED[0] });
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAttribute("href", "#");

      // The name link underlines on hover.
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

      // A page button fills on hover and draws its ring on keyboard focus.
      const pageButton = block.locator('nav [data-part="item"][data-index="2"]');
      const fill = () => pageButton.evaluate((el) => getComputedStyle(el).backgroundColor);
      await page.mouse.move(0, 0);
      const resting = await fill();
      await pageButton.hover();
      expect(await fill(), `${scheme}: page button hover`).not.toBe(resting);
      await page.mouse.move(0, 0);
      await pageButton.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const ring = await pageButton.evaluate((el) => ({
        focused: el.matches(":focus-visible"),
        style: getComputedStyle(el).outlineStyle,
      }));
      expect(ring.focused, `${scheme}: page button keyboard focus`).toBe(true);
      expect(ring.style, `${scheme}: page button focus ring`).not.toBe("none");
    });

    test("moves between pages", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const nav = page.locator(`[data-demo-state="default"] ${BLOCK} nav`);
      const current = nav.locator('[aria-current="page"]');
      const previous = nav.locator('[data-part="prev-trigger"]');
      const next = nav.locator('[data-part="next-trigger"]');

      await expect(current).toHaveText("1");
      await expect(previous).toBeDisabled();

      await nav.locator('[data-part="item"][data-index="3"]').click();
      await expect(current).toHaveText("3");
      await expect(previous).toBeEnabled();

      await next.click();
      await expect(current).toHaveText("4");
      await expect(next).toBeDisabled();
    });

    test("keeps disabled links and page buttons out of reach", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "disabled");
      const block = page.locator(`[data-demo-state="disabled"] ${BLOCK}`);
      const link = block.getByRole("link", { name: LINKED[0] });
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

      // Every page button is off, so the page stays where it is.
      const buttons = block.locator("nav button");
      await expect(buttons).toHaveCount(6);
      for (const button of await buttons.all()) {
        await expect(button).toBeDisabled();
      }
      const second = block.locator('nav [data-part="item"][data-index="2"]');
      await second.evaluate((el) => (el as HTMLElement).focus());
      await expect(second).not.toBeFocused();
      await expect(block.locator('nav [aria-current="page"]')).toHaveText("1");
    });

    test("announces the loading tiles once and the failed load as an alert", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const region = page.locator(`[data-demo-state="loading"] ${BLOCK} [role="status"]`);
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region).toContainText("Loading the products");
      const hidden = await region.evaluate((el) =>
        [...el.querySelectorAll('[data-scope="skeleton"]')].every(
          (placeholder) => placeholder.closest('[aria-hidden="true"]') !== null,
        ),
      );
      expect(hidden).toBe(true);

      // Each placeholder image is square, like the image it stands for.
      const squares = await region.evaluate((el) =>
        [...el.querySelectorAll<HTMLElement>('[data-scope="skeleton"][data-shape="rect"]')].every(
          (box) => box.offsetWidth > 0 && Math.abs(box.offsetWidth - box.offsetHeight) <= 1,
        ),
      );
      expect(squares).toBe(true);

      await showState(page, "error");
      const alert = page.locator(`[data-demo-state="error"] ${BLOCK} [role="alert"]`);
      await expect(alert).toContainText(ERROR);
      await expect(alert.getByRole("button", { name: "Try again" })).toBeVisible();
    });

    test("puts every product's name in the page outline", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      await expect(block.getByRole("heading", { level: 2 })).toHaveText(HEADING);
      await expect(block.getByRole("heading", { level: 3 })).toHaveText(NAMES);
      await expect(block.getByRole("navigation")).toHaveCount(1);
    });

    test("treats an empty error string as no error", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "error");
      const block = page.locator(`[data-demo-state="error"] ${BLOCK}`);

      // The demo's retry clears its message to "", the way a consumer holding
      // the error as a string does once the load succeeds.
      await block.getByRole("button", { name: "Try again" }).click();

      await expect(block.locator('[data-scope="alert"]')).toHaveCount(0);
      await expect(block.locator("ul > li h3")).toHaveCount(NAMES.length);
      await expect(block.locator("ul h3 a")).toHaveCount(LINKED.length);
      await expect(block.locator("nav")).toHaveCount(1);
    });
  });
}
