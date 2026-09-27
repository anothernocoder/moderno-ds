/**
 * The shopping-cart block, checked on the built docs page at the three widths
 * of the responsive policy (375 / 768 / 1280) in both colour schemes. It
 * asserts text and computed styles; no screenshot baseline is committed.
 *
 * Five claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` each line's image is
 *    small and its quantity and Remove sit on their own row under it; from
 *    `--container-sm` the image grows and the quantity sits beside it, under
 *    the name; from `--container-md` the image grows again and the heading
 *    steps up; from `--container-lg` the order summary sits beside the lines
 *    instead of under them. Each copy on the page is measured against its own
 *    container width, so the narrow frame keeps the stacked layout at 1280
 *    while the wide frame has crossed every step.
 * 2. **Every state renders what it claims**, at every width: the lines (image,
 *    linked name, options, price, a quantity box and Remove) and the summary
 *    (subtotal, note, Checkout) by default; muted boxes with no images; the
 *    empty message; three placeholder lines in a busy region while loading; an
 *    error Alert with a retry; and inert links, quantity boxes and buttons when
 *    disabled. Every copy is centred in its box.
 * 3. **AA contrast** in both schemes on every text the block paints.
 * 4. **Hover and focus-visible** on a name link, a quantity box, a Remove
 *    button and Checkout, and none on the disabled ones.
 * 5. **The quantity and Remove work.** The main preview is wired the way a
 *    consumer wires it: stepping a quantity reports it, and the line's price
 *    and the subtotal follow; Remove drops the line; the quantity never goes
 *    under 1, and a number typed outside 1..99 is never reported.
 *
 * It also checks that an empty `error` string counts as no error: the cart
 * comes back, with no alert.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The line image's side at each band: `size-20`, `size-24`, `size-32`. */
const IMAGE_BASE = 80;
const IMAGE_SM = 96;
const IMAGE_MD = 128;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/shopping-cart/";

const BLOCK = "section.moderno-block-shopping-cart";

/** The cart the demo passes, and the copy the block ships with. */
const HEADING = "Shopping cart";
const NAMES = ["Stoneware mug", "Serving bowl", "Bud vase"];
const OPTIONS = ["Sage · 350 ml", "Oat · Large", "Charcoal"];
const PRICES = ["€56", "€46", "€32"];
const QUANTITIES = ["2", "1", "1"];
const ALTS = [
  "A dark green stoneware mug with a bare clay foot",
  "A wide cream bowl with a brown glaze inside",
  "A rust-red vase with a narrow neck",
];
const SUBTOTAL = "€134";
const NOTE = "Shipping and taxes are added at checkout.";
const EMPTY = "Your cart is empty.";
const ERROR = "We could not load your cart.";

interface LineMetrics {
  name: string;
  nameLink: string | null;
  options: string | null;
  price: string;
  quantity: string;
  quantityLabel: string;
  quantityDisabled: boolean;
  remove: string;
  removeVariant: string;
  removeDisabled: boolean;
  imageSide: number;
  imageSquare: boolean;
  imageMuted: boolean;
  imageAlt: string | null;
  imageLoaded: boolean;
  imageFills: boolean;
  /** Where the quantity row sits against the image: under it or beside it. */
  controls: "under" | "beside" | "none";
  /** Whether the price sits at the line's end, level with the name. */
  priceBesideName: boolean;
}

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  heading: string;
  headingSize: number;
  headingSerif: boolean;
  lines: LineMetrics[];
  /** Where the order summary sits against the lines. */
  summary: "under" | "beside" | "none";
  summaryTitle: string | null;
  summaryVariant: string | null;
  subtotalLabel: string | null;
  subtotal: string | null;
  note: string | null;
  checkout: string | null;
  checkoutVariant: string | null;
  checkoutDisabled: boolean | null;
  /** Whether every link in the block is inert: no href and `aria-disabled`. */
  linksInert: boolean;
  /** Whether every link in the block is live: an href and no `aria-disabled`. */
  linksLive: boolean;
  /** The empty message, or null. */
  empty: string | null;
  /** Placeholder lines inside a busy status region. */
  placeholders: number;
  /** Whether an error Alert is announced, and the buttons in the block. */
  alert: boolean;
  buttons: string[];
  /** Horizontal offset between the content's centre and the block's, in px. */
  offCentre: number;
}

