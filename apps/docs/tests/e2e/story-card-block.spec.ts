/**
 * The story-card block, checked on the built docs page at the three widths of
 * the responsive policy (375 / 768 / 1280) in both colour schemes. It asserts
 * text and computed styles; no screenshot baseline is committed.
 *
 * Four claims:
 *
 * 1. **Container, not viewport.** The card is always 9:16. It fills its
 *    container up to `--container-md` and never grows past it. From
 *    `--container-sm` the title and the detail step up a size and the card
 *    gets more padding; from `--container-md` the kicker steps up and the card
 *    gets more room inside; from `--container-lg` the block gets room above
 *    and below the card. Each copy on the page is measured against its own
 *    container width, so the narrow frame keeps the compact card at 1280 while
 *    the wide frame has crossed every step.
 * 2. **Every state renders what it claims**, at every width: the brand's
 *    square Avatar, name and Sponsored badge, the image between the brand and
 *    the text, the kicker, the serif title, the detail and a full-width
 *    action by default; the text at the bottom of a plain card with no image;
 *    the empty message in a 9:16 dashed box; one 9:16 placeholder card in a
 *    busy region while loading; an error Alert with a retry; and a disabled
 *    action when disabled. Every copy is centred in its box.
 * 3. **AA contrast** in both schemes on every text the block paints.
 * 4. **Hover and focus-visible** on the action, and no focus on the disabled
 *    one.
 *
 * It also checks that an empty `error` string counts as no error: the story
 * comes back, with no alert.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/story-card/";

const BLOCK = "article.moderno-block-story-card";

/** The copy the block ships with, and the image the demo passes. */
const BRAND = "Moderno Studio";
const INITIALS = "MS";
const BADGE = "Sponsored";
const KICKER = "New collection";
const TITLE = "Design that feels modern.";
const DETAIL = "Hand-glazed stoneware for slow mornings. In stores Friday.";
const ACTION = "Shop now";
const ALT = "Three stoneware bowls stacked in front of a terracotta arch";
const EMPTY = "This story has nothing to show yet.";
const ERROR = "We could not load this story.";

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** Whether the block drew a Card with the story in it. */
  card: boolean;
  /** The frame's width and its height over its width (the card, the empty box or the placeholder). */
  frameWidth: number;
  frameRatio: number;
  /** The card's inline padding, in px. */
  cardPadding: number;
  /** The space above and below the frame inside the block, in px. */
  roomAbove: number;
  roomBelow: number;
  /** Whether every part stays inside the card (nothing cut off at its edge). */
  contentFits: boolean;
  /** The brand's name, its Avatar's initials and shape, the badge's text and variant. */
  brand: string | null;
  initials: string | null;
  avatarShape: string | null;
  badge: string | null;
  badgeVariant: string | null;
  /** The image's alt text, and whether it loaded; null when there is no image. */
  imageAlt: string | null;
  imageLoaded: boolean;
  /** Whether the image covers its whole area, and whether that area paints --muted. */
  imageFills: boolean;
  mediaMuted: boolean;
  /** Whether the image sits between the brand row and the text. */
  imageBetween: boolean;
  /** Whether the text sits in the card's lower half. */
  textLow: boolean;
  /** The kicker, title and detail, with their font sizes in px. */
  kicker: string | null;
  kickerSize: number | null;
  title: string | null;
  titleSize: number | null;
  /** Whether the title is set in the theme's display face (--font-serif). */
  titleSerif: boolean;
  detail: string | null;
  detailSize: number | null;
  /** The button names (aria-label, else text), variants and disabled flags, in order. */
  buttons: string[];
  buttonVariants: string[];
  buttonsDisabled: boolean[];
  /** The action's width over the card's content box. */
  actionShare: number;
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
 * The page's previews (islands/StoryCardBlockDemo.svelte): the main preview
 * mounts the default on a 24rem stage; the Examples frame the same block at
 * 18rem, 30rem, 40rem and 50rem, then mount the no-image, empty, loading,
 * error and disabled states. Every copy is found by the `data-demo-state` its
 * wrapper carries.
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

