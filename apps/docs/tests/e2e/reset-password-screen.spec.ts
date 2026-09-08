/**
 * The reset-password screen, checked where it is actually shown to a reader:
 * the built docs page, at the three widths of the responsive policy
 * (375 / 768 / 1280) in both colour schemes.
 *
 * This is the seam that replaces a screenshot baseline for this screen. The
 * pixel baselines were dropped from this repo (see `playwright.config.ts`)
 * because almost every PR invalidated them; what those PNGs were actually
 * guarding — "does the layout step fire at the right width, and is the text
 * still legible in both schemes?" — is a computed-style fact, and asking the
 * browser for it directly is both cheaper and more precise than diffing images.
 *
 * Seven claims, per width and per scheme:
 *
 * 1. **Container, not viewport.** All three of the screen's steps are read off
 *    the width of the frame it was mounted in, never the window: the masthead
 *    lines up at `--container-sm`, the footer at `--container-md`, and the notes
 *    move beside the card at `--container-lg`. The page mounts the same file in
 *    a phone-, a tablet- and a desktop-width frame, so at every viewport the
 *    three answers differ from each other — which is the whole of ADR-0005.
 * 2. **A screen owns the viewport as a height.** Its root fills the window it is
 *    given, top to bottom. On this page each frame *is* that window — the demo
 *    overrides `min-h-dvh` to the frame's height so seven copies of a browser
 *    window do not stack down the page — so what is asserted here is that the
 *    screen fills whatever it was told the window is. That the shipped file says
 *    `min-h-dvh` is held by `tooling/cli/test/screens-install.test.ts`, against
 *    the bytes the CLI writes.
 * 3. **It asks for a new password, twice, and carries the token.** Whatever the
 *    width, the named controls the form submits are exactly `token`, `password`
 *    and `confirmPassword` — no email, and above all no *current* password:
 *    whoever is on this page followed a link precisely because they have none.
 *    The token's control is hidden in every copy, so the reset is a plain form
 *    submission on a page that never hydrated.
 * 4. **The rules are the field's own helper text.** The list is inside the
 *    new-password field and its id is in that input's `aria-describedby`, so a
 *    screen reader reads the rules on focus; it is a polite live region, so the
 *    one row that flips is announced; and every row states its status in words
 *    as well as in a glyph, because a rule you can only tell has passed by its
 *    colour has not been said to everyone.
 * 5. **`met` comes from the page, not the card.** The fourth copy is the one
 *    with two rules met; every other copy shows the same three rules unticked,
 *    which is what a block that holds no value can honestly render.
 * 6. **The outline reads as one page.** The screen's first heading is level 1 —
 *    the card's title, carrying `titleLevel`, because the card *is* what the
 *    page is called — and no heading after it skips a rank.
 * 7. **AA contrast** on every text the screen paints itself — the wordmark, the
 *    support line and its link, the copyright, the legal links — plus the notes
 *    heading it hands the block and the rules under the password, in light and
 *    in dark.
 */
import { expect, test, type Page } from "@playwright/test";

/** The contract's three container steps, in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/reset-password/";

/** The demo mounts the screen once per frame width, then once per state. */
const MOUNTED_COPIES = 7;

/** The demo's fourth copy is the one whose rules are half met. */
const RULES_MET_COPY = 3;

interface ScreenMetrics {
  /** Width of the screen's own `@container` root — what its steps read. */
  containerWidth: number;
  /** Height of the root against the frame it was mounted in — it fills it. */
  rootHeight: number;
  /** Content height of that frame, i.e. what the screen treats as its window. */
  frameHeight: number;
  /** `display` of the masthead: stacked below `@sm`, one row at or above it. */
  mastheadDisplay: string;
  /** `display` of the footer: stacked below `@md`, one row at or above it. */
  footerDisplay: string;
  /** Number of grid tracks in the content region: one column, or two at `@lg`. */
  contentColumns: number;
  /** Whether the notes aside is rendered at all (it is not when empty). */
  hasNotices: boolean;
  /** The `name` of every control the card submits, in document order. */
  fieldNames: string[];
  /** `type` of the control named `token`: the hidden carrier of the link's value. */
  tokenInputType: string;
  /** Whether the new-password input points its `aria-describedby` at the rules. */
  rulesDescribePassword: boolean;
  /** `role` and `aria-live` on the rules list. */
  rulesRole: string;
  rulesLive: string;
  /** Each rule's text, including the word that doubles its glyph. */
  ruleTexts: string[];
  /** How many rules say they are met, read off that text rather than a colour. */
  rulesMet: number;
  /** Every heading's *effective* rank, in document order (`aria-level` wins). */
  headingLevels: number[];
}

