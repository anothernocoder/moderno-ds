/**
 * The order-history block, checked on the built docs page at the three widths
 * of the responsive policy (375 / 768 / 1280) in both colour schemes. It
 * asserts text and computed styles; no screenshot baseline is committed.
 *
 * Four claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` each order's date and
 *    total stack one per row, its "View order" button spans the card and the
 *    item images are small; from `--container-sm` the date and total sit side
 *    by side, the button moves beside them and the images grow; from
 *    `--container-md` each line's quantity moves into its own column, before
 *    the price, and the heading steps up; from `--container-lg` the block gains
 *    room above and below and between the orders. Each copy on the page is
 *    measured against its own container width, so the narrow frame keeps the
 *    stacked layout at 1280 while the wide frame has crossed every step.
 * 2. **Every state renders what it claims**, at every width: one card per order
 *    (its number, a status Badge in the status's variant, the date placed, the
 *    total, a "View order" button named for the order, and its lines: image,
 *    name, quantity, price) by default; other statuses and a neutral badge when
 *    the consumer leaves the variant out; muted boxes with no images; the empty
 *    message; two placeholder orders in a busy region while loading; an error
 *    Alert with a retry; and every button off when disabled. Every copy is
 *    centred in its box.
 * 3. **AA contrast** in both schemes on every text the block paints, the status
 *    badges included.
 * 4. **Hover and focus-visible** on a "View order" button and the retry, and no
 *    focus on the disabled buttons.
 *
 * It also checks that an empty `error` string counts as no error: the orders
 * come back, with no alert.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The line image's side at each band: `size-16`, then `size-20`. */
const IMAGE_BASE = 64;
const IMAGE_SM = 80;

/** Room above the block and between the orders: `py-12`/`gap-6`, then `py-16`/`gap-8` at @lg. */
const PADDING_BASE = 48;
const PADDING_LG = 64;
const ORDER_GAP_BASE = 24;
const ORDER_GAP_LG = 32;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/order-history/";

const BLOCK = "section.moderno-block-order-history";

/** The orders the demo passes, and the copy the block ships with. */
const HEADING = "Order history";
const DESCRIPTION = "Check the status of your recent orders.";
const MUG = "A dark green stoneware mug with a bare clay foot";
const BOWL = "A wide cream bowl with a brown glaze inside";
const VASE = "A rust-red vase with a narrow neck";

interface ExpectedOrder {
  number: string;
  status: string;
  variant: string;
  date: string;
  total: string;
  lines: Array<{ name: string; quantity: string; price: string; alt: string }>;
}

const ORDERS: ExpectedOrder[] = [
  {
    number: "WU88191111",
    status: "Shipped",
    variant: "info",
    date: "6 Jan 2026",
    total: "€134",
    lines: [
      { name: "Stoneware mug", quantity: "Qty 2", price: "€56", alt: MUG },
      { name: "Serving bowl", quantity: "Qty 1", price: "€46", alt: BOWL },
      { name: "Bud vase", quantity: "Qty 1", price: "€32", alt: VASE },
    ],
  },
  {
    number: "WU88191009",
    status: "Delivered",
    variant: "success",
    date: "18 Dec 2025",
    total: "€92",
    lines: [{ name: "Serving bowl", quantity: "Qty 2", price: "€92", alt: BOWL }],
  },
  {
    number: "WU88190874",
    status: "Cancelled",
    variant: "error",
    date: "2 Nov 2025",
    total: "€32",
    lines: [{ name: "Bud vase", quantity: "Qty 1", price: "€32", alt: VASE }],
  },
];

const OTHER_STATUSES: ExpectedOrder[] = [
  {
    number: "WU88191204",
    status: "Processing",
    variant: "warning",
    date: "9 Jan 2026",
    total: "€56",
    lines: [{ name: "Stoneware mug", quantity: "Qty 2", price: "€56", alt: MUG }],
  },
  {
    number: "WU88190512",
    status: "Returned",
    variant: "neutral",
    date: "14 Sep 2025",
    total: "€46",
    lines: [{ name: "Serving bowl", quantity: "Qty 1", price: "€46", alt: BOWL }],
  },
];

