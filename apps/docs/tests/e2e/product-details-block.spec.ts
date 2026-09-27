/**
 * The product-details block, checked on the built docs page at the three
 * widths of the responsive policy (375 / 768 / 1280) in both colour schemes. It
 * asserts text and computed styles; no screenshot baseline is committed.
 *
 * Five claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` the quantity sits
 *    above Add to cart; from `--container-sm` they share a row; from
 *    `--container-md` the name steps up; from `--container-lg` the gallery
 *    sits beside the details instead of above them. Each copy on the page is
 *    measured against its own container width, so the narrow frame keeps the
 *    stacked layout at 1280 while the wide frame has crossed every step.
 * 2. **Every state renders what it claims**, at every width: the gallery (a
 *    Carousel of four photos with its controls), the name, price, description,
 *    one RadioGroup per option with the sold-out value off, the quantity, Add
 *    to cart and the tabs by default; one muted square with no photos; "Sold
 *    out" on the button when an option has no value left; a busy "Adding"
 *    button; the empty message; placeholders in a busy region while loading;
 *    an error Alert with a retry; and every option, the quantity and the
 *    button off when disabled, with the gallery and the tabs still working.
 *    Every copy is centred in its box.
 * 3. **AA contrast** in both schemes on every text the block paints.
 * 4. **Hover and focus-visible** on a gallery button, an option, the quantity
 *    box, Add to cart and a tab.
 * 5. **It works.** The main preview is wired the way a consumer wires it: the
 *    gallery pages through the photos, a tab opens its text, and Add to cart
 *    reports the chosen options and a whole quantity from 1 to 99, then shows
 *    "Adding" while the demo's request runs.
 *
 * It also checks that an empty `error` string counts as no error: the product
 * comes back, with no alert.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/product-details/";

const BLOCK = "section.moderno-block-product-details";

/** The product the demo passes, and the copy the block ships with. */
const NAME = "Stoneware mug";
const PRICE = "€28";
const DESCRIPTION =
  "Thrown and glazed by hand in small batches, so no two are quite the same. A wide handle and a heavy base keep it steady on the desk.";
const OPTIONS = [
  { name: "Colour", values: ["Sage", "Oat", "Charcoal Sold out"], checked: "Sage" },
  { name: "Size", values: ["250 ml", "350 ml", "450 ml"], checked: "250 ml" },
];
const TABS = ["Details", "Care", "Shipping"];
const DETAILS = "Stoneware, glazed inside and out. The foot is left bare, so you feel the clay.";
const CARE = "Safe in the dishwasher and the microwave. Avoid sudden changes of temperature.";
const ALTS = [
  "A dark green stoneware mug with a bare clay foot, handle to the right",
  "The same mug turned round, handle to the left",
  "The mug from above, glazed dark green inside",
  "The green mug beside an unglazed clay mug",
];
const EMPTY = "This product is no longer available.";
const ERROR = "We could not load this product.";

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  name: string | null;
  nameSize: number;
  nameSerif: boolean;
  price: string | null;
  description: string | null;
  /** The gallery: its slides, the photos in them, and its controls. */
  slides: number;
  alts: string[];
  imagesLoaded: boolean;
  imagesFill: boolean;
  slidesSquareMuted: boolean;
  indicators: number;
  galleryLabel: string | null;
  /** One muted square in place of the gallery. */
  placeholderSquare: boolean;
  /** Where the gallery sits against the details. */
  gallery: "above" | "beside" | "none";
  options: Array<{
    name: string;
    values: string[];
    checked: string | null;
    disabled: string[];
    groupDisabled: boolean;
  }>;
  quantity: string | null;
  quantityLabel: string | null;
  quantityDisabled: boolean | null;
  /** Where the quantity sits against the button. */
  quantityPlacement: "above" | "beside" | "none";
  button: string | null;
  buttonVariant: string | null;
  buttonDisabled: boolean | null;
  buttonBusy: boolean;
  buttonSpinner: boolean;
  tabs: string[];
  panel: string | null;
  empty: string | null;
  /** Placeholders inside a busy status region. */
  placeholders: number;
  alert: boolean;
  buttons: string[];
  /** Horizontal offset between the content's centre and the block's, in px. */
  offCentre: number;
}

