/**
 * The auth flow, checked where it is actually shown to a reader: the built docs
 * page, walked end to end, and then measured at the three widths of the
 * responsive policy (375 / 768 / 1280) in both colour schemes.
 *
 * This is the seam that replaces a screenshot baseline for this flow. The pixel
 * baselines were dropped from this repo (see `playwright.config.ts`) because
 * almost every PR invalidated them; what those PNGs were guarding — "does the
 * layout step fire at the right width, and is the text still legible in both
 * schemes?" — is a computed-style fact, and asking the browser for it directly
 * is both cheaper and more precise than diffing images. A flow adds a second
 * thing worth guarding that a screenshot could never see at all: whether the
 * journey between the screens actually happens.
 *
 * What is asserted here:
 *
 * 1. **The journey.** Both routes through the five screens are walked with
 *    nothing but the links and the buttons a reader can see: sign-in →
 *    sign-up → verify → signed in, and sign-in → forgot-password → the
 *    confirmation → reset-password → signed in. The docs page prints the
 *    assembly's two callbacks as they fire, so the walk also witnesses
 *    `onstepchange` and `onauthenticated` rather than only the markup.
 * 2. **Navigation is interception, not a button.** The step links are real
 *    `href`s — `#sign-up` and friends — which is what makes them work with no
 *    JavaScript, and clicking one changes the screen without changing the
 *    document's URL, which is what makes the assembly a router rather than a
 *    set of anchors.
 * 3. **Container, not viewport.** The page mounts the flow in a phone-width and
 *    a desktop-width frame, so at every viewport the two disagree: the masthead
 *    lines up at `--container-sm`, the footer at `--container-md`, and the notes
 *    move beside the card at `--container-lg` — all read off the frame, never
 *    the window (ADR-0005).
 * 4. **AA contrast** on the text the screen under the flow paints, in light and
 *    in dark.
 */
import { expect, test, type Locator, type Page } from "@playwright/test";

/** The contract's three container steps, in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/auth/";

/** The demo mounts the flow twice: one desktop-width frame, one phone-width. */
const MOUNTED_COPIES = 2;

/**
 * The card's own title, which is the page's `h1` — the screen hands the block
 * `titleLevel={1}` rather than printing a heading above it, so the element is a
 * card title carrying `aria-level="1"` and is addressed as one.
 */
function cardTitle(page: Page): Locator {
  return flow(page).locator('[data-scope="card"][data-part="title"]');
}

/** The walkable copy — the wide one, which also carries the callback readout. */
function flow(page: Page): Locator {
  return page.locator(".preview-panel--demo .demo-frame--desktop .moderno-flow-auth");
}

/** Which screen the assembly currently has on the route, by the screen's own class. */
async function currentScreen(page: Page): Promise<string> {
  return flow(page)
    .locator("> div")
    .first()
    .evaluate((root) => {
      const name = [...root.classList].find((entry) => entry.startsWith("moderno-screen-"));
      if (name === undefined) throw new Error("the flow rendered no screen");
      return name.slice("moderno-screen-".length);
    });
}

/** The callback lines the page printed, newest first. */
async function reported(page: Page): Promise<string[]> {
  return page.locator(".demo-events li code").allInnerTexts();
}

interface FlowMetrics {
  /** Width of the screen's own `@container` root — what its steps read. */
  containerWidth: number;
  /** Height of that root against the frame it was mounted in — it fills it. */
  rootHeight: number;
  /** Content height of the frame, i.e. what the flow treats as its window. */
  frameHeight: number;
  /** `display` of the masthead: stacked below `@sm`, one row at or above it. */
  mastheadDisplay: string;
  /** `display` of the footer: stacked below `@md`, one row at or above it. */
  footerDisplay: string;
  /** Grid tracks in the content region: one column, or two at `@lg`. */
  contentColumns: string;
  /** Every heading's *effective* rank, in document order (`aria-level` wins). */
  headingLevels: number[];
}

