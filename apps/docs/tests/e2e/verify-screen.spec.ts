/**
 * The verify screen, checked where it is actually shown to a reader: the built
 * docs page, at the three widths of the responsive policy (375 / 768 / 1280) in
 * both colour schemes.
 *
 * This is the seam that replaces a screenshot baseline for this screen. The
 * pixel baselines were dropped from this repo (see `playwright.config.ts`)
 * because almost every PR invalidated them; what those PNGs were actually
 * guarding — "does the layout step fire at the right width, and is the text
 * still legible in both schemes?" — is a computed-style fact, and asking the
 * browser for it directly is both cheaper and more precise than diffing images.
 *
 * Eight claims, per width and per scheme:
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
 * 3. **It asks for a code, and nothing else.** Whatever the width, the named
 *    controls the form submits are exactly `email` and `code` — no password, of
 *    either kind: whoever is on this page has already chosen one. The address is
 *    hidden and the code's own control is Ark's visually hidden input, so the
 *    check *and* the resend post from a page that never hydrated. The cells
 *    themselves are unnamed: one value, one name.
 * 4. **The cells are a one-time code.** There is one per digit of `codeLength`,
 *    each `autocomplete="one-time-code"` — the attribute that lets a phone offer
 *    the code straight out of the notification — and each with a label of its
 *    own, so a screen reader says which of how many it is on.
 * 5. **Two submits, told apart by name.** The card carries exactly two, in this
 *    order: the check first, so the Enter key still verifies, and the resend
 *    second, carrying `name="intent" value="resend"`. Nothing else in the form
 *    is named `intent`, or the branch the docs promise would read the wrong
 *    button.
 * 6. **The states are said, not coloured.** The copy handed a rejected code
 *    marks every cell `aria-invalid` and prints the reason in an `alert`; the
 *    copy handed a countdown disables the resend and says how many seconds are
 *    left in its own label. Every other copy shows neither.
 * 7. **The outline reads as one page.** The screen's first heading is level 1 —
 *    the card's title, carrying `titleLevel`, because the card *is* what the
 *    page is called — and no heading after it skips a rank.
 * 8. **AA contrast** on every text the screen paints itself — the wordmark, the
 *    support line and its link, the copyright, the legal links — plus the code's
 *    label and the notes heading it hands the blocks, in light and in dark.
 */
import { expect, test, type Page } from "@playwright/test";

/** The contract's three container steps, in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/verify/";

/** The demo mounts the screen once per frame width, then once per state. */
const MOUNTED_COPIES = 7;

/** The demo's fourth copy is the one handed a rejected code. */
const REJECTED_COPY = 3;
/** …and its fifth is the one whose resend is still counting down. */
const COUNTING_DOWN_COPY = 4;

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
  /** The `name` of every *input* the card submits, in document order. The
   * resend button is named too — that is how it is told apart — so this is
   * deliberately the fields and not every named element.
   */
  fieldNames: string[];
  /** `type` of the control named `email`: the hidden carrier of the address. */
  emailInputType: string;
  /** Whether the control named `code` is the one Ark hides from the a11y tree. */
  codeInputHidden: boolean;
  /** One visible cell per digit, each carrying its own label and no name. */
  cellCount: number;
  cellAutocomplete: string[];
  cellsLabelled: boolean;
  cellsUnnamed: boolean;
  /** Whether every cell is marked invalid — the rejected code's only tell. */
  cellsInvalid: boolean;
  /** The text of the `alert` beside the cells, if any (never the form-level one). */
  codeAlert: string;
  /** The two submits, in document order: their text and whether they are inert. */
  submits: { name: string; value: string; text: string; disabled: boolean }[];
  /** Every heading's *effective* rank, in document order (`aria-level` wins). */
  headingLevels: number[];
}

