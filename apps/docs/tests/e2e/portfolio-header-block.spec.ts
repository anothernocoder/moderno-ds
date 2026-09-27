/**
 * The portfolio header block, checked on the built docs page at the three
 * widths of the responsive policy (375 / 768 / 1280) in both colour schemes. It
 * asserts text and computed styles; no screenshot baseline is committed.
 *
 * Four claims:
 *
 * 1. **Container, not viewport.** Below `--container-md` the avatar sits above
 *    the text; from `--container-sm` the role and the bio step up a size; from
 *    `--container-md` the name steps up a size and the avatar moves beside the
 *    text; from `--container-lg` the header gets more room above, below and
 *    between its parts. Each copy on the page is measured against its own
 *    container width, so the narrow frame keeps the avatar on top at 1280
 *    while the wide frame has crossed every step.
 * 2. **Every state renders what it claims**, at every width: the avatar, the
 *    availability Indicator, the name as an `h1`, the role, the bio and the
 *    links by default; the name alone when every other text is `""` and there
 *    are no links; placeholders in a busy region while loading; an error Alert
 *    with a retry; and inert links when disabled. Every copy is centred in its
 *    box.
 * 3. **AA contrast** in both schemes on every text the block paints.
 * 4. **Hover and focus-visible** on the links, and none on a disabled one.
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

const PAGE = "/en/portfolio-header/";

const BLOCK = "section.moderno-block-portfolio-header";

/** The copy the block ships with. */
const NAME = "Lena Ortiz";
const ROLE = "Product designer in Lisbon";
const BIO =
  "I design calm, useful software for small teams, from the first sketch to the shipped product. Ten years in, I still love the details.";