/**
 * The page's previews (islands/ProductDetailsBlockDemo.svelte): the main
 * preview mounts the live default; the Examples frame the same block at 18rem,
 * 30rem, 40rem and 50rem, then mount the no-photos, sold-out, adding, empty,
 * loading, error and disabled states. Every copy is found by the
 * `data-demo-state` its wrapper carries.
 */
const STATES = [
  "default",
  "narrow",
  "compact",
  "panel",
  "wide",
  "no-photos",
  "sold-out",
  "adding",
  "empty",
  "loading",
  "error",
  "disabled",
] as const;
type State = (typeof STATES)[number];

/** The copies that show the product. */
const WITH_PRODUCT: State[] = [
  "default",
  "narrow",
  "compact",
  "panel",
  "wide",
  "no-photos",
  "sold-out",
  "adding",
  "disabled",
];

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
        if (!body) throw new Error("the product-details block did not render its own markup");
        const content = body.firstElementChild as HTMLElement | null;
        const heading = section.querySelector("h2");
        const carousel = section.querySelector<HTMLElement>(
          '[data-scope="carousel"][data-part="root"]',
        );
        const slides = [
          ...section.querySelectorAll<HTMLElement>('[data-scope="carousel"][data-part="item"]'),
        ];
        const images = [...section.querySelectorAll<HTMLImageElement>("img")];
        const galleryBox =
          content?.children.length === 2 ? (content.children[0] as HTMLElement) : null;
        const details =
          content?.children.length === 2 ? (content.children[1] as HTMLElement) : null;
        const quantityRoot = section.querySelector<HTMLElement>(
          '[data-scope="number-input"][data-part="root"]',
        );
        const quantityInput = section.querySelector<HTMLInputElement>(
          '[data-scope="number-input"][data-part="input"]',
        );
        const primary = section.querySelector<HTMLButtonElement>(
          '[data-scope="button"][data-variant="primary"]',
        );
        const busy = section.querySelector('[role="status"][aria-busy="true"]');
        const empty = body.querySelector(":scope > p.border-dashed");
        const buttons = [...section.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];

        let gallery: "above" | "beside" | "none" = "none";
        if (galleryBox && details) {
          const g = galleryBox.getBoundingClientRect();
          const d = details.getBoundingClientRect();
          if (Math.round(d.top) >= Math.round(g.bottom)) gallery = "above";
          else if (Math.round(d.left) >= Math.round(g.right)) gallery = "beside";
        }

        let quantityPlacement: "above" | "beside" | "none" = "none";
        if (quantityRoot && primary) {
          const q = quantityRoot.getBoundingClientRect();
          const b = primary.getBoundingClientRect();
          if (Math.round(b.top) >= Math.round(q.bottom)) quantityPlacement = "above";
          else if (Math.round(b.left) >= Math.round(q.right)) quantityPlacement = "beside";
        }

        const panel = section.querySelector<HTMLElement>(
          '[data-scope="tabs"][data-part="content"]:not([hidden])',
        );
        const blockBox = section.getBoundingClientRect();
        const c = content?.getBoundingClientRect();

        return {
          containerWidth: section.offsetWidth,
          name: heading ? text(heading) : null,
          nameSize: heading ? parseFloat(getComputedStyle(heading).fontSize) : 0,
          nameSerif: heading ? getComputedStyle(heading).fontFamily === serif : false,
          price: heading ? text(heading.nextElementSibling?.firstElementChild) : null,
          description: details
            ? text(details.querySelector(":scope > p.text-muted-foreground")) || null
            : null,
          slides: slides.length,
          alts: images.map((image) => image.getAttribute("alt") ?? ""),
          imagesLoaded:
            images.length > 0 && images.every((image) => image.complete && image.naturalWidth > 0),
          imagesFill:
            images.length > 0 &&
            images.every((image) => {
              const i = image.getBoundingClientRect();
              const frame = image.parentElement!.getBoundingClientRect();
              return (
                Math.abs(i.width - frame.width) < 1 &&
                Math.abs(i.height - frame.height) < 1 &&
                getComputedStyle(image).objectFit === "cover"
              );
            }),
          slidesSquareMuted:
            slides.length > 0 &&
            slides.every((slide) => {
              const frame = slide.firstElementChild as HTMLElement;
              const f = frame.getBoundingClientRect();
              return (
                Math.abs(f.width - f.height) < 1 &&
                Math.abs(f.width - carousel!.getBoundingClientRect().width) < 1 &&
                paint(getComputedStyle(frame).backgroundColor) === muted
              );
            }),
          indicators: section.querySelectorAll('[data-scope="carousel"][data-part="indicator"]')
            .length,
          galleryLabel: carousel?.getAttribute("aria-label") ?? null,
          placeholderSquare:
            galleryBox !== null &&
            carousel === null &&
            (() => {
              const g = galleryBox.getBoundingClientRect();
              return (
                Math.abs(g.width - g.height) < 1 &&
                paint(getComputedStyle(galleryBox).backgroundColor) === muted
              );
            })(),
          gallery,
          options: [
            ...section.querySelectorAll<HTMLElement>(
              '[data-scope="radio-group"][data-part="root"]',
            ),
          ].map((group) => {
            const items = [
              ...group.querySelectorAll<HTMLElement>(
                '[data-scope="radio-group"][data-part="item"]',
              ),
            ];
            return {
              name: text(group.querySelector('[data-part="label"]')),
              values: items.map((item) => text(item.querySelector('[data-part="item-text"]'))),
              checked:
                text(
                  items
                    .find((item) => item.querySelector("input")!.checked)
                    ?.querySelector('[data-part="item-text"]'),
                ) || null,
              disabled: items
                .filter((item) => item.querySelector("input")!.disabled)
                .map((item) => text(item.querySelector('[data-part="item-text"]'))),
              groupDisabled: group.hasAttribute("data-disabled"),
            };
          }),
          quantity: quantityInput?.value ?? null,
          quantityLabel: quantityRoot
            ? text(quantityRoot.querySelector('[data-part="label"]'))
            : null,
          quantityDisabled: quantityInput ? quantityInput.disabled : null,
          quantityPlacement,
          button: primary ? (primary.getAttribute("aria-label") ?? text(primary)) : null,
          buttonVariant: primary?.getAttribute("data-variant") ?? null,
          buttonDisabled: primary ? primary.disabled : null,
          buttonBusy: primary?.getAttribute("aria-busy") === "true",
          buttonSpinner:
            primary?.querySelector('[data-scope="spinner"]') !== null && primary !== null,
          tabs: [...section.querySelectorAll('[role="tab"]')].map((tab) => text(tab)),
          panel: panel ? text(panel) : null,
          empty: empty ? text(empty) : null,
          placeholders: busy ? busy.querySelectorAll('[data-scope="skeleton"]').length : 0,
          alert: section.querySelector('[data-scope="alert"][role="alert"]') !== null,
          buttons: buttons.map((b) => b.getAttribute("aria-label") ?? text(b)),
          offCentre: c
            ? Math.abs(c.left + c.width / 2 - (blockBox.left + blockBox.width / 2))
            : Number.POSITIVE_INFINITY,
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
  state: "default" | "empty" | "error" | "adding",
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
      const heading = block.querySelector("h2");
      const enabledItem = [
        ...block.querySelectorAll('[data-scope="radio-group"][data-part="item"]'),
      ].find((item) => !item.hasAttribute("data-disabled"));
      const parts: Array<[string, Element | null | undefined]> = [
        ["name", heading],
        ["price", heading?.nextElementSibling?.firstElementChild],
        ["description", block.querySelector("p.text-body.text-muted-foreground")],
        ["option label", block.querySelector('[data-scope="radio-group"][data-part="label"]')],
        ["option", enabledItem?.querySelector('[data-part="item-text"]')],
        ["quantity label", block.querySelector('[data-scope="number-input"][data-part="label"]')],
        ["quantity", block.querySelector('[data-scope="number-input"][data-part="input"]')],
        ["selected tab", block.querySelector('[role="tab"][aria-selected="true"]')],
        ["other tab", block.querySelector('[role="tab"][aria-selected="false"]')],
        ["tab text", block.querySelector('[data-scope="tabs"][data-part="content"]:not([hidden])')],
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
  test.describe(`product-details — ${scheme}`, () => {
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
          expect(block.alert, `${where}: error announced`).toBe(state === "error");

          if (state === "loading") {
            expect(block.placeholders, `${where}: placeholders`).toBeGreaterThan(0);
            expect(block.name, `${where}: no name while loading`).toBeNull();
            expect(block.buttons, `${where}: no buttons while loading`).toEqual([]);
          } else if (state === "empty") {
            expect(block.empty, `${where}: empty message`).toBe(EMPTY);
            expect(block.name, `${where}: no name`).toBeNull();
            expect(block.buttons, `${where}: no buttons`).toEqual([]);
          } else if (state === "error") {
            expect(block.name, `${where}: no product`).toBeNull();
            expect(block.buttons, `${where}: retry only`).toEqual(["Try again"]);
          } else {
            const disabled = state === "disabled";
            expect(block.empty, `${where}: no empty message`).toBeNull();
            expect(block.placeholders, `${where}: no placeholders`).toBe(0);
            expect(block.name, `${where}: name`).toBe(NAME);
            expect(block.nameSerif, `${where}: serif name`).toBe(true);
            expect(block.price, `${where}: price`).toBe(PRICE);
            expect(block.description, `${where}: description`).toBe(DESCRIPTION);

            if (state === "no-photos") {
              expect(block.slides, `${where}: no gallery`).toBe(0);
              expect(block.alts, `${where}: no photos`).toEqual([]);
              expect(block.placeholderSquare, `${where}: one muted square`).toBe(true);
            } else {
              expect(block.galleryLabel, `${where}: gallery named`).toBe(`Photos of ${NAME}`);
              expect(block.slides, `${where}: one slide per photo`).toBe(ALTS.length);
              expect(block.indicators, `${where}: one dot per photo`).toBe(ALTS.length);
              expect(block.alts, `${where}: alt text`).toEqual(ALTS);
              expect(block.imagesLoaded, `${where}: photos loaded`).toBe(true);
              expect(block.imagesFill, `${where}: photos cover their frames`).toBe(true);
              expect(block.slidesSquareMuted, `${where}: square muted frames`).toBe(true);
            }
            expect(block.gallery, `${where}: gallery against the details`).toBe(
              w >= CONTAINER_LG ? "beside" : "above",
            );

            const expectedOptions =
              state === "sold-out"
                ? [
                    OPTIONS[0]!,
                    {
                      name: "Size",
                      values: OPTIONS[1]!.values.map((value) => `${value} Sold out`),
                      checked: null,
                    },
                  ]
                : OPTIONS;
            expect(
              block.options.map(({ name, values, checked }) => ({ name, values, checked })),
              `${where}: options`,
            ).toEqual(expectedOptions);
            for (const option of block.options) {
              expect(option.groupDisabled, `${where}: ${option.name} group`).toBe(disabled);
              if (!disabled) {
                expect(option.disabled, `${where}: ${option.name} sold-out values off`).toEqual(
                  option.values.filter((value) => value.endsWith("Sold out")),
                );
              }
            }

            expect(block.quantityLabel, `${where}: quantity label`).toBe("Quantity");
            expect(block.quantity, `${where}: quantity`).toBe("1");
            expect(block.quantityDisabled, `${where}: quantity box`).toBe(
              disabled || state === "sold-out",
            );
            expect(block.quantityPlacement, `${where}: quantity against the button`).toBe(
              w >= CONTAINER_SM ? "beside" : "above",
            );
            expect(block.buttonVariant, `${where}: button variant`).toBe("primary");
            expect(block.button, `${where}: button`).toBe(
              state === "adding"
                ? "Loading Adding"
                : state === "sold-out"
                  ? "Sold out"
                  : "Add to cart",
            );
            expect(block.buttonDisabled, `${where}: button off`).toBe(
              disabled || state === "adding" || state === "sold-out",
            );
            expect(block.buttonBusy, `${where}: button busy`).toBe(state === "adding");
            expect(block.buttonSpinner, `${where}: spinner`).toBe(state === "adding");
            expect(block.tabs, `${where}: tabs`).toEqual(TABS);
            expect(block.panel, `${where}: first tab open`).toBe(DETAILS);
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

        // The name is one size below `@md` and one larger size from it on.
        const named = blocks.filter((b) => b.name !== null);
        const below = new Set(
          named.filter((b) => b.containerWidth < CONTAINER_MD).map((b) => b.nameSize),
        );
        const above = new Set(
          named.filter((b) => b.containerWidth >= CONTAINER_MD).map((b) => b.nameSize),
        );
        expect(below.size, "one name size below @md").toBe(1);
        expect(above.size, "one name size from @md").toBe(1);
        expect([...above][0]!, "the name steps up at @md").toBeGreaterThan([...below][0]!);

        // Each step is exercised on both sides at every viewport, so a step that
        // silently stopped firing cannot pass this file.
        const containerWidths = named.map((b) => b.containerWidth);
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
        expect(
          blocks.filter((b) => WITH_PRODUCT.includes(b.state)).every((b) => b.name === NAME),
        ).toBe(true);
      });
    }

    test("sits in the middle of its preview", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      for (const state of [
        "default",
        "no-photos",
        "sold-out",
        "adding",
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
            const content = wrapper
              .querySelector(selector)!
              .firstElementChild!.firstElementChild!.getBoundingClientRect();
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
        ...(await contrastRatios(page, "default")),
        ...(await contrastRatios(page, "adding")),
        ...(await contrastRatios(page, "empty")),
        ...(await contrastRatios(page, "error")),
      };
      for (const label of [
        "default name",
        "default price",
        "default description",
        "default option label",
        "default option",
        "default quantity label",
        "default quantity",
        "default selected tab",
        "default other tab",
        "default tab text",
        "default Add to cart button",
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

    test("shows hover and focus-visible on its controls", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      const ring = (el: Element) => ({
        focused: el.matches(":focus-visible"),
        style: getComputedStyle(el).outlineStyle,
      });

      // The gallery's next button fills with --accent on hover and rings on focus.
      const next = block.getByRole("button", { name: "Next slide" });
      const fill = () => next.evaluate((el) => getComputedStyle(el).backgroundColor);
      await page.mouse.move(0, 0);
      const resting = await fill();
      await next.hover();
      await expect.poll(fill, { message: `${scheme}: next hover` }).not.toBe(resting);
      await next.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const nextRing = await next.evaluate(ring);
      expect(nextRing.focused, `${scheme}: keyboard focus on next`).toBe(true);
      expect(nextRing.style, `${scheme}: focus ring on next`).not.toBe("none");

      // A radio draws its ring on its circle when the keyboard reaches it.
      const sage = block.getByRole("radio", { name: "Sage" });
      await sage.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      await expect(sage).toBeFocused();
      const circle = block.locator('[data-scope="radio-group"][data-part="item-control"]').first();
      expect(
        await circle.evaluate((el) => getComputedStyle(el).outlineStyle),
        `${scheme}: focus ring on an option`,
      ).not.toBe("none");

      // The quantity box rings when focused.
      const quantity = block.getByRole("spinbutton", { name: "Quantity" });
      await quantity.focus();
      expect(
        await quantity.locator("xpath=..").evaluate((el) => getComputedStyle(el).outlineStyle),
        `${scheme}: focus ring on the quantity box`,
      ).not.toBe("none");

      // Add to cart darkens on hover and rings on keyboard focus.
      const add = block.getByRole("button", { name: "Add to cart" });
      const filter = () => add.evaluate((el) => getComputedStyle(el).filter);
      await page.mouse.move(0, 0);
      expect(await filter(), `${scheme}: add resting`).toBe("none");
      await add.hover();
      await expect.poll(filter, { message: `${scheme}: add hover` }).not.toBe("none");
      await add.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const addRing = await add.evaluate(ring);
      expect(addRing.focused, `${scheme}: keyboard focus on Add to cart`).toBe(true);
      expect(addRing.style, `${scheme}: focus ring on Add to cart`).not.toBe("none");

      // The selected tab rings on keyboard focus.
      await page.keyboard.press("Tab");
      const details = block.getByRole("tab", { name: "Details" });
      await expect(details).toBeFocused();
      const tabRing = await details.evaluate(ring);
      expect(tabRing.focused, `${scheme}: keyboard focus on a tab`).toBe(true);
      expect(tabRing.style, `${scheme}: focus ring on a tab`).not.toBe("none");
    });

    test("pages through the photos and opens a tab", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      const indicators = block.locator('[data-scope="carousel"][data-part="indicator"]');
      const prev = block.getByRole("button", { name: "Previous slide" });
      const next = block.getByRole("button", { name: "Next slide" });

      await expect(indicators.nth(0)).toHaveAttribute("data-current", "");
      await expect(prev).toBeDisabled();
      await next.click();
      await expect(indicators.nth(1)).toHaveAttribute("data-current", "");
      await expect(block.getByRole("img", { name: ALTS[1]! })).toBeInViewport();
      await indicators.nth(3).click();
      await expect(indicators.nth(3)).toHaveAttribute("data-current", "");
      await expect(next).toBeDisabled();

      await block.getByRole("tab", { name: "Care" }).click();
      await expect(block.getByRole("tabpanel")).toHaveText(CARE);
    });

    test("reports the chosen options and quantity, then shows Adding", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      const added = page.locator('[data-demo-state="default"] [data-demo-added]');
      const add = block.getByRole("button", { name: "Add to cart" });

      // The defaults: the first value left of each option, and one.
      await add.click();
      await expect(block.getByRole("button", { name: "Adding" })).toHaveAttribute(
        "aria-busy",
        "true",
      );
      await expect(block.getByRole("button", { name: "Adding" })).toBeDisabled();
      await expect(added).toHaveText("Added: 1 × sage, 250");
      await expect(add).toBeEnabled();

      // A sold-out value cannot be picked.
      await expect(block.getByRole("radio", { name: /Charcoal/ })).toBeDisabled();

      // Another colour and size, and three of them.
      await block.getByText("Oat", { exact: true }).click();
      await block.getByText("350 ml", { exact: true }).click();
      await expect(block.getByRole("radio", { name: "Oat" })).toBeChecked();
      const quantity = block.getByRole("spinbutton", { name: "Quantity" });
      await block.getByRole("button", { name: /increment/i }).click();
      await quantity.fill("3");
      await add.click();
      await expect(added).toHaveText("Added: 3 × oat, 350");

      // Nothing outside 1..99, and no fraction: the box moves back into range
      // on blur, and that is what is reported.
      await quantity.fill("0");
      await quantity.blur();
      await expect(quantity).toHaveValue("1");
      await add.click();
      await expect(added).toHaveText("Added: 1 × oat, 350");
      await quantity.fill("150");
      await quantity.blur();
      await expect(quantity).toHaveValue("99");
      await add.click();
      await expect(added).toHaveText("Added: 99 × oat, 350");
      await quantity.selectText();
      await quantity.pressSequentially("1.5");
      await expect(quantity).toHaveValue("15");
      await add.click();
      await expect(added).toHaveText("Added: 15 × oat, 350");
    });

    test("keeps the disabled options and button out of reach, and the gallery working", async ({
      page,
    }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "disabled");
      const block = page.locator(`[data-demo-state="disabled"] ${BLOCK}`);
      for (const name of ["Sage", "Oat", "250 ml"]) {
        await expect(block.getByRole("radio", { name })).toBeDisabled();
      }
      await expect(block.getByRole("spinbutton", { name: "Quantity" })).toBeDisabled();
      const add = block.getByRole("button", { name: "Add to cart" });
      await expect(add).toBeDisabled();
      await add.evaluate((el) => (el as HTMLElement).focus());
      await expect(add).not.toBeFocused();

      // Reading stays open: the gallery pages and the tabs switch.
      await block.getByRole("button", { name: "Next slide" }).click();
      await expect(
        block.locator('[data-scope="carousel"][data-part="indicator"]').nth(1),
      ).toHaveAttribute("data-current", "");
      await block.getByRole("tab", { name: "Care" }).click();
      await expect(block.getByRole("tabpanel")).toHaveText(CARE);
    });

    test("announces the loading placeholders once and the failed load as an alert", async ({
      page,
    }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const region = page.locator(`[data-demo-state="loading"] ${BLOCK} [role="status"]`);
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region).toContainText("Loading the product");
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

    test("puts the product in the page outline", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      await expect(block.getByRole("heading", { level: 2 })).toHaveText(NAME);
      await expect(block.getByRole("region", { name: `Photos of ${NAME}` })).toBeVisible();
      await expect(block.getByRole("radiogroup", { name: "Colour" })).toBeVisible();
      await expect(block.getByRole("radiogroup", { name: "Size" })).toBeVisible();
      await expect(block.getByRole("tablist", { name: `About ${NAME}` })).toBeVisible();
    });

    test("treats an empty error string as no error", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "error");
      const block = page.locator(`[data-demo-state="error"] ${BLOCK}`);

      // The demo's retry clears its message to "", the way a consumer holding
      // the error as a string does once the load succeeds.
      await block.getByRole("button", { name: "Try again" }).click();

      await expect(block.locator('[data-scope="alert"]')).toHaveCount(0);
      await expect(block.getByRole("heading", { level: 2 })).toHaveText(NAME);
      await expect(block.getByRole("button", { name: "Add to cart" })).toBeEnabled();
    });
  });
}