/** Every mounted copy of the screen on the page, in document order. */
async function screenMetrics(page: Page): Promise<ScreenMetrics[]> {
  return page.evaluate(() => {
    const panel = document.querySelector(".preview-panel--demo");
    if (!panel) throw new Error("no .preview-panel--demo on the page");
    return [...panel.querySelectorAll("div.moderno-screen-verify")].map((root) => {
      const masthead = root.querySelector("header");
      const footer = root.querySelector("footer");
      const content = root.querySelector("header + div");
      if (!masthead || !footer || !content) {
        throw new Error("the verify screen did not render its own markup");
      }
      const email = root.querySelector<HTMLInputElement>('form [name="email"]');
      const code = root.querySelector<HTMLInputElement>('form [name="code"]');
      const cells = [
        ...root.querySelectorAll<HTMLInputElement>('[data-scope="pin-input"][data-part="input"]'),
      ];
      // The code's own message, not the form-level one: the alert that sits
      // beside the cells, inside the group the card wraps them in.
      const pinRoot = root.querySelector('[data-scope="pin-input"][data-part="root"]');
      const alert = pinRoot?.parentElement?.querySelector('p[role="alert"]') ?? null;
      const submits = [...root.querySelectorAll<HTMLButtonElement>('form button[type="submit"]')];
      return {
        containerWidth: root.getBoundingClientRect().width,
        rootHeight: root.getBoundingClientRect().height,
        frameHeight: (root.parentElement as HTMLElement).clientHeight,
        mastheadDisplay: getComputedStyle(masthead).display,
        footerDisplay: getComputedStyle(footer).display,
        contentColumns: getComputedStyle(content).gridTemplateColumns.split(/\s+/).length,
        hasNotices: content.querySelector("aside") !== null,
        fieldNames: [...root.querySelectorAll<HTMLInputElement>("form input[name]")].map(
          (el) => el.name,
        ),
        emailInputType: email?.type ?? "",
        codeInputHidden: code?.getAttribute("aria-hidden") === "true",
        cellCount: cells.length,
        cellAutocomplete: cells.map((cell) => cell.getAttribute("autocomplete") ?? ""),
        cellsLabelled: cells.every((cell) => (cell.getAttribute("aria-label") ?? "").length > 0),
        cellsUnnamed: cells.every((cell) => !cell.hasAttribute("name")),
        cellsInvalid:
          cells.length > 0 && cells.every((cell) => cell.getAttribute("aria-invalid") === "true"),
        codeAlert: (alert?.textContent ?? "").replace(/\s+/g, " ").trim(),
        submits: submits.map((button) => ({
          name: button.name,
          value: button.value,
          text: (button.textContent ?? "").replace(/\s+/g, " ").trim(),
          disabled: button.disabled,
        })),
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
 * The demo mounts `client:visible`, and Ark only wires the cells — the labels
 * that say which digit of how many, the tab order that moves with the focus —
 * on the client. At 375px the preview panel starts below the fold, so without
 * this the assertions would be reading a page the reader has not got to yet.
 */
async function hydrated(page: Page): Promise<void> {
  await page.locator(".preview-panel--demo").scrollIntoViewIfNeeded();
  await page.waitForFunction((expected) => {
    const roots = [...document.querySelectorAll("div.moderno-screen-verify")];
    return (
      roots.length === expected &&
      roots.every((root) =>
        [...root.querySelectorAll('[data-scope="pin-input"][data-part="input"]')].every(
          (cell) => (cell.getAttribute("aria-label") ?? "").length > 0,
        ),
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
    const root = panel.querySelector("div.moderno-screen-verify");
    if (!root) throw new Error("the verify screen did not render");

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
      codeLabel: against(pick('[data-scope="pin-input"][data-part="label"]')),
      noticesHeading: against(pick("aside h2")),
      noticesDescription: against(pick("aside h2 + p")),
      copyright: against(pick("footer p")),
      legalLink: against(pick("footer nav a")),
    };
  });
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`verify — ${scheme}`, () => {
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
          // The code and the address it was sent to — and no password of either
          // kind, because whoever is here has already chosen one.
          expect(screen.fieldNames, `${where}: fields`).toEqual(["email", "code"]);
          expect(screen.emailInputType, `${where}: address control`).toBe("hidden");
          expect(screen.codeInputHidden, `${where}: code control`).toBe(true);
          // One cell per digit, each asking the platform for the one-time code
          // and saying which of how many it is; none of them is named, because
          // the whole code is one value under one name.
          expect(screen.cellCount, `${where}: cells`).toBe(6);
          expect(screen.cellAutocomplete, `${where}: cell autocomplete`).toEqual(
            Array.from({ length: 6 }, () => "one-time-code"),
          );
          expect(screen.cellsLabelled, `${where}: cells labelled`).toBe(true);
          expect(screen.cellsUnnamed, `${where}: cells unnamed`).toBe(true);
          // Two submits: the check first — so Enter still verifies — then the
          // resend, which is only tellable apart by the name it posts under.
          expect(screen.submits.length, `${where}: submits`).toBe(2);
          expect(screen.submits[0]!.name, `${where}: the check posts no intent`).toBe("");
          expect(screen.submits[1]!.name, `${where}: the resend's name`).toBe("intent");
          expect(screen.submits[1]!.value, `${where}: the resend's value`).toBe("resend");
          // …and `intent` is a button, never a field: a hidden input of that
          // name would post on *both* submits and the branch would misread the
          // check as a resend.
          expect(screen.fieldNames.includes("intent"), `${where}: no field is named intent`).toBe(
            false,
          );
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

        // A rejected code is the page's answer, not the card's: only the copy
        // handed one shows it, and it shows it twice over — every cell marked
        // invalid *and* a reason said in words, because a state carried by a
        // border colour alone has not been said to everyone.
        for (const [index, screen] of screens.entries()) {
          const where = `${scheme} ${width}px, copy ${index + 1}`;
          expect(screen.cellsInvalid, `${where}: cells invalid`).toBe(index === REJECTED_COPY);
          expect(screen.codeAlert.length > 0, `${where}: code alert`).toBe(index === REJECTED_COPY);
        }

        // …and so is the countdown: the copy still waiting says how long in the
        // resend's own label and disables it, rather than leaving a button that
        // looks pressable and quietly does nothing.
        for (const [index, screen] of screens.entries()) {
          const where = `${scheme} ${width}px, copy ${index + 1}`;
          const resend = screen.submits[1]!;
          if (index === COUNTING_DOWN_COPY) {
            expect(resend.disabled, `${where}: resend locked`).toBe(true);
            expect(resend.text, `${where}: resend says how long`).toMatch(/\d+s$/);
          } else {
            expect(resend.text, `${where}: resend offers a new code`).toBe("Send a new code");
          }
        }

        // The last copy is the empty one: nothing to say about the code, so the
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