/**
 * The page's previews (islands/ShoppingCartBlockDemo.svelte): the main preview
 * mounts the live default; the Examples frame the same block at 18rem, 30rem,
 * 40rem and 50rem, then mount the no-images, empty, loading, error and
 * disabled states. Every copy is found by the `data-demo-state` its wrapper
 * carries.
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

/** The copies that show the cart, with the demo's images. */
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

      return [...wrapper.querySelectorAll<HTMLElement>(selector)].map((section) => {
        const body = section.firstElementChild as HTMLElement | null;
        if (!body) throw new Error("the shopping-cart block did not render its own markup");
        const heading = body.querySelector("h2");
        const list = body.querySelector("ul");
        const summary = body.querySelector<HTMLElement>('[data-scope="card"][data-part="root"]');
        const links = [...section.querySelectorAll<HTMLAnchorElement>("a")];
        const busy = section.querySelector('[role="status"][aria-busy="true"]');
        const empty = [...body.children].find(
          (el) => el.tagName === "P" && el.classList.contains("border-dashed"),
        );
        const buttons = [...section.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];
        const checkout = summary?.querySelector<HTMLButtonElement>('[data-scope="button"]');

        const lines = [...(list?.querySelectorAll<HTMLElement>(":scope > li") ?? [])].map(
          (line) => {
            const [media, details, price, controls] = [...line.children] as HTMLElement[];
            const name = details!.querySelector("h3")!;
            const input = controls!.querySelector<HTMLInputElement>(
              '[data-scope="number-input"][data-part="input"]',
            )!;
            const label = controls!.querySelector('[data-scope="number-input"][data-part="label"]');
            const remove = controls!.querySelector<HTMLButtonElement>('[data-scope="button"]')!;
            const image = media!.querySelector("img");
            const m = media!.getBoundingClientRect();
            const c = controls!.getBoundingClientRect();
            const n = name.getBoundingClientRect();
            const p = price!.getBoundingClientRect();
            const i = image?.getBoundingClientRect();
            let placement: "under" | "beside" | "none" = "none";
            if (Math.round(c.top) >= Math.round(m.bottom)) placement = "under";
            else if (Math.round(c.left) >= Math.round(m.right)) placement = "beside";
            return {
              name: text(name),
              nameLink: name.querySelector("a") ? text(name.querySelector("a")) : null,
              options: text(details!.querySelector("p")) || null,
              price: text(price),
              quantity: input.value,
              quantityLabel: text(label),
              quantityDisabled: input.disabled,
              remove: remove.getAttribute("aria-label") ?? text(remove),
              removeVariant: remove.getAttribute("data-variant") ?? "",
              removeDisabled: remove.disabled,
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
              controls: placement,
              priceBesideName:
                Math.abs(p.top - n.top) < 4 &&
                Math.round(p.left) >= Math.round(n.right) &&
                Math.abs(p.right - line.getBoundingClientRect().right) < 1,
            };
          },
        );

        let summaryPlacement: "under" | "beside" | "none" = "none";
        if (list && summary) {
          const l = list.getBoundingClientRect();
          const s = summary.getBoundingClientRect();
          if (Math.round(s.top) >= Math.round(l.bottom)) summaryPlacement = "under";
          else if (Math.round(s.left) >= Math.round(l.right)) summaryPlacement = "beside";
        }

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
          lines,
          summary: summaryPlacement,
          summaryTitle: summary ? text(summary.querySelector("h3")) : null,
          summaryVariant: summary?.getAttribute("data-variant") ?? null,
          subtotalLabel: summary ? text(summary.querySelector("dt")) || null : null,
          subtotal: summary ? text(summary.querySelector("dd")) || null : null,
          note: summary ? text(summary.querySelector('[data-part="content"] > p')) || null : null,
          checkout: checkout ? text(checkout) : null,
          checkoutVariant: checkout?.getAttribute("data-variant") ?? null,
          checkoutDisabled: checkout ? checkout.disabled : null,
          linksInert:
            links.length > 0 &&
            links.every(
              (a) => !a.hasAttribute("href") && a.getAttribute("aria-disabled") === "true",
            ),
          linksLive:
            links.length > 0 &&
            links.every((a) => a.hasAttribute("href") && !a.hasAttribute("aria-disabled")),
          empty: empty ? text(empty) : null,
          placeholders: busy
            ? [...busy.children].filter(
                (el) =>
                  el.getAttribute("aria-hidden") === "true" &&
                  el.querySelector('[data-scope="skeleton"]') !== null,
              ).length
            : 0,
          alert: section.querySelector('[data-scope="alert"][role="alert"]') !== null,
          buttons: buttons.map((b) => b.getAttribute("aria-label") ?? text(b)),
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
      const line = block.querySelector("ul > li");
      const name = line?.querySelector("h3");
      const summary = block.querySelector('[data-scope="card"][data-part="root"]');
      const parts: Array<[string, Element | null | undefined]> = [
        ["heading", block.querySelector("h2")],
        ["name", name?.querySelector("a") ?? name],
        ["options", line?.children[1]?.querySelector("p")],
        ["price", line?.children[2]],
        ["quantity", line?.querySelector('[data-scope="number-input"][data-part="input"]')],
        ["summary title", summary?.querySelector("h3")],
        ["subtotal label", summary?.querySelector("dt")],
        ["subtotal", summary?.querySelector("dd")],
        ["note", summary?.querySelector('[data-part="content"] > p')],
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
  test.describe(`shopping-cart — ${scheme}`, () => {
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
          const where = `${scheme} ${width}px, ${state} (${w}px)`;

          expect(block.offCentre, `${where}: centred`).toBeLessThan(1);
          expect(block.heading, `${where}: heading`).toBe(HEADING);
          expect(block.headingSerif, `${where}: serif heading`).toBe(true);
          expect(block.alert, `${where}: error announced`).toBe(state === "error");

          if (state === "loading") {
            expect(block.placeholders, `${where}: three placeholder lines`).toBe(3);
            expect(block.lines, `${where}: no lines while loading`).toEqual([]);
            expect(block.summary, `${where}: no summary while loading`).toBe("none");
            expect(block.buttons, `${where}: no buttons while loading`).toEqual([]);
          } else if (state === "empty") {
            expect(block.empty, `${where}: empty message`).toBe(EMPTY);
            expect(block.lines, `${where}: no lines`).toEqual([]);
            expect(block.summaryTitle, `${where}: no summary`).toBeNull();
            expect(block.buttons, `${where}: no buttons`).toEqual([]);
          } else if (state === "error") {
            expect(block.lines, `${where}: no lines`).toEqual([]);
            expect(block.summaryTitle, `${where}: no summary`).toBeNull();
            expect(block.buttons, `${where}: retry only`).toEqual(["Try again"]);
          } else {
            const disabled = state === "disabled";
            expect(block.empty, `${where}: no empty message`).toBeNull();
            expect(block.placeholders, `${where}: no placeholders`).toBe(0);
            expect(
              block.lines.map((line) => line.name),
              `${where}: one line per item`,
            ).toEqual(NAMES);
            expect(block.lines.map((line) => line.nameLink)).toEqual(NAMES);
            expect(block.lines.map((line) => line.options)).toEqual(OPTIONS);
            expect(block.lines.map((line) => line.price)).toEqual(PRICES);
            expect(block.lines.map((line) => line.quantity)).toEqual(QUANTITIES);
            expect(
              block.lines.map((line) => line.quantityLabel),
              `${where}: each quantity named for its item`,
            ).toEqual(NAMES.map((name) => `Quantity, ${name}`));
            expect(
              block.lines.map((line) => line.remove),
              `${where}: each Remove named for its item`,
            ).toEqual(NAMES.map((name) => `Remove ${name}`));

            const side = w >= CONTAINER_MD ? IMAGE_MD : w >= CONTAINER_SM ? IMAGE_SM : IMAGE_BASE;
            for (const line of block.lines) {
              const at = `${where}, ${line.name}`;
              expect(line.imageSide, `${at}: image size`).toBeCloseTo(side, 0);
              expect(line.imageSquare, `${at}: square image`).toBe(true);
              expect(line.imageMuted, `${at}: muted image area`).toBe(true);
              expect(line.controls, `${at}: quantity row`).toBe(
                w >= CONTAINER_SM ? "beside" : "under",
              );
              expect(line.priceBesideName, `${at}: price at the end, level with the name`).toBe(
                true,
              );
              expect(line.removeVariant, `${at}: Remove variant`).toBe("ghost");
              expect(line.quantityDisabled, `${at}: quantity box`).toBe(disabled);
              expect(line.removeDisabled, `${at}: Remove`).toBe(disabled);
              if (WITH_IMAGES.includes(state)) {
                expect(line.imageLoaded, `${at}: image loaded`).toBe(true);
                expect(line.imageFills, `${at}: image covers its area`).toBe(true);
              } else {
                expect(line.imageAlt, `${at}: no image`).toBeNull();
              }
            }
            if (WITH_IMAGES.includes(state)) {
              expect(block.lines.map((line) => line.imageAlt)).toEqual(ALTS);
            }

            expect(block.summary, `${where}: summary against the lines`).toBe(
              w >= CONTAINER_LG ? "beside" : "under",
            );
            expect(block.summaryTitle, `${where}: summary title`).toBe("Order summary");
            expect(block.summaryVariant, `${where}: summary card variant`).toBe("muted");
            expect(block.subtotalLabel, `${where}: subtotal label`).toBe("Subtotal");
            expect(block.subtotal, `${where}: subtotal`).toBe(SUBTOTAL);
            expect(block.note, `${where}: note`).toBe(NOTE);
            expect(block.checkout, `${where}: checkout`).toBe("Checkout");
            expect(block.checkoutVariant, `${where}: checkout variant`).toBe("primary");
            expect(block.checkoutDisabled, `${where}: checkout`).toBe(disabled);
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
          blocks.filter((block) => block.linksInert).map((block) => block.state),
          "the disabled render",
        ).toEqual(["disabled"]);
        expect(
          blocks.filter((block) => block.linksLive).map((block) => block.state),
          "every render with lines",
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
          .filter((b) => b.lines.length > 0)
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

    test("clears AA contrast on every text it paints", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      const ratios = {
        ...(await contrastRatios(page, "default")),
        ...(await contrastRatios(page, "disabled")),
        ...(await contrastRatios(page, "empty")),
        ...(await contrastRatios(page, "error")),
      };
      for (const label of [
        "default heading",
        "default name",
        "default options",
        "default price",
        "default quantity",
        "default summary title",
        "default subtotal label",
        "default subtotal",
        "default note",
        "default Remove button",
        "default Checkout button",
        "disabled name",
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

    test("shows hover and focus-visible on its links, quantity boxes and buttons", async ({
      page,
    }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      const link = block.getByRole("link", { name: NAMES[0] });
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAttribute("href", "#");

      // The name link underlines on hover.
      const decoration = () => link.evaluate((el) => getComputedStyle(el).textDecorationLine);
      await page.mouse.move(0, 0);
      expect(await decoration(), `${scheme}: resting`).toBe("none");
      await link.hover();
      expect(await decoration(), `${scheme}: hover`).toBe("underline");

      // Keyboard focus draws a ring on the link, then on the quantity box, then
      // (past its two steppers) on Remove.
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

      const quantity = block.getByRole("spinbutton", { name: `Quantity, ${NAMES[0]}` });
      await page.keyboard.press("Tab");
      await expect(quantity).toBeFocused();
      const control = quantity.locator("xpath=..");
      expect(
        await control.evaluate((el) => getComputedStyle(el).outlineStyle),
        `${scheme}: focus ring on the quantity box`,
      ).not.toBe("none");

      const remove = block.getByRole("button", { name: `Remove ${NAMES[0]}` });
      await remove.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const removeRing = await remove.evaluate(ring);
      expect(removeRing.focused, `${scheme}: keyboard focus on Remove`).toBe(true);
      expect(removeRing.style, `${scheme}: focus ring on Remove`).not.toBe("none");

      // Remove (Button ghost) fills with --accent on hover.
      const fill = () => remove.evaluate((el) => getComputedStyle(el).backgroundColor);
      await page.mouse.move(0, 0);
      await remove.blur();
      const resting = await fill();
      await remove.hover();
      await expect.poll(fill, { message: `${scheme}: Remove hover` }).not.toBe(resting);

      // A stepper fills with --accent on hover too.
      const increment = block.getByRole("button", { name: /increment/i }).first();
      const stepperFill = () => increment.evaluate((el) => getComputedStyle(el).backgroundColor);
      await page.mouse.move(0, 0);
      const stepperResting = await stepperFill();
      await increment.hover();
      await expect
        .poll(stepperFill, { message: `${scheme}: stepper hover` })
        .not.toBe(stepperResting);

      // Checkout's own hover (Button primary) darkens its fill.
      const checkout = block.getByRole("button", { name: "Checkout" });
      const filter = () => checkout.evaluate((el) => getComputedStyle(el).filter);
      await page.mouse.move(0, 0);
      expect(await filter(), `${scheme}: checkout resting`).toBe("none");
      await checkout.hover();
      await expect.poll(filter, { message: `${scheme}: checkout hover` }).not.toBe("none");
    });

    test("changes a quantity and removes a line", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      const lines = block.locator("ul > li");
      const subtotal = block.locator('[data-scope="card"] dd');
      await expect(lines).toHaveCount(3);
      await expect(subtotal).toHaveText(SUBTOTAL);

      // One more mug: its line reads 3 × €28, and the subtotal follows.
      const mug = block.getByRole("spinbutton", { name: `Quantity, ${NAMES[0]}` });
      await lines
        .nth(0)
        .getByRole("button", { name: /increment/i })
        .click();
      await expect(mug).toHaveValue("3");
      await expect(lines.nth(0).locator(":scope > p")).toHaveText("€84");
      await expect(subtotal).toHaveText("€162");

      // The bowl sits at 1, the least there is: its decrement is off.
      const bowl = block.getByRole("spinbutton", { name: `Quantity, ${NAMES[1]}` });
      await expect(bowl).toHaveAttribute("aria-valuemin", "1");
      await expect(lines.nth(1).getByRole("button", { name: /decrease/i })).toBeDisabled();

      // Typing a number reports it too.
      await bowl.fill("2");
      await expect(lines.nth(1).locator(":scope > p")).toHaveText("€92");
      await expect(subtotal).toHaveText("€208");

      // Remove drops the line, and the subtotal follows.
      await block.getByRole("button", { name: `Remove ${NAMES[2]}` }).click();
      await expect(lines).toHaveCount(2);
      await expect(block.getByRole("heading", { level: 3, name: NAMES[2] })).toHaveCount(0);
      await expect(subtotal).toHaveText("€176");

      // Removing every line leaves the empty message.
      await block.getByRole("button", { name: `Remove ${NAMES[0]}` }).click();
      await block.getByRole("button", { name: `Remove ${NAMES[1]}` }).click();
      await expect(lines).toHaveCount(0);
      await expect(block).toContainText(EMPTY);
    });

    test("reports only quantities from 1 to maxQuantity", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      const mugLine = block.locator("ul > li").nth(0);
      const mugPrice = mugLine.locator(":scope > p");
      const subtotal = block.locator('[data-scope="card"] dd');
      const mug = block.getByRole("spinbutton", { name: `Quantity, ${NAMES[0]}` });
      await expect(mugPrice).toHaveText("€56");

      // Typing 0 reports nothing: the line keeps its two mugs until the box
      // loses focus, moves back to 1 and reports that.
      await mug.fill("0");
      await expect(mug).toHaveValue("0");
      await expect(mugPrice).toHaveText("€56");
      await expect(subtotal).toHaveText(SUBTOTAL);
      await mug.blur();
      await expect(mug).toHaveValue("1");
      await expect(mugPrice).toHaveText("€28");
      await expect(subtotal).toHaveText("€106");

      // Typing past the most there is (99) reports nothing either, until the
      // box moves back to 99 on blur.
      await mug.fill("150");
      await expect(mug).toHaveValue("150");
      await expect(mugPrice).toHaveText("€28");
      await expect(subtotal).toHaveText("€106");
      await mug.blur();
      await expect(mug).toHaveValue("99");
      await expect(mugPrice).toHaveText("€2772");
      await expect(subtotal).toHaveText("€2850");
    });

    test("keeps the disabled cart out of reach", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "disabled");
      const block = page.locator(`[data-demo-state="disabled"] ${BLOCK}`);
      const link = block.getByRole("link", { name: NAMES[0] });
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

      const quantity = block.getByRole("spinbutton", { name: `Quantity, ${NAMES[0]}` });
      await expect(quantity).toBeDisabled();
      for (const name of [`Remove ${NAMES[0]}`, "Checkout"]) {
        const button = block.getByRole("button", { name });
        await expect(button).toBeDisabled();
        await button.evaluate((el) => (el as HTMLElement).focus());
        await expect(button).not.toBeFocused();
      }
    });

    test("announces the loading lines once and the failed load as an alert", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const region = page.locator(`[data-demo-state="loading"] ${BLOCK} [role="status"]`);
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region).toContainText("Loading your cart");
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

    test("puts the cart in the page outline and its images in the tree", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      await expect(block.getByRole("heading", { level: 2 })).toHaveText(HEADING);
      await expect(block.getByRole("heading", { level: 3 })).toHaveText([
        ...NAMES,
        "Order summary",
      ]);
      for (const alt of ALTS) {
        await expect(block.getByRole("img", { name: alt })).toBeVisible();
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
      await expect(block.locator("ul > li")).toHaveCount(3);
      await expect(block.getByRole("button", { name: "Checkout" })).toBeEnabled();
    });
  });
}
