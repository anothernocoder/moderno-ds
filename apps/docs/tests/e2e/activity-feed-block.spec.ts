/**
 * The activity-feed block, checked on the built docs page at the three widths
 * of the responsive policy (375 / 768 / 1280) in both colour schemes. It
 * asserts text and computed styles; CI adds the screenshots to the PR body.
 *
 * Four claims:
 *
 * 1. **Container, not viewport.** The header lines up and comments stop being
 *    cut at `--container-sm`; each timestamp moves to the trailing edge of its
 *    row at `--container-md`, and into a time column before the avatars at
 *    `--container-lg`. Every copy is measured against its own container width,
 *    so the narrow frame stays stacked at 1280 while the wide frame has crossed
 *    all three steps.
 * 2. **Every state renders what it claims**: the timeline in the default
 *    render, a card when it is empty, skeleton rows in a busy region while it
 *    loads, one alert with a retry when it failed, and a timeline whose every
 *    control is inert when disabled.
 * 3. **AA contrast** on every text it paints, per scheme.
 * 4. **Hover and focus-visible** reach the row actions, and each action's
 *    accessible name carries its visible label and the event it acts on.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/activity-feed/";
const BLOCK = "section.moderno-block-activity-feed";

type TimePlacement = "under" | "trailing" | "leading";

interface BlockMetrics {
  /** Width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** `display` of the header row: `grid` stacked, `flex` once it lines up. */
  headerDisplay: string;
  /** Number of events in the timeline (0 when a stand-in renders instead). */
  rows: number;
  /** Rows showing an avatar. */
  avatars: number;
  /** Rails drawn between avatars: every row but the last. */
  visibleRails: number;
  /** Where the first row's timestamp sits relative to its sentence and avatar. */
  timePlacement: TimePlacement | null;
  /** Whether the first row's comment is cut at two lines. */
  commentClamped: boolean | null;
  /** Whether every control in this copy is disabled. */
  allControlsInert: boolean;
  /** Whether this copy shows skeleton rows in a busy region. */
  busyRegion: boolean;
  /** Whether this copy renders the "No activity yet" card. */
  emptyCard: boolean;
  /** Whether this copy renders the failed-load alert. */
  failedAlert: boolean;
}

/**
 * The page's previews (islands/ActivityFeedBlockDemo.svelte): the main preview
 * mounts the default; the Examples frame the same block at 18rem, 30rem and
 * 50rem, then mount the empty, loading, error and disabled states. Every copy
 * is found by the `data-demo-state` its wrapper carries.
 */
const STATES = [
  "default",
  "narrow",
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
      const panel = document.querySelector(`[data-demo-state="${state}"]`);
      if (!panel) throw new Error(`no preview for the ${state} state on the page`);
      return [...panel.querySelectorAll(selector)].map((section) => {
        const shell = section.firstElementChild;
        const header = shell?.firstElementChild;
        if (!shell || !header) throw new Error("the activity-feed block did not render its markup");

        const rows = [...section.querySelectorAll("ol > li")];
        const buttons = [...section.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];
        const shown = (el: Element) => getComputedStyle(el).display !== "none";

        let timePlacement: TimePlacement | null = null;
        let commentClamped: boolean | null = null;
        const first = rows[0];
        if (first) {
          const avatar = first.querySelector('[data-scope="avatar"][data-part="root"]');
          const sentence = first.querySelector(":scope > p");
          const time = first.querySelector(":scope > time");
          const comment = first.querySelector(":scope > blockquote > p");
          if (!avatar || !sentence || !time || !comment) {
            throw new Error("the first row rendered no avatar, sentence, time or comment");
          }
          const a = avatar.getBoundingClientRect();
          const s = sentence.getBoundingClientRect();
          const t = time.getBoundingClientRect();
          if (t.right <= a.left + 1) timePlacement = "leading";
          else if (t.left >= s.right - 1 && Math.abs(t.top - s.top) < 4) timePlacement = "trailing";
          else if (t.top >= s.bottom - 1) timePlacement = "under";
          commentClamped = getComputedStyle(comment).webkitLineClamp !== "none";
        }

        return {
          containerWidth: section.getBoundingClientRect().width,
          headerDisplay: getComputedStyle(header).display,
          rows: rows.length,
          avatars: rows.filter((row) => row.querySelector('[data-scope="avatar"]')).length,
          visibleRails: rows.filter((row) => {
            const rail = row.querySelector(":scope > div > span[aria-hidden]");
            return rail !== null && shown(rail);
          }).length,
          timePlacement,
          commentClamped,
          allControlsInert: buttons.length > 0 && buttons.every((button) => button.disabled),
          busyRegion:
            section.querySelector('[role="status"][aria-busy="true"] [data-scope="skeleton"]') !==
            null,
          emptyCard:
            section
              .querySelector('[data-scope="card"][data-part="title"]')
              ?.textContent?.includes("No activity yet") === true,
          failedAlert:
            rows.length === 0 &&
            section.querySelector('[data-scope="alert"][data-variant="error"]') !== null,
        };
      });
    },
    { state, selector: BLOCK },
  );
}