const EMPTY = "You have not placed any orders yet.";
const ERROR = "We could not load your orders.";

interface LineMetrics {
  name: string;
  quantity: string;
  price: string;
  imageSide: number;
  imageSquare: boolean;
  imageMuted: boolean;
  imageAlt: string | null;
  imageLoaded: boolean;
  imageFills: boolean;
  /** Where the quantity sits: under the name, or in its own column before the price. */
  quantityAt: "under" | "column" | "none";
  /** Whether the price sits at the line's end, level with the name. */
  priceBesideName: boolean;
}

interface OrderMetrics {
  number: string;
  status: string;
  statusVariant: string | null;
  statusDot: boolean;
  facts: string[][];
  /** Where the total sits against the date: under it, or beside it on one row. */
  factsAt: "stacked" | "row" | "none";
  button: { text: string; name: string | null; disabled: boolean } | null;
  /** Where "View order" sits: spanning the header under the facts, or beside them. */
  buttonAt: "full" | "beside" | "none";
  cardVariant: string | null;
  lines: LineMetrics[];
}

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  heading: string;
  headingSize: number;
  headingSerif: boolean;
  description: string;
  paddingTop: number;
  /** The gap between the first two orders, in px, or null with fewer than two. */
  orderGap: number | null;
  orders: OrderMetrics[];
  /** The empty message, or null. */
  empty: string | null;
  /** Placeholder orders inside a busy status region. */
  placeholders: number;
  /** Whether an error Alert is announced, and the buttons in the block. */
  alert: boolean;
  buttons: string[];
  /** Horizontal offset between the content's centre and the block's, in px. */
  offCentre: number;
}

/**
 * The page's previews (islands/OrderHistoryBlockDemo.svelte): the main preview
 * mounts the default; the Examples frame the same block at 18rem, 30rem, 40rem
 * and 50rem, then mount the other-statuses, no-images, empty, loading, error
 * and disabled states. Every copy is found by the `data-demo-state` its
 * wrapper carries.
 */