/** Every mounted copy of the flow on the page, in document order. */
async function flowMetrics(page: Page): Promise<FlowMetrics[]> {
  return page.evaluate(() => {
    const panel = document.querySelector(".preview-panel--demo");
    if (!panel) throw new Error("no .preview-panel--demo on the page");
    return [...panel.querySelectorAll("div.moderno-flow-auth")].map((wrapper) => {
      const root = wrapper.firstElementChild;
      if (!root) throw new Error("the flow rendered no screen");
      const masthead = root.querySelector("header");
      const footer = root.querySelector("footer");
      const content = root.querySelector("header + div");
      if (!masthead || !footer || !content) throw new Error("the screen lost its own markup");
      return {
        containerWidth: root.getBoundingClientRect().width,
        rootHeight: root.getBoundingClientRect().height,
        frameHeight: (wrapper.parentElement as HTMLElement).clientHeight,
        mastheadDisplay: getComputedStyle(masthead).display,
        footerDisplay: getComputedStyle(footer).display,
        contentColumns: getComputedStyle(content).gridTemplateColumns,
        headingLevels: [...root.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((heading) =>
          Number(heading.getAttribute("aria-level") ?? heading.tagName.slice(1)),
        ),
      };
    });
  });
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

    const root = document.querySelector(".preview-panel--demo div.moderno-flow-auth");
    if (!root) throw new Error("the flow did not render");

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
      noticesHeading: against(pick("aside h2")),
      copyright: against(pick("footer p")),
      legalLink: against(pick("footer nav a")),
    };
  });
}