/** Every mounted copy of the screen on the page, in document order. */
async function screenMetrics(page: Page): Promise<ScreenMetrics[]> {
  return page.evaluate(() => {
    const panel = document.querySelector(".preview-panel--demo");
    if (!panel) throw new Error("no .preview-panel--demo on the page");
    return [...panel.querySelectorAll("div.moderno-screen-reset-password")].map((root) => {
      const masthead = root.querySelector("header");
      const footer = root.querySelector("footer");
      const content = root.querySelector("header + div");
      if (!masthead || !footer || !content) {
        throw new Error("the reset-password screen did not render its own markup");
      }
      const token = root.querySelector<HTMLInputElement>('form [name="token"]');
      const password = root.querySelector<HTMLInputElement>('form [name="password"]');
      const rules = root.querySelector(
        '[data-scope="field"][data-part="helper-text"][role="list"]',
      );
      const describedBy = password?.getAttribute("aria-describedby") ?? "";
      const ruleTexts = rules
        ? [...rules.querySelectorAll('[role="listitem"]')].map((row) =>
            (row.textContent ?? "").replace(/\s+/g, " ").trim(),
          )
        : [];
      return {
        containerWidth: root.getBoundingClientRect().width,
        rootHeight: root.getBoundingClientRect().height,
        frameHeight: (root.parentElement as HTMLElement).clientHeight,
        mastheadDisplay: getComputedStyle(masthead).display,
        footerDisplay: getComputedStyle(footer).display,
        contentColumns: getComputedStyle(content).gridTemplateColumns.split(/\s+/).length,
        hasNotices: content.querySelector("aside") !== null,
        fieldNames: [...root.querySelectorAll<HTMLInputElement>("form [name]")].map(
          (el) => el.name,
        ),
        tokenInputType: token?.type ?? "",
        rulesDescribePassword:
          rules !== null && rules.id.length > 0 && describedBy.split(/\s+/).includes(rules.id),
        rulesRole: rules?.getAttribute("role") ?? "",
        rulesLive: rules?.getAttribute("aria-live") ?? "",
        ruleTexts,
        rulesMet: ruleTexts.filter((text) => text.includes("— met")).length,
        headingLevels: [...root.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((h) =>
          Number(h.getAttribute("aria-level") ?? h.tagName.slice(1)),
        ),
      };
    });
  });
}

/**
 * Scrolls the preview into view and waits for it to hydrate.
 *
 * The demo mounts `client:visible`, and the one thing on this page that is not
 * in the server-rendered markup is the wiring Ark does on the client: pointing
 * the new-password input's `aria-describedby` at the helper text that holds the
 * rules. At 375px the preview panel starts below the fold, so without this the
 * assertion would be reading a page the reader has not got to yet.
 */
async function hydrated(page: Page): Promise<void> {
  await page.locator(".preview-panel--demo").scrollIntoViewIfNeeded();
  await page.waitForFunction((expected) => {
    const roots = [...document.querySelectorAll("div.moderno-screen-reset-password")];
    return (
      roots.length === expected &&
      roots.every(
        (root) =>
          (root.querySelector('form [name="password"]')?.getAttribute("aria-describedby") ?? "")
            .length > 0,
      )
    );
  }, MOUNTED_COPIES);
}

/**
 * Contrast ratios read off the rendered page.
 *
 * Colours are resolved through a canvas rather than parsed: the contract's
 * values are OKLCH, `getComputedStyle` hands them back in whatever space they
 * were authored in, and the browser is the only thing that converts them
 * exactly the way it painted them.
 */
async function contrastRatios(page: Page): Promise<Record<string, number>> {
  return page.evaluate(() => {
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
        const [, , , alpha] = toRgba(getComputedStyle(node).backgroundColor);
        if (alpha > 0) return getComputedStyle(node).backgroundColor;
        node = node.parentElement;
      }
      return getComputedStyle(document.body).backgroundColor;
    }

    const panel = document.querySelector(".preview-panel--demo");
    if (!panel) throw new Error("no .preview-panel--demo on the page");
    const root = panel.querySelector("div.moderno-screen-reset-password");
    if (!root) throw new Error("the reset-password screen did not render");

    const pick = <T extends Element>(selector: string): T => {
      const el = root.querySelector<T>(selector);
      if (!el) throw new Error(`missing ${selector}`);
      return el;
    };

    const against = (el: Element) => ratio(getComputedStyle(el).color, surfaceOf(el));

    return {
      wordmark: against(pick("header a")),
      supportLine: against(pick("header p")),
      supportLink: against(pick("header p a")),
      passwordRules: against(pick('[data-part="helper-text"][role="list"]')),
      noticesHeading: against(pick("aside h2")),
      noticesDescription: against(pick("aside h2 + p")),
      copyright: against(pick("footer p")),
      legalLink: against(pick("footer nav a")),
    };
  });
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`reset-password — ${scheme}`, () => {
    test.use({ colorScheme: scheme });

    for (const width of WIDTHS) {
      test(`lays itself out from its container at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1200 });
        await page.goto(PAGE, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready.then(() => true));
        await hydrated(page);

        expect(await page.evaluate(() => document.documentElement.classList.contains("dark"))).toBe(
          scheme === "dark",
        );

        const screens = await screenMetrics(page);
        expect(screens).toHaveLength(MOUNTED_COPIES);

        // The three frame widths are fixed by the demo, so at every viewport the
        // page holds one copy in each band of the screen's three steps.
        const widths = screens.map((s) => s.containerWidth);
        expect(
          widths.some((w) => w < CONTAINER_SM),
          `${scheme} ${width}px: a copy below @sm`,
        ).toBe(true);
        expect(
          widths.some((w) => w >= CONTAINER_LG),
          `${scheme} ${width}px: a copy at or above @lg`,
        ).toBe(true);

        for (const [index, screen] of screens.entries()) {
          const where = `${scheme} ${width}px, copy ${index + 1} (${screen.containerWidth}px)`;
          expect(screen.mastheadDisplay, `${where}: masthead`).toBe(
            screen.containerWidth >= CONTAINER_SM ? "flex" : "grid",
          );
          expect(screen.footerDisplay, `${where}: footer`).toBe(
            screen.containerWidth >= CONTAINER_MD ? "flex" : "grid",
          );
          expect(screen.contentColumns, `${where}: content columns`).toBe(
            screen.containerWidth >= CONTAINER_LG ? 2 : 1,
          );
          // Full-viewport is a height: the screen fills the window it is given.
          // On this page each frame stands in for that window (the demo says so
          // and overrides `min-h-dvh` to the frame's own height); what is being
          // held here is that the screen still fills it, top to bottom.
          expect(screen.rootHeight, `${where}: root height`).toBeGreaterThanOrEqual(
            screen.frameHeight,
          );
          // A new password, twice, plus the token out of the link — and never a
          // `current-password` field, because whoever is here has no current
          // password to give.
          expect(screen.fieldNames, `${where}: fields`).toEqual([
            "token",
            "password",
            "confirmPassword",
          ]);
          expect(screen.tokenInputType, `${where}: token control`).toBe("hidden");
          // The rules are the field's own helper text, so they are announced on
          // focus and each row that flips is announced on its own.
          expect(screen.rulesDescribePassword, `${where}: rules describe the input`).toBe(true);
          expect(screen.rulesRole, `${where}: rules role`).toBe("list");
          expect(screen.rulesLive, `${where}: rules live region`).toBe("polite");
          expect(screen.ruleTexts.length, `${where}: rule rows`).toBe(3);
          // Never colour alone: every row says in words where it stands.
          for (const text of screen.ruleTexts) {
            expect(text, `${where}: rule status in words`).toMatch(/— (met|not met yet)$/);
          }
          // A screen is the whole route, so it has a top-level heading and the
          // headings under it descend one rank at a time. The card's title is
          // that `h1` (it is what the page is *called*), which is why the block
          // takes `titleLevel` rather than the screen printing a second one.
          expect(screen.headingLevels[0], `${where}: first heading`).toBe(1);
          for (const [i, level] of screen.headingLevels.entries()) {
            if (i === 0) continue;
            expect(
              level,
              `${where}: heading ${i + 1} of ${screen.headingLevels.join("/")}`,
            ).toBeLessThanOrEqual(screen.headingLevels[i - 1]! + 1);
          }
        }

        // `met` is the page's answer, not the card's: only the copy that was
        // handed ticked rules shows any, and it shows exactly the two it was
        // given. Every other copy renders the block's own unticked default.
        for (const [index, screen] of screens.entries()) {
          expect(screen.rulesMet, `${scheme} ${width}px, copy ${index + 1}: rules met`).toBe(
            index === RULES_MET_COPY ? 2 : 0,
          );
        }

        // The last copy is the empty one: nothing to say about the link, so the
        // aside is not rendered at all rather than rendered with nothing in it.
        expect(screens.slice(0, -1).every((s) => s.hasNotices)).toBe(true);
        expect(screens.at(-1)!.hasNotices).toBe(false);
      });
    }

    test("clears AA contrast on every text it paints", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await hydrated(page);
      const ratios = await contrastRatios(page);
      for (const [what, ratio] of Object.entries(ratios)) {
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
      }
    });
  });
}