/** The time placement each container width should produce. */
function expectedPlacement(width: number): TimePlacement {
  if (width >= CONTAINER_LG) return "leading";
  if (width >= CONTAINER_MD) return "trailing";
  return "under";
}

/**
 * Contrast ratios read off the rendered page. Colours are resolved through a
 * canvas, because the contract's values are OKLCH and the browser is the only
 * thing that converts them the way it painted them.
 */
async function textRatios(
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

      function surfaceOf(el: Element): string {
        let node: Element | null = el;
        while (node) {
          const bg = getComputedStyle(node).backgroundColor;
          if (toRgba(bg)[3] > 0) return bg;
          node = node.parentElement;
        }
        return getComputedStyle(document.body).backgroundColor;
      }

      const panel = document.querySelector(`[data-demo-state="${state}"]`);
      const block = panel?.querySelector(selector);
      if (!block) throw new Error(`the ${state} preview did not render the block`);

      const pick = (selector: string): Element => {
        const el = block.querySelector(selector);
        if (!el) throw new Error(`${state}: missing ${selector}`);
        return el;
      };
      const against = (el: Element) => ratio(getComputedStyle(el).color, surfaceOf(el));

      if (state === "empty") {
        return {
          emptyTitle: against(pick('[data-scope="card"][data-part="title"]')),
          emptyDescription: against(pick('[data-scope="card"][data-part="description"]')),
        };
      }
      if (state === "error") {
        return {
          failedTitle: against(pick('[data-scope="alert"][data-part="title"]')),
          failedDescription: against(pick('[data-scope="alert"][data-part="description"]')),
          failedAction: against(pick('[data-scope="alert"] [data-scope="button"]')),
        };
      }

      const first = pick("ol > li");
      const ratios: Record<string, number> = {
        heading: against(pick("h2")),
        headingDescription: against(pick("h2 + p")),
        viewAllLabel: against(pick('[data-scope="button"]')),
        initials: against(pick('[data-scope="avatar"][data-part="fallback"]')),
      };
      const inFirst = (selector: string) => {
        const el = first.querySelector(selector);
        if (!el) throw new Error(`first row: missing ${selector}`);
        return against(el);
      };
      ratios.sentence = inFirst(":scope > p");
      ratios.time = inFirst(":scope > time");
      ratios.comment = inFirst(":scope > blockquote p");
      ratios.rowAction = inFirst('[data-scope="button"]');
      return ratios;
    },
    { state, selector: BLOCK },
  );
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`activity-feed — ${scheme}`, () => {
    test.use({ colorScheme: scheme });

    for (const width of WIDTHS) {
      test(`lays itself out from its container at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1200 });
        await page.goto(PAGE, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready.then(() => true));

        expect(await page.evaluate(() => document.documentElement.classList.contains("dark"))).toBe(
          scheme === "dark",
        );

        const blocks: BlockMetrics[] = [];
        for (const state of STATES) {
          await showState(page, state);
          const mounted = await blockMetrics(page, state);
          expect(mounted, `${state}: mounted copies`).toHaveLength(1);
          const block = mounted[0]!;
          blocks.push(block);
          const where = `${scheme} ${width}px, ${state} (${block.containerWidth}px)`;

          expect(block.headerDisplay, `${where}: header row`).toBe(
            block.containerWidth >= CONTAINER_SM ? "flex" : "grid",
          );
          if (block.rows > 0) {
            expect(block.rows, `${where}: events`).toBe(4);
            expect(block.avatars, `${where}: avatars`).toBe(4);
            // The rail joins each avatar to the next, so the last row draws none.
            expect(block.visibleRails, `${where}: rails`).toBe(3);
            expect(block.commentClamped, `${where}: comment cut`).toBe(
              block.containerWidth < CONTAINER_SM,
            );
            expect(block.timePlacement, `${where}: timestamp`).toBe(
              expectedPlacement(block.containerWidth),
            );
          }

          // The `@lg` frame is wider than the docs column and scrolls inside
          // its own frame; the panel holding the demo never does.
          const panel = await page.evaluate((state) => {
            const el = document
              .querySelector(`[data-demo-state="${state}"]`)!
              .closest(".preview-panel--demo") as HTMLElement;
            return { scroll: el.scrollWidth, client: el.clientWidth };
          }, state);
          expect(panel.scroll, `${where}: demo panel overflow`).toBeLessThanOrEqual(panel.client);
        }

        const lists = blocks.filter((block) => block.rows > 0);
        expect(lists.length, `${scheme} ${width}px: copies rendering the timeline`).toBe(5);
        expect(blocks.filter((b) => b.emptyCard).length, "the empty render").toBe(1);
        expect(blocks.filter((b) => b.busyRegion).length, "the loading render").toBe(1);
        expect(blocks.filter((b) => b.failedAlert).length, "the failed-load render").toBe(1);
        expect(lists.filter((b) => b.allControlsInert).length, "the disabled render").toBe(1);

        // Each step is exercised on both sides at every viewport, so a step
        // that silently stopped firing cannot pass this file.
        const widths = lists.map((b) => b.containerWidth);
        for (const step of [CONTAINER_SM, CONTAINER_MD, CONTAINER_LG]) {
          expect(
            widths.some((w) => w < step),
            `a copy under ${step}px`,
          ).toBe(true);
          expect(
            widths.some((w) => w >= step),
            `a copy over ${step}px`,
          ).toBe(true);
        }
      });
    }

    test("clears AA contrast on every text it paints", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      const ratios = {
        ...(await textRatios(page, "default")),
        ...(await textRatios(page, "empty")),
        ...(await textRatios(page, "error")),
      };
      for (const [what, ratio] of Object.entries(ratios)) {
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
      }
    });

    test("shows hover and focus-visible on a row action", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const reply = page
        .locator(`[data-demo-state="default"] ${BLOCK} ol > li`)
        .first()
        .locator('[data-scope="button"]');

      const background = () => reply.evaluate((el) => getComputedStyle(el).backgroundColor);
      const resting = await background();
      await reply.hover();
      expect(await background(), `${scheme}: hover background`).not.toBe(resting);

      await page.mouse.move(0, 0);
      await reply.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const outline = await reply.evaluate((el) => ({
        focused: el.matches(":focus-visible"),
        style: getComputedStyle(el).outlineStyle,
      }));
      expect(outline.focused, `${scheme}: keyboard focus`).toBe(true);
      expect(outline.style, `${scheme}: focus ring`).not.toBe("none");
    });

    test("names the event in every row action's accessible name", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const actions = await page.evaluate((selector) => {
        const block = document.querySelector(`[data-demo-state="default"] ${selector}`)!;
        return [...block.querySelectorAll("ol > li")].flatMap((row) => {
          const button = row.querySelector('[data-scope="button"]');
          if (!button) return [];
          return [
            {
              name: button.getAttribute("aria-label") ?? "",
              label: button.textContent?.trim() ?? "",
              sentence: row.querySelector(":scope > p")?.textContent?.replace(/\s+/g, " ").trim(),
            },
          ];
        });
      }, BLOCK);
      expect(actions).toHaveLength(2);
      for (const { name, label, sentence } of actions) {
        expect(name.startsWith(label), `"${name}" starts with its visible label`).toBe(true);
        expect(name).toContain(sentence!);
      }
    });
  });
}