const INITIALS = "LO";
const AVAILABILITY = "Available for new projects";
const LINKS = ["Email", "LinkedIn", "Dribbble", "CV"];
const ERROR = "We could not load this profile.";

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** The name's text, font size (px) and face. */
  name: string | null;
  nameSize: number | null;
  serifName: boolean | null;
  /** The role's and the bio's text and font size (px). */
  role: string | null;
  roleSize: number | null;
  bio: string | null;
  bioSize: number | null;
  /** The availability Indicator's label and status. */
  availability: string | null;
  availabilityVariant: string | null;
  /** The avatar's initials and size (px). */
  initials: string | null;
  avatarSize: number | null;
  /** Where the avatar sits against the text: above it, beside it, or `none`. */
  avatarPlacement: "above" | "beside" | "none";
  /** The links' labels, the name of the nav holding them, and whether they are live or inert. */
  links: string[];
  nav: string | null;
  linkState: "live" | "inert" | "mixed" | "none";
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
 * The page's previews (islands/PortfolioHeaderBlockDemo.svelte): the main
 * preview mounts the default; the Examples frame the same block at 18rem,
 * 30rem, 40rem and 50rem, then mount the name-only, loading, error and
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

      return [...wrapper.querySelectorAll<HTMLElement>(selector)].map((section) => {
        const body = section.firstElementChild as HTMLElement | null;
        if (!body || !body.firstElementChild) {
          throw new Error("the portfolio header block did not render its own markup");
        }

        const name = section.querySelector("h1");
        const role = section.querySelector("h1 + p");
        const bio = section.querySelector("h1 ~ p.text-muted-foreground");
        const indicator = section.querySelector('header [data-scope="indicator"]');
        const avatar = section.querySelector<HTMLElement>(
          'header [data-scope="avatar"][data-part="root"]',
        );
        const textColumn = name?.parentElement?.parentElement ?? null;
        const nav = section.querySelector("header nav");
        const links = nav ? [...nav.querySelectorAll("a")] : [];
        const busy = section.querySelector('[role="status"][aria-busy="true"]');
        const buttons = [...section.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];

        const avatarPlacement = (() => {
          if (!avatar || !textColumn) return "none" as const;
          const a = avatar.getBoundingClientRect();
          const t = textColumn.getBoundingClientRect();
          if (a.bottom <= t.top) return "above" as const;
          if (a.right <= t.left && Math.abs(a.top - t.top) < 1) return "beside" as const;
          return "none" as const;
        })();

        const linkStates = new Set(
          links.map((link) =>
            link.hasAttribute("href") && !link.hasAttribute("aria-disabled")
              ? "live"
              : !link.hasAttribute("href") && link.getAttribute("aria-disabled") === "true"
                ? "inert"
                : "mixed",
          ),
        );

        const blockBox = section.getBoundingClientRect();
        const shown = [...body.children]
          .filter((el) => !el.classList.contains("sr-only"))
          .map((el) => el.getBoundingClientRect());
        const left = Math.min(...shown.map((r) => r.left));
        const right = Math.max(...shown.map((r) => r.right));

        return {
          containerWidth: section.offsetWidth,
          name: name ? text(name) : null,
          nameSize: size(name),
          serifName: name ? normalise(getComputedStyle(name).fontFamily) === serif : null,
          role: role && role !== bio ? text(role) : null,
          roleSize: role && role !== bio ? size(role) : null,
          bio: bio ? text(bio) : null,
          bioSize: size(bio),
          availability: indicator ? text(indicator) : null,
          availabilityVariant: indicator?.getAttribute("data-variant") ?? null,
          initials: avatar ? text(avatar.querySelector('[data-part="fallback"]')) : null,
          avatarSize: avatar ? avatar.offsetWidth : null,
          avatarPlacement,
          links: links.map((link) => text(link)),
          nav: nav?.getAttribute("aria-label") ?? null,
          linkState:
            linkStates.size === 0
              ? "none"
              : linkStates.size === 1
                ? ([...linkStates][0] as "live" | "inert" | "mixed")
                : "mixed",
          paddingTop: parseFloat(getComputedStyle(body).paddingTop),
          gap: textColumn ? parseFloat(getComputedStyle(textColumn).rowGap) : null,
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
      const parts: Array<[string, Element | null | undefined]> = [
        ["name", block.querySelector("h1")],
        ["role", block.querySelector("h1 + p:not(.text-muted-foreground)")],
        ["bio", block.querySelector("h1 ~ p.text-muted-foreground")],
        ["availability", block.querySelector('[data-scope="indicator"] [data-part="label"]')],
        ["initials", block.querySelector('[data-scope="avatar"] [data-part="fallback"]')],
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
      for (const link of block.querySelectorAll("header nav a")) {
        ratios[`${state} ${link.textContent?.trim() ?? "link"} link`] = against(link);
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
  test.describe(`portfolio header — ${scheme}`, () => {
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
            expect(block.placeholders, `${where}: placeholders`).toBe(9);
            expect(block.name, `${where}: no name while loading`).toBeNull();
            expect(block.buttons, `${where}: no buttons while loading`).toEqual([]);
          } else if (state === "error") {
            expect(block.name, `${where}: no name`).toBeNull();
            expect(block.buttons, `${where}: retry only`).toEqual(["Try again"]);
            expect(block.buttonVariants, `${where}: retry variant`).toEqual(["outline"]);
          } else if (state === "empty") {
            expect(block.name, `${where}: name`).toBe(NAME);
            expect(block.role, `${where}: no role`).toBeNull();
            expect(block.bio, `${where}: no bio`).toBeNull();
            expect(block.availability, `${where}: no availability`).toBeNull();
            expect(block.initials, `${where}: no avatar`).toBeNull();
            expect(block.links, `${where}: no links`).toEqual([]);
            expect(block.nav, `${where}: no nav`).toBeNull();
            expect(block.gap, `${where}: gap between parts`).toBe(wide ? 32 : 24);
          } else {
            expect(block.name, `${where}: name`).toBe(NAME);
            expect(block.serifName, `${where}: serif name`).toBe(true);
            expect(block.role, `${where}: role`).toBe(ROLE);
            expect(block.bio, `${where}: bio`).toBe(BIO);
            expect(block.availability, `${where}: availability`).toBe(AVAILABILITY);
            expect(block.availabilityVariant, `${where}: availability status`).toBe("success");
            expect(block.initials, `${where}: avatar initials`).toBe(INITIALS);
            expect(block.avatarSize, `${where}: lg avatar`).toBe(48);
            expect(block.links, `${where}: links`).toEqual(LINKS);
            expect(block.nav, `${where}: named nav`).toBe("Links");
            expect(block.linkState, `${where}: links`).toBe(
              state === "disabled" ? "inert" : "live",
            );
            expect(block.buttons, `${where}: no buttons`).toEqual([]);
            expect(block.gap, `${where}: gap between parts`).toBe(wide ? 32 : 24);
            expect(block.avatarPlacement, `${where}: avatar`).toBe(
              block.containerWidth >= CONTAINER_MD ? "beside" : "above",
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

        const withName = blocks.filter((b) => b.name !== null);

        // The name is one size below `@md` and one larger size from it on.
        const nameBelow = new Set(
          withName.filter((b) => b.containerWidth < CONTAINER_MD).map((b) => b.nameSize),
        );
        const nameAbove = new Set(
          withName.filter((b) => b.containerWidth >= CONTAINER_MD).map((b) => b.nameSize),
        );
        expect(nameBelow.size, "one name size below @md").toBe(1);
        expect(nameAbove.size, "one name size from @md").toBe(1);
        expect([...nameAbove][0]!, "the name steps up at @md").toBeGreaterThan([...nameBelow][0]!);

        // The bio is one size below `@sm` and one larger size from it on.
        const withBio = blocks.filter((b) => b.bio !== null);
        const bioBelow = new Set(
          withBio.filter((b) => b.containerWidth < CONTAINER_SM).map((b) => b.bioSize),
        );
        const bioAbove = new Set(
          withBio.filter((b) => b.containerWidth >= CONTAINER_SM).map((b) => b.bioSize),
        );
        expect(bioBelow.size, "one bio size below @sm").toBe(1);
        expect(bioAbove.size, "one bio size from @sm").toBe(1);
        expect([...bioAbove][0]!, "the bio steps up at @sm").toBeGreaterThan([...bioBelow][0]!);

        // The role steps up with the bio and matches its size at every step, so
        // it never reads smaller than the text under it.
        for (const b of withBio) {
          expect(b.roleSize, `${b.state}: role size`).toBe(b.bioSize);
        }

        // Each step is exercised on both sides at every viewport, so a step that
        // silently stopped firing cannot pass this file.
        const containerWidths = withBio.map((b) => b.containerWidth);
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

    test("fits the name-only header to its name", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "empty");
      // The header is as wide as what it holds, so the name alone sits in the
      // middle of the block rather than at the start of a wide empty box.
      const widths = await page.evaluate((selector) => {
        const block = document.querySelector(`[data-demo-state="empty"] ${selector}`)!;
        return {
          header: block.querySelector("header")!.getBoundingClientRect().width,
          name: block.querySelector("h1")!.getBoundingClientRect().width,
        };
      }, BLOCK);
      expect(Math.abs(widths.header - widths.name), `${scheme}: header hugs the name`).toBeLessThan(
        1,
      );
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
        "default name",
        "default role",
        "default bio",
        "default availability",
        "default initials",
        ...LINKS.map((link) => `default ${link} link`),
        ...LINKS.map((link) => `disabled ${link} link`),
        "empty name",
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

    test("shows hover and focus-visible on a link", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const link = page
        .locator(`[data-demo-state="default"] ${BLOCK}`)
        .getByRole("navigation", { name: "Links" })
        .getByRole("link", { name: "LinkedIn" });
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAttribute("href", "#");

      // The link underlines on hover.
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

    test("keeps disabled links out of reach", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "disabled");
      const links = page
        .locator(`[data-demo-state="disabled"] ${BLOCK}`)
        .getByRole("navigation", { name: "Links" })
        .getByRole("link");
      await expect(links).toHaveCount(LINKS.length);

      for (const label of LINKS) {
        const link = links.filter({ hasText: label });
        await expect(link).toHaveAttribute("aria-disabled", "true");
        await expect(link).not.toHaveAttribute("href");

        // A link with no href takes no focus, so the keyboard skips it.
        await link.evaluate((el) => (el as HTMLElement).focus());
        await expect(link).not.toBeFocused();
      }

      // No underline on hover, and the not-allowed cursor of an inert control.
      const link = links.first();
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
      await expect(region).toContainText("Loading the profile");
      const hidden = await region.evaluate((el) =>
        [...el.querySelectorAll('[data-scope="skeleton"]')].every(
          (placeholder) => placeholder.closest('[aria-hidden="true"]') !== null,
        ),
      );
      expect(hidden).toBe(true);

      // The avatar's placeholder stays a 48px circle, the size of the avatar
      // it stands in for, even when the text beside it is taller.
      const circles = await region.evaluate((el) =>
        [...el.querySelectorAll<HTMLElement>('[data-scope="skeleton"][data-shape="circle"]')].map(
          (circle) => [circle.offsetWidth, circle.offsetHeight],
        ),
      );
      expect(circles).toEqual([[48, 48]]);

      await showState(page, "error");
      const alert = page.locator(`[data-demo-state="error"] ${BLOCK} [role="alert"]`);
      await expect(alert).toContainText(ERROR);
      await expect(alert.getByRole("button", { name: "Try again" })).toBeVisible();
    });

    test("puts the name in the page outline as an h1", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      await expect(block.getByRole("heading", { level: 1 })).toHaveText(NAME);
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
      await expect(block.getByRole("heading", { level: 1 })).toHaveText(NAME);
      await expect(block.getByRole("navigation", { name: "Links" }).getByRole("link")).toHaveCount(
        LINKS.length,
      );
    });
  });
}
