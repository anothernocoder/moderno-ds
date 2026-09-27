/**
 * The product-card block, checked on the built docs page at the three widths
 * of the responsive policy (375 / 768 / 1280) in both colour schemes. It
 * asserts text and computed styles; no screenshot baseline is committed.
 *
 * Four claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` the image sits above
 *    the text and "Add to cart" is as wide as the card; from `--container-sm`
 *    the image sits beside the text (two fifths of the card) and the button
 *    fits its label; from `--container-md` the name steps up a size; from
 *    `--container-lg` the image and the text share the card evenly and the
 *    image is square. The card never grows past `--container-lg`. Each copy on
 *    the page is measured against its own container width, so the narrow frame
 *    keeps the image on top at 1280 while the wide frame has crossed every
 *    step.
 * 2. **Every state renders what it claims**, at every width: the image, the
 *    Sale badge, the linked name, the description, the price with the old one
 *    struck through and "Add to cart" by default; a muted box with no image;
 *    the empty message; one placeholder card in a busy region while loading;
 *    an error Alert with a retry; and an inert link with disabled buttons when
 *    disabled. Every copy is centred in its box.
 * 3. **AA contrast** in both schemes on every text the block paints.
 * 4. **Hover and focus-visible** on the name link and on "Add to cart", and
 *    none on the disabled ones.
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

const PAGE = "/en/product-card/";

const BLOCK = "article.moderno-block-product-card";

/** The product the demo passes, and the copy the block ships with. */
const NAME = "Stoneware mug";
const DESCRIPTION = "Glazed by hand in small batches. Holds 350 ml and goes in the dishwasher.";
const PRICE = "€28";
const OLD_PRICE = "€35";
const BADGE = "Sale";
const ALT = "A dark green stoneware mug with a bare clay foot";
const ADD = "Add to cart";
const EMPTY = "This product is no longer available.";
const ERROR = "We could not load this product.";

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** Whether the block drew a Card with the product in it. */
  card: boolean;
  /** The card's width, in px. */
  cardWidth: number;
  /** Where the image sits against the text: above it, beside it, or neither. */
  mediaPlacement: "above" | "beside" | "none";
  /** The image area's width over the card's. */
  mediaShare: number;
  /** The image area's width and height, in px. */
  mediaWidth: number;
  mediaHeight: number;
  /** Whether the image area paints --muted. */
  mediaMuted: boolean;
  /** The image's alt text, and whether it loaded; null when there is no image. */
  imageAlt: string | null;
  imageLoaded: boolean;
  /** Whether the image covers its whole area. */
  imageFills: boolean;
  /** The badge's text and variant, and whether it sits inside the image area. */
  badge: string | null;
  badgeVariant: string | null;
  badgeOnImage: boolean;
  /** The name (the card's `h3`), its font size in px, and its link's text. */
  name: string | null;
  nameSize: number | null;
  nameLink: string | null;
  /** The description, the price and the old price as read (with "Was"). */
  description: string | null;
  price: string | null;
  oldPrice: string | null;
  /** Whether the old price is struck through. */
  oldPriceStruck: boolean;
  /** The button names (aria-label, else text), variants and disabled flags, in order. */
  buttons: string[];
  buttonVariants: string[];
  buttonsDisabled: boolean[];
  /** "Add to cart"'s width over its footer's content box. */
  addShare: number;
  /** Whether every link in the block is inert: no href and `aria-disabled`. */
  linksInert: boolean;
  /** Whether every link in the block is live: an href and no `aria-disabled`. */
  linksLive: boolean;
  /** The empty message, or null. */
  empty: string | null;
  /** Placeholder cards inside a busy status region. */
  placeholders: number;
  /** Whether an error Alert is announced. */
  alert: boolean;
  /** Horizontal offset between the content's centre and the block's, in px. */
  offCentre: number;
}

/**
 * The page's previews (islands/ProductCardBlockDemo.svelte): the main preview
 * mounts the default; the Examples frame the same block at 18rem, 30rem, 40rem
 * and 50rem, then mount the no-image, empty, loading, error and disabled
 * states. Every copy is found by the `data-demo-state` its wrapper carries.
 */
const STATES = [
  "default",
  "narrow",
  "compact",
  "panel",
  "wide",
  "no-image",
  "empty",
  "loading",
  "error",
  "disabled",
] as const;
type State = (typeof STATES)[number];

