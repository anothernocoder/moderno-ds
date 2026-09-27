/**
 * The careers block, checked on the built docs page at the three widths of the
 * responsive policy (375 / 768 / 1280) in both colour schemes. It asserts text
 * and computed styles; no screenshot baseline is committed.
 *
 * Four claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` each apply link sits
 *    under its role; from `--container-sm` beside it; at `--container-md` the
 *    heading steps up a size; at `--container-lg` the section gets more room
 *    above and below. Each copy on the page is measured against its own
 *    container width, so the narrow frame keeps its links under their roles at
 *    1280 while the wide frame has crossed every step.
 * 2. **Every state renders what it claims**, at every width: heading,
 *    introduction and five roles, each with its department badge, its place and
 *    an apply link named for it, by default; the empty message in place of the
 *    list; placeholders in a busy region while loading; an error Alert with a
 *    retry in place of the list; and inert apply links when disabled. Every
 *    copy is centred in its box.
 * 3. **AA contrast** in both schemes on every text the block paints, and 3:1 on
 *    the arrow against its surface.
 * 4. **Hover and focus-visible** on an apply link, and none on a disabled one.
 *
 * It also checks that an empty `error` string counts as no error: the roles
 * come back, with no alert.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/careers/";

const BLOCK = "section.moderno-block-careers";

/** The copy the block ships with. */
const HEADING = "Come build with us";
const ROLES = [
  "Senior Product Designer",
  "Staff Frontend Engineer",
  "Backend Engineer, Payments",
  "Customer Success Lead",
  "Content Marketer",
];
const DEPARTMENTS = ["Design", "Engineering", "Engineering", "Support", "Marketing"];
const PLACES = [
  "Remote, Europe · Full-time",
  "Remote · Full-time",
  "Stockholm · Full-time",
  "Remote, Americas · Full-time",
  "Remote · Part-time",
];
const LINK_NAMES = ROLES.map((role) => `Apply for ${role}`);
const EMPTY = "No open roles right now. Check back soon.";
const ERROR = "We could not load the open roles.";

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** The heading's text. */
  heading: string | null;
  /** The heading's font size, in px. */
  headingSize: number | null;
  /** Whether the heading is set in the contract's `--font-serif`. */
  serifHeading: boolean | null;
  /** The role titles, in order. */
  roles: string[];
  /** Each role's department badge text and `data-variant`, in order. */
  departments: string[];
  departmentVariants: string[];
  /** Each role's place and type line, in order. */
  places: string[];
  /** Each apply link's visible text and accessible name, in order. */
  linkTexts: string[];
  linkNames: string[];
  /** Apply links that carry an aria-hidden arrow. */
  arrows: number;
  /** Columns of each role row: 1 when the link sits under the role, 2 beside it. */
  rowColumns: number[];
  /** Whether every apply link is inert: no href and `aria-disabled`. */
  allLinksInert: boolean;
  /** Whether every apply link is live: an href and no `aria-disabled`. */
  allLinksLive: boolean;
  /** The empty message, or null. */
  empty: string | null;
  /** The block's padding above its content, in px. */
  paddingTop: number;
  /** The button labels, in order (the retry inside an error). */
  buttons: string[];
  /** The `data-variant` of every button, in order. */
  buttonVariants: string[];
  /** Whether every button in this copy is disabled. */
  allButtonsDisabled: boolean;
  /** Skeleton placeholders inside a busy status region. */
  placeholders: number;
  /** Whether an error Alert is announced. */
  alert: boolean;
  /** Horizontal offset between the heading block's centre and the block's, in px. */
  offCentre: number;
}