/** The copies that show the story, and the demo's image with it. */
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
      probe.style.fontFamily = "var(--font-serif)";
      document.body.append(probe);
      const muted = paint(getComputedStyle(probe).color);
      const serif = getComputedStyle(probe).fontFamily;
      probe.remove();

      return [...wrapper.querySelectorAll<HTMLElement>(selector)].map((article) => {
        const body = article.firstElementChild as HTMLElement | null;
        const first = body?.firstElementChild as HTMLElement | null;
        if (!body || !first) throw new Error("the story-card block did not render its own markup");

        const card = [...body.children].find((el) =>
          el.matches('[data-scope="card"][data-part="root"]'),
        ) as HTMLElement | undefined;
        const busy = body.querySelector<HTMLElement>('[role="status"][aria-busy="true"]');
        const placeholder = busy?.querySelector<HTMLElement>('[data-scope="card"]') ?? null;
        const empty = [...body.children].find(
          (el) => el.tagName === "P" && el.classList.contains("border-dashed"),
        ) as HTMLElement | undefined;
        const frame = card ?? placeholder ?? empty ?? first;

        const avatar = card?.querySelector<HTMLElement>('[data-scope="avatar"][data-part="root"]');
        const brandRow = avatar?.parentElement ?? null;
        const brandName = brandRow?.querySelector("p") ?? null;
        const badge = card?.querySelector<HTMLElement>('[data-scope="badge"][data-part="root"]');
        const image = card?.querySelector("img") ?? null;
        const media = image?.parentElement ?? null;
        const title = card?.querySelector("h3") ?? null;
        const textGroup = title?.parentElement ?? null;
        const kicker = textGroup?.querySelector("p:first-child") ?? null;
        const detail = textGroup?.querySelector("p:last-child") ?? null;
        const buttons = [...article.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];
        const action = buttons.find((b) => text(b).startsWith("Shop now"));

        const frameBox = frame.getBoundingClientRect();
        const bodyStyle = getComputedStyle(body);
        const cardStyle = card ? getComputedStyle(card) : null;
        const cardContent =
          card && cardStyle
            ? card.clientWidth -
              parseFloat(cardStyle.paddingLeft) -
              parseFloat(cardStyle.paddingRight)
            : 0;
        const imageBox = image?.getBoundingClientRect();
        const mediaBox = media?.getBoundingClientRect();
        const textBox = textGroup?.getBoundingClientRect();
        const cardBox = card?.getBoundingClientRect();
        const blockBox = article.getBoundingClientRect();
        const firstBox = first.getBoundingClientRect();
        const size = (el: Element | null) =>
          el ? parseFloat(getComputedStyle(el).fontSize) : null;

        return {
          containerWidth: article.offsetWidth,
          card: Boolean(card && title),
          frameWidth: frameBox.width,
          frameRatio: frameBox.height / frameBox.width,
          cardPadding: cardStyle ? parseFloat(cardStyle.paddingLeft) : 0,
          roomAbove: parseFloat(bodyStyle.paddingTop),
          roomBelow: parseFloat(bodyStyle.paddingBottom),
          contentFits: card ? card.scrollHeight <= card.clientHeight : true,
          brand: brandName ? text(brandName) : null,
          initials: avatar ? text(avatar.querySelector('[data-part="fallback"]')) : null,
          avatarShape: avatar?.getAttribute("data-shape") ?? null,
          badge: badge ? text(badge) : null,
          badgeVariant: badge?.getAttribute("data-variant") ?? null,
          imageAlt: image ? image.getAttribute("alt") : null,
          imageLoaded: image ? image.complete && image.naturalWidth > 0 : false,
          imageFills:
            imageBox && mediaBox
              ? Math.abs(imageBox.width - mediaBox.width) < 1 &&
                Math.abs(imageBox.height - mediaBox.height) < 1 &&
                getComputedStyle(image!).objectFit === "cover"
              : false,
          mediaMuted: media ? paint(getComputedStyle(media).backgroundColor) === muted : false,
          imageBetween:
            mediaBox && textBox && brandRow
              ? Math.round(mediaBox.top) >= Math.round(brandRow.getBoundingClientRect().bottom) &&
                Math.round(mediaBox.bottom) <= Math.round(textBox.top)
              : false,
          textLow: textBox && cardBox ? textBox.top > cardBox.top + cardBox.height / 2 : false,
          kicker: kicker && kicker !== detail ? text(kicker) : null,
          kickerSize: kicker && kicker !== detail ? size(kicker) : null,
          title: title ? text(title) : null,
          titleSize: size(title),
          titleSerif: title ? getComputedStyle(title).fontFamily === serif : false,
          detail: detail && detail !== kicker ? text(detail) : null,
          detailSize: detail && detail !== kicker ? size(detail) : null,
          buttons: buttons.map((b) => b.getAttribute("aria-label") ?? text(b)),
          buttonVariants: buttons.map((b) => b.getAttribute("data-variant") ?? ""),
          buttonsDisabled: buttons.map((b) => b.disabled),
          actionShare:
            action && cardContent > 0 ? action.getBoundingClientRect().width / cardContent : 0,
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
      const title = block.querySelector("h3");
      const textGroup = title?.parentElement;
      const avatar = block.querySelector('[data-scope="avatar"][data-part="root"]');
      const parts: Array<[string, Element | null | undefined]> = [
        ["brand", avatar?.parentElement?.querySelector("p")],
        ["initials", avatar?.querySelector('[data-part="fallback"]')],
        ["badge", block.querySelector('[data-scope="badge"][data-part="root"]')],
        ["kicker", textGroup?.querySelector("p:first-child")],
        ["title", title],
        ["detail", textGroup?.querySelector("p:last-child")],
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
        const label = button.textContent?.trim() ?? "button";
        ratios[`${state} ${label} button`] = against(button);
      }
      return ratios;
    },
    { state, selector: BLOCK },
  );
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`story-card — ${scheme}`, () => {
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

          // Room above and below the card only from `@lg`, the same on both sides.
          expect(block.roomAbove, `${where}: room above and below`).toBe(block.roomBelow);
          if (w >= CONTAINER_LG) {
            expect(block.roomAbove, `${where}: room from @lg`).toBeGreaterThan(0);
          } else {
            expect(block.roomAbove, `${where}: no room below @lg`).toBe(0);
          }

          if (state !== "error") {
            // The story's frame keeps 9:16 in every state, and fills its
            // container up to --container-md.
            expect(block.frameRatio, `${where}: 9:16`).toBeCloseTo(16 / 9, 2);
            expect(block.frameWidth, `${where}: frame width`).toBeCloseTo(
              Math.min(w, CONTAINER_MD),
              0,
            );
          }

          if (state === "loading") {
            expect(block.placeholders, `${where}: one placeholder card`).toBe(1);
            expect(block.card, `${where}: no story while loading`).toBe(false);
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
            expect(block.card, `${where}: a Card with the story`).toBe(true);
            expect(block.contentFits, `${where}: nothing cut off`).toBe(true);
            expect(block.brand, `${where}: brand`).toBe(BRAND);
            expect(block.initials, `${where}: brand initials`).toBe(INITIALS);
            expect(block.avatarShape, `${where}: square logo`).toBe("square");
            expect(block.badge, `${where}: badge`).toBe(BADGE);
            expect(block.badgeVariant, `${where}: badge variant`).toBe("outline");
            expect(block.kicker, `${where}: kicker`).toBe(KICKER);
            expect(block.title, `${where}: title`).toBe(TITLE);
            expect(block.titleSerif, `${where}: title in the display face`).toBe(true);
            expect(block.detail, `${where}: detail`).toBe(DETAIL);
            expect(block.buttons, `${where}: the action, named for the story`).toEqual([
              `${ACTION}: ${TITLE}`,
            ]);
            expect(block.buttonVariants, `${where}: action variant`).toEqual(["primary"]);
            expect(block.buttonsDisabled, `${where}: action enabled`).toEqual([
              state === "disabled",
            ]);
            expect(block.actionShare, `${where}: full-width action`).toBeCloseTo(1, 2);
            expect(block.textLow, `${where}: text in the card's lower half`).toBe(true);
            expect(block.empty, `${where}: no empty message`).toBeNull();

            if (WITH_IMAGE.includes(state)) {
              expect(block.imageAlt, `${where}: image alt`).toBe(ALT);
              expect(block.imageLoaded, `${where}: image loaded`).toBe(true);
              expect(block.imageFills, `${where}: image covers its area`).toBe(true);
              expect(block.mediaMuted, `${where}: muted image area`).toBe(true);
              expect(block.imageBetween, `${where}: image between brand and text`).toBe(true);
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

        const shown = blocks.filter((b) => b.card);
        const sizesOf = (from: number, to: number, pick: (b: BlockMetrics) => number | null) =>
          new Set(
            shown
              .filter((b) => b.containerWidth >= from && b.containerWidth < to)
              .map((b) => pick(b)),
          );
        const stepsUp = (what: string, step: number, pick: (b: BlockMetrics) => number | null) => {
          const below = sizesOf(0, step, pick);
          const above = sizesOf(step, Infinity, pick);
          expect(below.size, `one ${what} below ${step}px`).toBe(1);
          expect(above.size, `one ${what} from ${step}px`).toBe(1);
          expect([...above][0]!, `the ${what} steps up at ${step}px`).toBeGreaterThan(
            [...below][0]!,
          );
        };

        // The title and the detail step up at `@sm`; the kicker at `@md`.
        stepsUp("title size", CONTAINER_SM, (b) => b.titleSize);
        stepsUp("detail size", CONTAINER_SM, (b) => b.detailSize);
        stepsUp("kicker size", CONTAINER_MD, (b) => b.kickerSize);

        // The card's padding grows at `@sm` and again at `@md`: one padding per
        // band, larger in each wider band. A narrow viewport caps the 30rem
        // frame below `@sm`, so a band with no copy in it is skipped there.
        const paddings = [
          [0, CONTAINER_SM],
          [CONTAINER_SM, CONTAINER_MD],
          [CONTAINER_MD, Infinity],
        ]
          .map(([from, to]) => sizesOf(from!, to!, (b) => b.cardPadding))
          .filter((band) => band.size > 0);
        expect(paddings.length, "copies in at least two padding bands").toBeGreaterThanOrEqual(2);
        for (const [i, band] of paddings.entries()) {
          expect(band.size, "one padding per band").toBe(1);
          if (i > 0) {
            expect([...band][0]!, "more padding in a wider band").toBeGreaterThan(
              [...paddings[i - 1]!][0]!,
            );
          }
        }

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
        ...(await contrastRatios(page, "empty")),
        ...(await contrastRatios(page, "error")),
      };
      for (const label of [
        "default brand",
        "default initials",
        "default badge",
        "default kicker",
        "default title",
        "default detail",
        `default ${ACTION} button`,
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

    test("shows hover and focus-visible on the action", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      const action = block.getByRole("button", { name: `${ACTION}: ${TITLE}` });
      await expect(action).toHaveCount(1);

      // Keyboard focus draws a ring.
      await action.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      await expect(action).toBeFocused();
      const ring = await action.evaluate((el) => ({
        focused: el.matches(":focus-visible"),
        style: getComputedStyle(el).outlineStyle,
      }));
      expect(ring.focused, `${scheme}: keyboard focus`).toBe(true);
      expect(ring.style, `${scheme}: focus ring`).not.toBe("none");

      // The button's own hover (Button primary) darkens its fill.
      const filter = () => action.evaluate((el) => getComputedStyle(el).filter);
      await page.mouse.move(0, 0);
      await action.blur();
      expect(await filter(), `${scheme}: resting`).toBe("none");
      await action.hover();
      await expect.poll(filter, { message: `${scheme}: hover` }).not.toBe("none");
    });

    test("keeps the disabled action out of reach", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "disabled");
      const block = page.locator(`[data-demo-state="disabled"] ${BLOCK}`);
      const action = block.getByRole("button", { name: `${ACTION}: ${TITLE}` });
      await expect(action).toBeDisabled();
      await action.evaluate((el) => (el as HTMLElement).focus());
      await expect(action).not.toBeFocused();
      await expect(block.getByRole("heading", { level: 3 })).toHaveText(TITLE);
    });

    test("announces the loading card once and the failed load as an alert", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const region = page.locator(`[data-demo-state="loading"] ${BLOCK} [role="status"]`);
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region).toContainText("Loading the story");
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

    test("puts the story's title in the page outline and its image in the tree", async ({
      page,
    }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      await expect(block.getByRole("heading", { level: 3 })).toHaveText(TITLE);
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
      await expect(block.getByRole("heading", { level: 3 })).toHaveText(TITLE);
      await expect(block.getByRole("button", { name: `${ACTION}: ${TITLE}` })).toBeEnabled();
    });
  });
}