/**
 * The Carousel page tints its demo slides (styles/previews/carousel.css). That
 * rule is scoped to the page's own demos — a carousel on the stage, or in a
 * stack on it — so the block's photos keep their own square frames, and the
 * Carousel page keeps its tinted slides.
 */
test("keeps the Carousel page's tinted demo slides to that page", async ({ page }) => {
  await page.goto("/en/carousel/", { waitUntil: "networkidle" });
  const slides = await page.evaluate(() =>
    [
      ...document.querySelectorAll(
        '.preview-panel--demo [data-scope="carousel"][data-part="root"]',
      ),
    ].map((root) => {
      const item = root.querySelector('[data-scope="carousel"][data-part="item"]')!;
      const probe = document.createElement("div");
      probe.style.backgroundColor = "var(--muted)";
      root.append(probe);
      const muted = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return {
        stacked: root.parentElement!.classList.contains("demo-stack"),
        height: item.getBoundingClientRect().height,
        tinted: getComputedStyle(item).backgroundColor === muted,
      };
    }),
  );
  expect(slides.length).toBeGreaterThan(0);
  expect(slides.some((slide) => slide.stacked)).toBe(true);
  for (const slide of slides) {
    expect(slide.tinted).toBe(true);
    expect(slide.height).toBe(slide.stacked ? 96 : 160);
  }
});