/**
 * The page's previews (islands/CareersBlockDemo.svelte): the main preview
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

      return [...wrapper.querySelectorAll<HTMLElement>(selector)].map((section) => {
        const body = section.firstElementChild as HTMLElement | null;
        const first = body?.firstElementChild as HTMLElement | null;
        if (!body || !first) throw new Error("the careers block did not render its own markup");

        const heading = section.querySelector("h2");
        const items = [...section.querySelectorAll<HTMLElement>("ul > li")];
        const badges = items.map((li) => li.querySelector('[data-scope="badge"]'));
        const links = items.map((li) => li.querySelector<HTMLAnchorElement>("a"));
        const busy = section.querySelector('[role="status"][aria-busy="true"]');
        const buttons = [...section.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];
        const empty = [...body.children].find(
          (el) => el.tagName === "P" && el.classList.contains("border-dashed"),
        );
        const blockBox = section.getBoundingClientRect();
        const firstBox = first.getBoundingClientRect();

        return {
          containerWidth: section.offsetWidth,
          heading: heading ? text(heading) : null,
          headingSize: heading ? parseFloat(getComputedStyle(heading).fontSize) : null,
          serifHeading: heading ? normalise(getComputedStyle(heading).fontFamily) === serif : null,
          roles: items.map((li) => text(li.querySelector("h3"))),
          departments: badges.map((badge) => text(badge)),
          departmentVariants: badges.map((badge) => badge?.getAttribute("data-variant") ?? ""),
          places: items.map((li) => text(li.querySelector('[data-scope="badge"] + span'))),
          linkTexts: links.map((a) => text(a)),
          linkNames: links.map((a) => a?.getAttribute("aria-label") ?? ""),
          arrows: links.filter((a) => a?.querySelector('svg[aria-hidden="true"] path')).length,
          rowColumns: items.map(
            (li) => getComputedStyle(li).gridTemplateColumns.split(" ").filter(Boolean).length,
          ),
          allLinksInert:
            links.length > 0 &&
            links.every(
              (a) =>
                a !== null && !a.hasAttribute("href") && a.getAttribute("aria-disabled") === "true",
            ),
          allLinksLive:
            links.length > 0 &&
            links.every(
              (a) => a !== null && a.hasAttribute("href") && !a.hasAttribute("aria-disabled"),
            ),
          empty: empty ? text(empty) : null,
          paddingTop: parseFloat(getComputedStyle(body).paddingTop),
          buttons: buttons.map((b) => text(b)),
          buttonVariants: buttons.map((b) => b.getAttribute("data-variant") ?? ""),
          allButtonsDisabled: buttons.length > 0 && buttons.every((b) => b.disabled),
          placeholders: busy ? busy.querySelectorAll('[data-scope="skeleton"]').length : 0,
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
      const parts: Array<[string, Element | null]> = [
        ["heading", block.querySelector("h2")],
        ["description", block.querySelector("h2 + p")],
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
      for (const item of block.querySelectorAll("ul > li")) {
        const title = item.querySelector("h3")!;
        const name = title.textContent?.trim() ?? "role";
        ratios[`${state} ${name} title`] = against(title);
        ratios[`${state} ${name} department`] = against(
          item.querySelector('[data-scope="badge"]')!,
        );
        ratios[`${state} ${name} place`] = against(
          item.querySelector('[data-scope="badge"] + span')!,
        );
        const link = item.querySelector("a")!;
        ratios[`${state} ${name} apply link`] = against(link);
        // Non-text contrast (WCAG 1.4.11): the arrow's stroke against its surface.
        ratios[`${state} ${name} arrow`] = against(link.querySelector("svg")!);
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
  test.describe(`careers — ${scheme}`, () => {
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

          const columns = block.containerWidth >= CONTAINER_SM ? 2 : 1;
          for (const rowColumns of block.rowColumns) {
            expect(rowColumns, `${where}: apply link beside its role`).toBe(columns);
          }
          expect(block.paddingTop, `${where}: room above`).toBe(
            block.containerWidth >= CONTAINER_LG ? 64 : 48,
          );
          expect(block.offCentre, `${where}: centred`).toBeLessThan(1);
          expect(block.alert, `${where}: error announced`).toBe(state === "error");
          expect(block.heading, `${where}: heading`).toBe(HEADING);
          expect(block.serifHeading, `${where}: serif heading`).toBe(true);

          if (state === "loading") {
            expect(block.placeholders, `${where}: placeholders`).toBe(6);
            expect(block.roles, `${where}: no roles while loading`).toEqual([]);
            expect(block.buttons, `${where}: no buttons while loading`).toEqual([]);
          } else if (state === "empty") {
            expect(block.empty, `${where}: empty message`).toBe(EMPTY);
            expect(block.roles, `${where}: no roles`).toEqual([]);
            expect(block.buttons, `${where}: no buttons`).toEqual([]);
          } else if (state === "error") {
            expect(block.roles, `${where}: no roles`).toEqual([]);
            expect(block.buttons, `${where}: retry only`).toEqual(["Try again"]);
            expect(block.buttonVariants, `${where}: retry variant`).toEqual(["outline"]);
          } else {
            expect(block.roles, `${where}: roles`).toEqual(ROLES);
            expect(block.departments, `${where}: departments`).toEqual(DEPARTMENTS);
            expect(block.departmentVariants, `${where}: outline badges`).toEqual(
              DEPARTMENTS.map(() => "outline"),
            );
            expect(block.places, `${where}: places`).toEqual(PLACES);
            expect(block.linkTexts, `${where}: link text`).toEqual(ROLES.map(() => "Apply"));
            expect(block.linkNames, `${where}: link names`).toEqual(LINK_NAMES);
            expect(block.arrows, `${where}: one hidden arrow per link`).toBe(ROLES.length);
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
          "every other render with roles",
        ).toEqual(["default", "narrow", "compact", "panel", "wide"]);

        // The heading steps up at `--container-md`: one size below it, one
        // larger size from it on.
        const below = new Set(
          blocks.filter((b) => b.containerWidth < CONTAINER_MD).map((b) => b.headingSize),
        );
        const above = new Set(
          blocks.filter((b) => b.containerWidth >= CONTAINER_MD).map((b) => b.headingSize),
        );
        expect(below.size, "one heading size below @md").toBe(1);
        expect(above.size, "one heading size from @md").toBe(1);
        expect([...above][0]!, "heading steps up at @md").toBeGreaterThan([...below][0]!);

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
      };
      for (const label of [
        "default heading",
        "default description",
        ...ROLES.flatMap((role) => [
          `default ${role} title`,
          `default ${role} department`,
          `default ${role} place`,
          `default ${role} apply link`,
          `default ${role} arrow`,
        ]),
        "empty empty message",
        "error alert title",
        "error alert description",
        "error Try again button",
      ]) {
        expect(Object.keys(ratios), `${scheme}: ${label} measured`).toContain(label);
      }
      for (const [what, ratio] of Object.entries(ratios)) {
        const floor = what.endsWith(" arrow") ? 3 : 4.5;
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(floor);
      }
    });

    test("shows hover and focus-visible on an apply link", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const link = page
        .locator(`[data-demo-state="default"] ${BLOCK}`)
        .getByRole("link", { name: LINK_NAMES[0] });
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAttribute("href", "#");

      // The apply link underlines on hover.
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

    test("keeps a disabled apply link out of reach", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "disabled");
      const link = page
        .locator(`[data-demo-state="disabled"] ${BLOCK}`)
        .getByRole("link", { name: LINK_NAMES[0] });
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
    });

    test("announces the loading list once and the failed load as an alert", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const region = page.locator(`[data-demo-state="loading"] ${BLOCK} [role="status"]`);
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region).toContainText("Loading open roles");
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
      await expect(block.locator("ul > li h3")).toHaveText(ROLES);
      await expect(block.getByRole("link")).toHaveCount(ROLES.length);
    });
  });
}