/** The copies that show the product, and the demo's image with it. */
const WITH_IMAGE: State[] = ["default", "narrow", "compact", "panel", "wide", "disabled"];

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
      document.body.append(probe);
      const muted = paint(getComputedStyle(probe).color);
      probe.remove();

      return [...wrapper.querySelectorAll<HTMLElement>(selector)].map((article) => {
        const body = article.firstElementChild as HTMLElement | null;
        const first = body?.firstElementChild as HTMLElement | null;
        if (!body || !first)
          throw new Error("the product-card block did not render its own markup");

        const card = [...body.children].find((el) =>
          el.matches('[data-scope="card"][data-part="root"]'),
        ) as HTMLElement | undefined;
        const media = card?.firstElementChild as HTMLElement | null | undefined;
        const header = card?.querySelector<HTMLElement>('[data-part="header"]');
        const footer = card?.querySelector<HTMLElement>('[data-part="footer"]');
        const image = media?.querySelector("img") ?? null;
        const badge = article.querySelector<HTMLElement>('[data-scope="badge"][data-part="root"]');
        const name = card?.querySelector("h3") ?? null;
        const links = [...article.querySelectorAll<HTMLAnchorElement>("a")];
        const old = card?.querySelector("s") ?? null;
        const price = card?.querySelector('[data-part="content"] p > span') ?? null;
        const buttons = [...article.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];
        const add = buttons.find((b) => text(b).startsWith("Add to cart"));
        const busy = article.querySelector('[role="status"][aria-busy="true"]');
        const empty = [...body.children].find(
          (el) => el.tagName === "P" && el.classList.contains("border-dashed"),
        );

        let mediaPlacement: "above" | "beside" | "none" = "none";
        if (media && header) {
          const m = media.getBoundingClientRect();
          const h = header.getBoundingClientRect();
          if (Math.round(m.bottom) <= Math.round(h.top)) mediaPlacement = "above";
          else if (Math.round(m.right) <= Math.round(h.left)) mediaPlacement = "beside";
        }
        const mediaBox = media?.getBoundingClientRect();
        const cardBox = card?.getBoundingClientRect();
        const imageBox = image?.getBoundingClientRect();
        const footerStyle = footer ? getComputedStyle(footer) : null;
        const footerContent = footer
          ? footer.clientWidth -
            parseFloat(footerStyle!.paddingLeft) -
            parseFloat(footerStyle!.paddingRight)
          : 0;
        const blockBox = article.getBoundingClientRect();
        const firstBox = first.getBoundingClientRect();

        return {
          containerWidth: article.offsetWidth,
          card: Boolean(card && name),
          cardWidth: cardBox?.width ?? 0,
          mediaPlacement,
          mediaShare: mediaBox && cardBox ? mediaBox.width / cardBox.width : 0,
          mediaWidth: mediaBox?.width ?? 0,
          mediaHeight: mediaBox?.height ?? 0,
          mediaMuted: media ? paint(getComputedStyle(media).backgroundColor) === muted : false,
          imageAlt: image ? image.getAttribute("alt") : null,
          imageLoaded: image ? image.complete && image.naturalWidth > 0 : false,
          imageFills:
            imageBox && mediaBox
              ? Math.abs(imageBox.width - mediaBox.width) < 1 &&
                Math.abs(imageBox.height - mediaBox.height) < 1 &&
                getComputedStyle(image!).objectFit === "cover"
              : false,
          badge: badge ? text(badge) : null,
          badgeVariant: badge?.getAttribute("data-variant") ?? null,
          badgeOnImage: Boolean(badge && media?.contains(badge)),
          name: name ? text(name) : null,
          nameSize: name ? parseFloat(getComputedStyle(name).fontSize) : null,
          nameLink: name?.querySelector("a") ? text(name.querySelector("a")) : null,
          description: card
            ? text(card.querySelector('[data-scope="card"][data-part="description"]')) || null
            : null,
          price: price ? text(price) : null,
          oldPrice: old ? text(old) : null,
          oldPriceStruck: old
            ? getComputedStyle(old).textDecorationLine.includes("line-through")
            : false,
          buttons: buttons.map((b) => b.getAttribute("aria-label") ?? text(b)),
          buttonVariants: buttons.map((b) => b.getAttribute("data-variant") ?? ""),
          buttonsDisabled: buttons.map((b) => b.disabled),
          addShare:
            add && footerContent > 0 ? add.getBoundingClientRect().width / footerContent : 0,
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
            ? [...busy.querySelectorAll('[aria-hidden="true"]')].filter(
                (el) =>
                  el.matches('[data-scope="card"]') &&
                  el.querySelector('[data-scope="skeleton"]') !== null,
              ).length
            : 0,
          alert: article.querySelector('[data-scope="alert"][role="alert"]') !== null,
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
      const name = block.querySelector("h3");
      const parts: Array<[string, Element | null | undefined]> = [
        ["name", name?.querySelector("a") ?? name],
        ["description", block.querySelector('[data-scope="card"][data-part="description"]')],
        ["price", block.querySelector('[data-part="content"] p > span')],
        ["old price", block.querySelector('[data-part="content"] s')],
        ["badge", block.querySelector('[data-scope="badge"][data-part="root"]')],
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
      for (const button of block.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')) {
        // A disabled control is exempt from AA (WCAG 1.4.3, "inactive").
        if (button.disabled) continue;
        const label = button.textContent?.replace(/:.*$/, "").trim() ?? "button";
        ratios[`${state} ${label} button`] = against(button);
      }
      return ratios;
    },
    { state, selector: BLOCK },
  );
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`product-card — ${scheme}`, () => {
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

          expect(block.offCentre, `${where}: centred`).toBeLessThan(1);
          expect(block.alert, `${where}: error announced`).toBe(state === "error");

          if (state === "loading") {
            expect(block.placeholders, `${where}: one placeholder card`).toBe(1);
            expect(block.card, `${where}: no product while loading`).toBe(false);
            expect(block.buttons, `${where}: no buttons while loading`).toEqual([]);
          } else if (state === "empty") {
            expect(block.empty, `${where}: empty message`).toBe(EMPTY);
            expect(block.card, `${where}: no card`).toBe(false);
            expect(block.buttons, `${where}: no buttons`).toEqual([]);
          } else if (state === "error") {
            expect(block.card, `${where}: no card`).toBe(false);
            expect(block.buttons, `${where}: retry only`).toEqual(["Try again"]);
            expect(block.buttonVariants, `${where}: retry variant`).toEqual(["outline"]);
          } else {
            const w = block.containerWidth;
            expect(block.card, `${where}: a Card with the product`).toBe(true);
            expect(block.cardWidth, `${where}: capped at --container-lg`).toBeLessThanOrEqual(
              CONTAINER_LG,
            );
            expect(block.mediaPlacement, `${where}: image against the text`).toBe(
              w >= CONTAINER_SM ? "beside" : "above",
            );
            if (w >= CONTAINER_LG) {
              expect(block.mediaShare, `${where}: an even split`).toBeCloseTo(0.5, 1);
              expect(
                Math.abs(block.mediaWidth - block.mediaHeight),
                `${where}: square image`,
              ).toBeLessThan(1);
            } else if (w >= CONTAINER_SM) {
              expect(block.mediaShare, `${where}: image two fifths`).toBeCloseTo(0.4, 1);
            } else {
              expect(
                Math.abs(block.mediaWidth - block.mediaHeight),
                `${where}: square image on top`,
              ).toBeLessThan(1);
            }
            if (w >= CONTAINER_SM) {
              expect(block.addShare, `${where}: button fits its label`).toBeLessThan(1);
            } else {
              expect(block.addShare, `${where}: full-width button`).toBeCloseTo(1, 2);
            }

            expect(block.mediaMuted, `${where}: muted image area`).toBe(true);
            expect(block.badge, `${where}: badge`).toBe(BADGE);
            expect(block.badgeVariant, `${where}: badge variant`).toBe("solid");
            expect(block.badgeOnImage, `${where}: badge on the image`).toBe(true);
            expect(block.name, `${where}: name`).toBe(NAME);
            expect(block.nameLink, `${where}: name link`).toBe(NAME);
            expect(block.description, `${where}: description`).toBe(DESCRIPTION);
            expect(block.price, `${where}: price`).toBe(PRICE);
            expect(block.oldPrice, `${where}: old price, read with "Was"`).toBe(`Was ${OLD_PRICE}`);
            expect(block.oldPriceStruck, `${where}: old price struck through`).toBe(true);
            expect(block.buttons, `${where}: add to cart, named for the product`).toEqual([
              `${ADD}: ${NAME}`,
            ]);
            expect(block.buttonVariants, `${where}: add to cart variant`).toEqual(["primary"]);
            expect(block.buttonsDisabled, `${where}: add to cart enabled`).toEqual([
              state === "disabled",
            ]);
            expect(block.empty, `${where}: no empty message`).toBeNull();

            if (WITH_IMAGE.includes(state)) {
              expect(block.imageAlt, `${where}: image alt`).toBe(ALT);
              expect(block.imageLoaded, `${where}: image loaded`).toBe(true);
              expect(block.imageFills, `${where}: image covers its area`).toBe(true);
            } else {
              expect(block.imageAlt, `${where}: no image`).toBeNull();
            }
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
          "every render with a product",
        ).toEqual(["default", "narrow", "compact", "panel", "wide", "no-image"]);

        // The name is one size below `@md` and one larger size from it on.
        const shown = blocks.filter((b) => b.card);
        const below = new Set(
          shown.filter((b) => b.containerWidth < CONTAINER_MD).map((b) => b.nameSize),
        );
        const above = new Set(
          shown.filter((b) => b.containerWidth >= CONTAINER_MD).map((b) => b.nameSize),
        );
        expect(below.size, "one name size below @md").toBe(1);
        expect(above.size, "one name size from @md").toBe(1);
        expect([...above][0]!, "the name steps up at @md").toBeGreaterThan([...below][0]!);

        // Each step is exercised on both sides at every viewport, so a step that
        // silently stopped firing cannot pass this file.
        const containerWidths = shown.map((b) => b.containerWidth);
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
        "no-image",
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
            const content = block.firstElementChild!.firstElementChild!.getBoundingClientRect();
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
        ...(await contrastRatios(page, "disabled")),
        ...(await contrastRatios(page, "empty")),
        ...(await contrastRatios(page, "error")),
      };
      for (const label of [
        "default name",
        "default description",
        "default price",
        "default old price",
        "default badge",
        "default Add to cart button",
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

    test("shows hover and focus-visible on the name link and the button", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      const link = block.getByRole("link", { name: NAME });
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAttribute("href", "#");

      // The name link underlines on hover.
      const decoration = () => link.evaluate((el) => getComputedStyle(el).textDecorationLine);
      await page.mouse.move(0, 0);
      expect(await decoration(), `${scheme}: resting`).toBe("none");
      await link.hover();
      expect(await decoration(), `${scheme}: hover`).toBe("underline");

      // Keyboard focus draws a ring on the link, then on "Add to cart".
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

      const add = block.getByRole("button", { name: `${ADD}: ${NAME}` });
      await page.keyboard.press("Tab");
      await expect(add).toBeFocused();
      const addRing = await add.evaluate(ring);
      expect(addRing.focused, `${scheme}: keyboard focus on the button`).toBe(true);
      expect(addRing.style, `${scheme}: focus ring on the button`).not.toBe("none");

      // The button's own hover (Button primary) darkens its fill.
      const filter = () => add.evaluate((el) => getComputedStyle(el).filter);
      await page.mouse.move(0, 0);
      await add.blur();
      expect(await filter(), `${scheme}: button resting`).toBe("none");
      await add.hover();
      await expect.poll(filter, { message: `${scheme}: button hover` }).not.toBe("none");
    });

    test("keeps the disabled product out of reach", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "disabled");
      const block = page.locator(`[data-demo-state="disabled"] ${BLOCK}`);
      const link = block.getByRole("link", { name: NAME });
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

      const add = block.getByRole("button", { name: `${ADD}: ${NAME}` });
      await expect(add).toBeDisabled();
      await add.evaluate((el) => (el as HTMLElement).focus());
      await expect(add).not.toBeFocused();
    });

    test("announces the loading card once and the failed load as an alert", async ({ page }) => {
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

    test("puts the product's name in the page outline and its image in the tree", async ({
      page,
    }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      await expect(block.getByRole("heading", { level: 3 })).toHaveText(NAME);
      await expect(block.getByRole("img", { name: ALT })).toBeVisible();
    });

    test("treats an empty error string as no error", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "error");
      const block = page.locator(`[data-demo-state="error"] ${BLOCK}`);

      // The demo's retry clears its message to "", the way a consumer holding
      // the error as a string does once the load succeeds.
      await block.getByRole("button", { name: "Try again" }).click();

      await expect(block.locator('[data-scope="alert"]')).toHaveCount(0);
      await expect(block.getByRole("heading", { level: 3 })).toHaveText(NAME);
      await expect(block.getByRole("button", { name: `${ADD}: ${NAME}` })).toBeEnabled();
    });
  });
}