test.describe("auth flow", () => {
  test("walks sign-up → verify → signed in on the links and the buttons alone", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 1200 });
    await page.goto(PAGE, { waitUntil: "networkidle" });

    const walked = flow(page);
    await expect(cardTitle(page)).toHaveText("Sign in");

    // The link out of the card is a real href — that is what makes it work with
    // no JavaScript — and the assembly takes the click without letting the
    // document navigate, which is what makes it a router.
    const create = walked.getByRole("link", { name: "Create an account" });
    await expect(create).toHaveAttribute("href", "#sign-up");
    const before = page.url();
    await create.click();
    expect(await currentScreen(page)).toBe("sign-up");
    expect(page.url()).toBe(before);
    expect(await reported(page)).toContain('onstepchange("sign-up")');

    await walked.locator('input[name="fullName"]').fill("Ada Lovelace");
    await walked.locator('input[name="email"]').fill("ada@example.com");
    await walked.locator('input[name="password"]').fill("correct horse battery");
    await walked.getByText("I agree to the terms and the privacy policy").click();
    await walked.getByRole("button", { name: "Create account" }).click();

    // A submitted sign-up leaves for the code, carrying the address with it.
    expect(await currentScreen(page)).toBe("verify");
    await expect(cardTitle(page)).toHaveText("Enter your code");
    await expect(walked.locator('input[name="email"]')).toHaveValue("ada@example.com");

    // The resend is the flow's own countdown: locked the moment the code goes
    // out, and counting in words rather than in colour.
    await expect(walked.getByRole("button", { name: /Send a new code in \d+s/ })).toBeDisabled();

    // A short code is refused by the assembly, not by the card.
    const cells = walked.locator('[data-scope="pin-input"] input:not([type="hidden"])');
    await cells.first().click();
    await page.keyboard.type("123");
    await walked.getByRole("button", { name: "Verify email" }).click();
    expect(await currentScreen(page)).toBe("verify");
    await expect(walked.locator('form [role="alert"]')).toContainText("6 digits");

    // The submit took the focus, so the cells are picked back up where they
    // were left — which is what a reader does after reading the message.
    await cells.nth(3).click();
    await page.keyboard.type("456");
    await walked.getByRole("button", { name: "Verify email" }).click();
    expect(await currentScreen(page)).toBe("sign-in");
    expect(await reported(page)).toContain('onauthenticated("ada@example.com")');
  });

  test("walks forgot-password → reset-password → signed in", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1200 });
    await page.goto(PAGE, { waitUntil: "networkidle" });

    const walked = flow(page);
    const forgot = walked.getByRole("link", { name: "Forgot your password?" });
    await expect(forgot).toHaveAttribute("href", "#forgot-password");
    await forgot.click();
    expect(await currentScreen(page)).toBe("forgot-password");

    await walked.locator('input[name="email"]').fill("ada@example.com");
    await walked.getByRole("button", { name: "Send reset link" }).click();

    // The card confirms in place; the flow stays on the same screen and swaps
    // the notes for the one that stands in for the email.
    expect(await currentScreen(page)).toBe("forgot-password");
    await expect(cardTitle(page)).toHaveText("Check your inbox");

    // The confirmation belongs to the step that produced it: leaving and coming
    // back has to hand the reader the form again, or a second address could
    // only be asked for by reloading the page.
    await walked.getByRole("link", { name: "Sign in" }).click();
    expect(await currentScreen(page)).toBe("sign-in");
    await walked.getByRole("link", { name: "Forgot your password?" }).click();
    expect(await currentScreen(page)).toBe("forgot-password");
    await expect(cardTitle(page)).toHaveText("Reset your password");
    await expect(walked.locator('input[name="email"]')).toBeVisible();

    await walked.locator('input[name="email"]').fill("ada@example.com");
    await walked.getByRole("button", { name: "Send reset link" }).click();
    await expect(cardTitle(page)).toHaveText("Check your inbox");

    await walked.getByRole("button", { name: "Open the reset link" }).click();
    expect(await currentScreen(page)).toBe("reset-password");

    // The token rides in the form the assembly handed the card.
    await expect(walked.locator('input[name="token"]')).toHaveValue(/.+/);

    await walked.locator('input[name="password"]').fill("a whole new sentence");
    await walked.locator('input[name="confirmPassword"]').fill("a different sentence");
    await walked.getByRole("button", { name: "Set new password" }).click();
    expect(await currentScreen(page)).toBe("reset-password");

    await walked.locator('input[name="confirmPassword"]').fill("a whole new sentence");
    await walked.getByRole("button", { name: "Set new password" }).click();
    expect(await currentScreen(page)).toBe("sign-in");
    expect(await reported(page)).toContain('onauthenticated("ada@example.com")');
  });

  for (const scheme of ["light", "dark"] as const) {
    test.describe(`${scheme}`, () => {
      test.use({ colorScheme: scheme });

      for (const width of WIDTHS) {
        test(`lays the screen out from its container at ${width}px`, async ({ page }) => {
          await page.setViewportSize({ width, height: 1200 });
          await page.goto(PAGE, { waitUntil: "networkidle" });
          await page.evaluate(() => document.fonts.ready.then(() => true));

          expect(
            await page.evaluate(() => document.documentElement.classList.contains("dark")),
          ).toBe(scheme === "dark");

          const mounted = await flowMetrics(page);
          expect(mounted).toHaveLength(MOUNTED_COPIES);

          // The two frame widths are fixed by the demo, so at every viewport the
          // page holds one copy below the first step and one above the last.
          const widths = mounted.map((m) => m.containerWidth);
          expect(
            widths.some((w) => w < CONTAINER_SM),
            `${scheme} ${width}px: a copy below @sm`,
          ).toBe(true);
          expect(
            widths.some((w) => w >= CONTAINER_LG),
            `${scheme} ${width}px: a copy at or above @lg`,
          ).toBe(true);

          for (const [index, metrics] of mounted.entries()) {
            const where = `${scheme} ${width}px, copy ${index + 1} (${metrics.containerWidth}px)`;
            expect(metrics.mastheadDisplay, `${where}: masthead`).toBe(
              metrics.containerWidth >= CONTAINER_SM ? "flex" : "grid",
            );
            expect(metrics.footerDisplay, `${where}: footer`).toBe(
              metrics.containerWidth >= CONTAINER_MD ? "flex" : "grid",
            );
            expect(metrics.contentColumns.split(/\s+/).length, `${where}: content columns`).toBe(
              metrics.containerWidth >= CONTAINER_LG ? 2 : 1,
            );
            // Full-viewport is a height, and the flow's wrapper passes it
            // through: on this page each frame stands in for the window.
            expect(metrics.rootHeight, `${where}: root height`).toBeGreaterThanOrEqual(
              metrics.frameHeight,
            );
            // The screen on the route is the whole page: a top-level heading,
            // and no rank skipped after it.
            expect(metrics.headingLevels[0], `${where}: first heading`).toBe(1);
            for (const [i, level] of metrics.headingLevels.entries()) {
              if (i === 0) continue;
              expect(
                level,
                `${where}: heading ${i + 1} of ${metrics.headingLevels.join("/")}`,
              ).toBeLessThanOrEqual(metrics.headingLevels[i - 1]! + 1);
            }
          }
        });
      }

      test("clears AA contrast on every text the screen under it paints", async ({ page }) => {
        await page.goto(PAGE, { waitUntil: "networkidle" });
        const ratios = await contrastRatios(page);
        for (const [what, ratio] of Object.entries(ratios)) {
          expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
        }
      });
    });
  }
});