const STATES = [
  "default",
  "narrow",
  "compact",
  "panel",
  "wide",
  "statuses",
  "no-images",
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
      const text = (el: Element | null | undefined) =>
        el?.textContent?.replace(/\s+/g, " ").trim() ?? "";
      const canvas = document.createElement("canvas").getContext("2d")!;
      const paint = (color: string) => {
        canvas.fillStyle = "#000";
        canvas.fillStyle = color;
        return canvas.fillStyle;
      };
      const probe = document.createElement("div");
      probe.style.color = "var(--muted)";
      probe.style.fontFamily = "var(--font-serif)";
      document.body.append(probe);
      const muted = paint(getComputedStyle(probe).color);
      const serif = getComputedStyle(probe).fontFamily;
      probe.remove();

      function lineMetrics(line: HTMLElement) {
        const [media, name, quantity, price] = [...line.children] as HTMLElement[];
        const image = media!.querySelector("img");
        const m = media!.getBoundingClientRect();
        const q = quantity!.getBoundingClientRect();
        const n = name!.getBoundingClientRect();
        const p = price!.getBoundingClientRect();
        const i = image?.getBoundingClientRect();
        let quantityAt: "under" | "column" | "none" = "none";
        if (Math.round(q.top) >= Math.round(n.bottom) && Math.abs(q.left - n.left) < 1) {
          quantityAt = "under";
        } else if (
          Math.abs(q.top - n.top) < 4 &&
          Math.round(q.left) >= Math.round(n.right) &&
          Math.round(q.right) <= Math.round(p.left)
        ) {
          quantityAt = "column";
        }
        return {
          name: text(name),
          quantity: text(quantity),
          price: text(price),
          imageSide: m.width,
          imageSquare: Math.abs(m.width - m.height) < 1,
          imageMuted: paint(getComputedStyle(media!).backgroundColor) === muted,
          imageAlt: image ? image.getAttribute("alt") : null,
          imageLoaded: image ? image.complete && image.naturalWidth > 0 : false,
          imageFills:
            i !== undefined
              ? Math.abs(i.width - m.width) < 1 &&
                Math.abs(i.height - m.height) < 1 &&
                getComputedStyle(image!).objectFit === "cover"
              : false,
          quantityAt,
          priceBesideName:
            Math.abs(p.top - n.top) < 4 &&
            Math.round(p.left) >= Math.round(n.right) &&
            Math.abs(p.right - line.getBoundingClientRect().right) < 1,
        };
      }

      function orderMetrics(order: HTMLElement) {
        const card = order.querySelector<HTMLElement>('[data-scope="card"][data-part="root"]');
        const header = card?.querySelector<HTMLElement>('[data-scope="card"][data-part="header"]');
        const [info, button] = [...(header?.children ?? [])] as HTMLElement[];
        const badge = info?.querySelector('[data-scope="badge"][data-part="root"]');
        const facts = [...(info?.querySelectorAll<HTMLElement>("dl > div") ?? [])];
        let factsAt: "stacked" | "row" | "none" = "none";
        if (facts.length === 2) {
          const [a, b] = facts.map((fact) => fact.getBoundingClientRect());
          if (Math.round(b!.top) >= Math.round(a!.bottom)) factsAt = "stacked";
          else if (Math.abs(b!.top - a!.top) < 1 && Math.round(b!.left) >= Math.round(a!.right))
            factsAt = "row";
        }
        let buttonAt: "full" | "beside" | "none" = "none";
        if (info && button) {
          const f = info.getBoundingClientRect();
          const b = button.getBoundingClientRect();
          if (
            Math.round(b.top) >= Math.round(f.bottom) &&
            Math.abs(b.left - f.left) < 1 &&
            Math.abs(b.right - f.right) < 1
          ) {
            buttonAt = "full";
          } else if (Math.round(b.left) >= Math.round(f.right)) {
            buttonAt = "beside";
          }
        }
        return {
          number: text(info?.querySelector("h3")),
          status: text(badge),
          statusVariant: badge?.getAttribute("data-variant") ?? null,
          statusDot: badge?.querySelector('[data-part="dot"]') !== null,
          facts: facts.map((fact) => [
            text(fact.querySelector("dt")),
            text(fact.querySelector("dd")),
          ]),
          factsAt,
          button:
            button instanceof HTMLButtonElement
              ? {
                  text: text(button),
                  name: button.getAttribute("aria-label"),
                  disabled: button.disabled,
                }
              : null,
          buttonAt,
          cardVariant: card?.getAttribute("data-variant") ?? null,
          lines: [...(card?.querySelectorAll<HTMLElement>(":scope > ul > li") ?? [])].map(
            lineMetrics,
          ),
        };
      }

      return [...wrapper.querySelectorAll<HTMLElement>(selector)].map((section) => {
        const body = section.firstElementChild as HTMLElement | null;
        if (!body) throw new Error("the order-history block did not render its own markup");
        const heading = body.querySelector("h2");
        const list = [...body.children].find((el) => el.tagName === "UL");
        const orders = [...(list?.children ?? [])] as HTMLElement[];
        const busy = section.querySelector('[role="status"][aria-busy="true"]');
        const empty = [...body.children].find(
          (el) => el.tagName === "P" && el.classList.contains("border-dashed"),
        );
        const content = [...body.children]
          .filter((el) => !el.classList.contains("sr-only"))
          .map((el) => el.getBoundingClientRect());
        const left = Math.min(...content.map((r) => r.left));
        const right = Math.max(...content.map((r) => r.right));
        const blockBox = section.getBoundingClientRect();

        return {
          containerWidth: section.offsetWidth,
          heading: text(heading),
          headingSize: heading ? parseFloat(getComputedStyle(heading).fontSize) : 0,
          headingSerif: heading ? getComputedStyle(heading).fontFamily === serif : false,
          description: text(heading?.nextElementSibling),
          paddingTop: parseFloat(getComputedStyle(body).paddingTop),
          orderGap:
            orders.length > 1
              ? orders[1]!.getBoundingClientRect().top - orders[0]!.getBoundingClientRect().bottom
              : null,
          orders: orders.map(orderMetrics),
          empty: empty ? text(empty) : null,
          placeholders: busy
            ? [...busy.children].filter(
                (el) =>
                  el.getAttribute("aria-hidden") === "true" &&
                  el.querySelector('[data-scope="skeleton"]') !== null,
              ).length
            : 0,
          alert: section.querySelector('[data-scope="alert"][role="alert"]') !== null,
          buttons: [...section.querySelectorAll<HTMLButtonElement>("button")].map((b) => text(b)),
          offCentre: Math.abs(left + (right - left) / 2 - (blockBox.left + blockBox.width / 2)),
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
  state: "default" | "statuses" | "empty" | "error",
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
      const header = block.querySelector('[data-scope="card"][data-part="header"]');
      const fact = header?.querySelector("dl > div");
      const line = block.querySelector('[data-scope="card"] > ul > li');
      const parts: Array<[string, Element | null | undefined]> = [
        ["heading", block.querySelector("h2")],
        ["description", block.querySelector("h2")?.nextElementSibling],
        ["order number", header?.querySelector("h3")],
        ["fact label", fact?.querySelector("dt")],
        ["fact value", fact?.querySelector("dd")],
        ["item name", line?.children[1]],
        ["quantity", line?.children[2]],
        ["price", line?.children[3]],
        ["empty message", block.querySelector("p.border-dashed")],
        ["alert title", block.querySelector('[data-scope="alert"] [data-part="title"]')],
        [
          "alert description",
          block.querySelector('[data-scope="alert"] [data-part="description"]'),
        ],
      ];

      const ratios: Record<string, number> = {};
      for (const [what, el] of parts) {
        if (el) ratios[`${state} ${what}`] = against(el);
      }
      for (const badge of block.querySelectorAll('[data-scope="badge"][data-part="root"]')) {
        ratios[`${state} ${badge.textContent?.trim()} badge`] = against(badge);
      }
      const buttons = [...block.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];
      for (const button of buttons) {
        // A disabled control is exempt from AA (WCAG 1.4.3, "inactive").
        if (button.disabled) continue;
        const label = button.textContent?.trim() ?? "button";
        ratios[`${state} ${label} button`] = against(button);
      }
      return ratios;
    },
    { state, selector: BLOCK },
  );
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`order-history — ${scheme}`, () => {
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
          const w = block.containerWidth;
          const lg = w >= CONTAINER_LG;
          const where = `${scheme} ${width}px, ${state} (${w}px)`;

          expect(block.offCentre, `${where}: centred`).toBeLessThan(1);
          expect(block.heading, `${where}: heading`).toBe(HEADING);
          expect(block.headingSerif, `${where}: serif heading`).toBe(true);
          expect(block.description, `${where}: description`).toBe(DESCRIPTION);
          expect(block.paddingTop, `${where}: room above`).toBe(lg ? PADDING_LG : PADDING_BASE);
          expect(block.alert, `${where}: error announced`).toBe(state === "error");

          if (state === "loading") {
            expect(block.placeholders, `${where}: two placeholder orders`).toBe(2);
            expect(block.orders, `${where}: no orders while loading`).toEqual([]);
            expect(block.buttons, `${where}: no buttons while loading`).toEqual([]);
          } else if (state === "empty") {
            expect(block.empty, `${where}: empty message`).toBe(EMPTY);
            expect(block.orders, `${where}: no orders`).toEqual([]);
            expect(block.buttons, `${where}: no buttons`).toEqual([]);
          } else if (state === "error") {
            expect(block.orders, `${where}: no orders`).toEqual([]);
            expect(block.buttons, `${where}: retry only`).toEqual(["Try again"]);
          } else {
            const expected = state === "statuses" ? OTHER_STATUSES : ORDERS;
            expect(block.empty, `${where}: no empty message`).toBeNull();
            expect(block.placeholders, `${where}: no placeholders`).toBe(0);
            expect(block.orderGap, `${where}: gap between orders`).toBeCloseTo(
              lg ? ORDER_GAP_LG : ORDER_GAP_BASE,
              0,
            );
            expect(
              block.orders.map((order) => order.number),
              `${where}: one card per order`,
            ).toEqual(expected.map((order) => `Order ${order.number}`));

            const side = w >= CONTAINER_SM ? IMAGE_SM : IMAGE_BASE;
            block.orders.forEach((order, index) => {
              const want = expected[index]!;
              const at = `${where}, ${order.number}`;
              expect(order.cardVariant, `${at}: outline card`).toBe("outline");
              expect(order.status, `${at}: status`).toBe(want.status);
              expect(order.statusVariant, `${at}: status variant`).toBe(want.variant);
              expect(order.statusDot, `${at}: status dot`).toBe(true);
              expect(order.facts, `${at}: facts`).toEqual([
                ["Date placed", want.date],
                ["Total", want.total],
              ]);
              expect(order.factsAt, `${at}: date and total`).toBe(
                w >= CONTAINER_SM ? "row" : "stacked",
              );
              expect(order.button, `${at}: view button`).toEqual({
                text: "View order",
                name: `View order ${want.number}`,
                disabled: state === "disabled",
              });
              expect(order.buttonAt, `${at}: view button placement`).toBe(
                w >= CONTAINER_SM ? "beside" : "full",
              );
              expect(order.lines.map((line) => line.name)).toEqual(
                want.lines.map((line) => line.name),
              );
              expect(order.lines.map((line) => line.quantity)).toEqual(
                want.lines.map((line) => line.quantity),
              );
              expect(order.lines.map((line) => line.price)).toEqual(
                want.lines.map((line) => line.price),
              );
              for (const line of order.lines) {
                const lineAt = `${at}, ${line.name}`;
                expect(line.imageSide, `${lineAt}: image size`).toBeCloseTo(side, 0);
                expect(line.imageSquare, `${lineAt}: square image`).toBe(true);
                expect(line.imageMuted, `${lineAt}: muted image area`).toBe(true);
                expect(line.quantityAt, `${lineAt}: quantity`).toBe(
                  w >= CONTAINER_MD ? "column" : "under",
                );
                expect(
                  line.priceBesideName,
                  `${lineAt}: price at the end, level with the name`,
                ).toBe(true);
                if (state === "no-images") {
                  expect(line.imageAlt, `${lineAt}: no image`).toBeNull();
                } else {
                  expect(line.imageLoaded, `${lineAt}: image loaded`).toBe(true);
                  expect(line.imageFills, `${lineAt}: image covers its area`).toBe(true);
                }
              }
              if (state !== "no-images") {
                expect(order.lines.map((line) => line.imageAlt)).toEqual(
                  want.lines.map((line) => line.alt),
                );
              }
            });
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
          .filter((b) => b.orders.length > 0)
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
        "statuses",
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

    test("clears AA contrast on every text it paints", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      const ratios = {
        ...(await contrastRatios(page, "default")),
        ...(await contrastRatios(page, "statuses")),
        ...(await contrastRatios(page, "empty")),
        ...(await contrastRatios(page, "error")),
      };
      for (const label of [
        "default heading",
        "default description",
        "default order number",
        "default fact label",
        "default fact value",
        "default item name",
        "default quantity",
        "default price",
        "default Shipped badge",
        "default Delivered badge",
        "default Cancelled badge",
        "default View order button",
        "statuses Processing badge",
        "statuses Returned badge",
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

    test("shows hover and focus-visible on its buttons", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      const ring = (el: Element) => ({
        focused: el.matches(":focus-visible"),
        style: getComputedStyle(el).outlineStyle,
      });

      for (const [state, name] of [
        ["default", `View order ${ORDERS[0]!.number}`],
        ["error", "Try again"],
      ] as const) {
        await showState(page, state);
        const button = page
          .locator(`[data-demo-state="${state}"] ${BLOCK}`)
          .getByRole("button", { name, exact: true });
        await expect(button).toHaveCount(1);

        // Keyboard focus draws a ring (Button's own focus-visible rule).
        await button.focus();
        await page.keyboard.press("Shift+Tab");
        await page.keyboard.press("Tab");
        const focus = await button.evaluate(ring);
        expect(focus.focused, `${scheme}: keyboard focus on ${name}`).toBe(true);
        expect(focus.style, `${scheme}: focus ring on ${name}`).not.toBe("none");

        // Button outline fills on hover.
        const fill = () => button.evaluate((el) => getComputedStyle(el).backgroundColor);
        await button.blur();
        await page.mouse.move(0, 0);
        const resting = await fill();
        await button.hover();
        await expect.poll(fill, { message: `${scheme}: ${name} hover` }).not.toBe(resting);
      }

      // Tab moves from one order's button to the next.
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      await showState(page, "default");
      await block.getByRole("button", { name: `View order ${ORDERS[0]!.number}` }).focus();
      await page.keyboard.press("Tab");
      await expect(
        block.getByRole("button", { name: `View order ${ORDERS[1]!.number}` }),
      ).toBeFocused();
    });

    test("keeps the disabled buttons out of reach", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "disabled");
      const block = page.locator(`[data-demo-state="disabled"] ${BLOCK}`);
      for (const order of ORDERS) {
        const button = block.getByRole("button", { name: `View order ${order.number}` });
        await expect(button).toBeDisabled();
        await button.evaluate((el) => (el as HTMLElement).focus());
        await expect(button).not.toBeFocused();
      }
    });

    test("announces the loading orders once and the failed load as an alert", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const region = page.locator(`[data-demo-state="loading"] ${BLOCK} [role="status"]`);
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region).toContainText("Loading your orders");
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

    test("puts the orders in the page outline and their images in the tree", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      await expect(block.getByRole("heading", { level: 2 })).toHaveText(HEADING);
      await expect(block.getByRole("heading", { level: 3 })).toHaveText(
        ORDERS.map((order) => `Order ${order.number}`),
      );
      for (const alt of [MUG, BOWL, VASE]) {
        await expect(block.getByRole("img", { name: alt }).first()).toBeVisible();
      }
      // The badge's dot is decoration: the status is read from its text.
      const dots = block.locator('[data-scope="badge"] [data-part="dot"]');
      await expect(dots).toHaveCount(ORDERS.length);
      for (const dot of await dots.all()) {
        await expect(dot).toHaveAttribute("aria-hidden", "true");
      }
    });

    test("treats an empty error string as no error", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "error");
      const block = page.locator(`[data-demo-state="error"] ${BLOCK}`);

      // The demo's retry clears its message to "", the way a consumer holding
      // the error as a string does once the load succeeds.
      await block.getByRole("button", { name: "Try again" }).click();

      await expect(block.locator('[data-scope="alert"]')).toHaveCount(0);
      await expect(block.getByRole("heading", { level: 3 })).toHaveCount(ORDERS.length);
      await expect(block.getByRole("button", { name: /^View order / })).toHaveCount(ORDERS.length);
    });
  });
}
