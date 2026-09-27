/**
 * The referral flow, checked where it is shown to a reader: the built docs page,
 * walked end to end, and then measured at the three widths of the responsive
 * policy (375 / 768 / 1280) in both colour schemes.
 *
 * What is asserted here:
 *
 * 1. **The journey.** referral-invite → referral-share → referral-reward and
 *    back to referral-share, with nothing but the fields, links and buttons a
 *    reader can see. The docs page prints the assembly's two callbacks as they
 *    fire, so the walk also witnesses `onstepchange` and `oninvite`.
 * 2. **One list of friends.** Addresses sent from the invite form and from the
 *    share screen's own invite field land on the share screen's list, and the
 *    reward screen counts that same list. An address is on it, and sent, once,
 *    however often and in whatever case it was typed.
 * 3. **Navigation is interception, not a button.** "Skip for now" and "Invite
 *    more friends" are real `href`s (`#referral-reward`, `#referral-share`), and
 *    taking one changes the screen without changing the document's URL.
 * 4. **Container, not viewport.** The demo's Phone, Tablet and Desktop tabs
 *    mount the flow in three frame widths, so at every viewport they disagree:
 *    the masthead lines up at `--container-sm` and the footer at
 *    `--container-md`, both read off the frame, never the window (ADR-0005).
 * 5. **AA contrast** on the text the screen under the flow paints, in light and
 *    in dark.
 */
import { expect, test, type Locator, type Page } from "@playwright/test";

/** The two container steps the screens read, in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/referral/";

/**
 * The demo's tabs (islands/ReferralFlowDemo.svelte), in order. Only the active
 * tab's copy of the flow is mounted, and the phone one is what the page opens on.
 */
const TABS = ["phone", "tablet", "desktop"] as const;
type Tab = (typeof TABS)[number];

/** The walkable copy — the Desktop tab's, which the walks select first. */
function flow(page: Page): Locator {
  return page.locator('.preview-panel--demo [data-demo-state="desktop"] .moderno-flow-referral');
}

/** Scrolls the preview into view and waits for it to hydrate (it mounts `client:visible`). */
async function hydrated(page: Page): Promise<void> {
  await page.locator(".preview-panel--demo").first().scrollIntoViewIfNeeded();
  await page
    .locator(".preview-panel--demo astro-island:not([ssr])")
    .first()
    .waitFor({ state: "attached" });
}

/** Selects a tab of the demo and waits for its copy of the flow to mount. */
async function showTab(page: Page, tab: Tab): Promise<void> {
  await page.locator(`[data-demo-tab="${tab}"]`).click();
  await page
    .locator(`[data-demo-state="${tab}"] div.moderno-flow-referral`)
    .waitFor({ state: "attached" });
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

/** The number a reward card shows, by the card's title. */
function rewardValue(page: Page, label: string): Locator {
  return flow(page)
    .locator(".moderno-block-kpi-card")
    .filter({ has: page.getByText(label, { exact: true }) })
    .locator("p.tabular-nums");
}

async function openWalk(page: Page): Promise<void> {
  await page.setViewportSize({ width: 1280, height: 1200 });
  await page.goto(PAGE, { waitUntil: "networkidle" });
  await hydrated(page);
  await showTab(page, "desktop");
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
  /** Every heading's *effective* rank, in document order (`aria-level` wins). */
  headingLevels: number[];
}

/** Every copy of the flow the active tab mounted — one, when the demo is right. */
async function flowMetrics(page: Page): Promise<FlowMetrics[]> {
  return page.evaluate(() => {
    const panel = document.querySelector(".preview-panel--demo [data-demo-state]");
    if (!panel) throw new Error("no demo tab panel on the page");
    return [...panel.querySelectorAll("div.moderno-flow-referral")].map((wrapper) => {
      const root = wrapper.firstElementChild;
      if (!root) throw new Error("the flow rendered no screen");
      const masthead = root.querySelector("header");
      const footer = root.querySelector("footer");
      if (!masthead || !footer) throw new Error("the screen lost its own markup");
      return {
        // Layout size, not the painted box: the docs scale the device to fit the
        // column, and that transform never changes what the container reads.
        containerWidth: (root as HTMLElement).offsetWidth,
        rootHeight: (root as HTMLElement).offsetHeight,
        frameHeight: (wrapper.parentElement as HTMLElement).clientHeight,
        mastheadDisplay: getComputedStyle(masthead).display,
        footerDisplay: getComputedStyle(footer).display,
        headingLevels: [...root.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((heading) =>
          Number(heading.getAttribute("aria-level") ?? heading.tagName.slice(1)),
        ),
      };
    });
  });
}

/**
 * Contrast ratios read off the rendered page. Colours are resolved through a
 * canvas rather than parsed: the contract's values are OKLCH, and the browser is
 * the only thing that converts them exactly the way it painted them.
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

    const root = document.querySelector(
      ".preview-panel--demo [data-demo-state] div.moderno-flow-referral",
    );
    if (!root) throw new Error("the flow did not render");

    const pick = (selector: string): Element => {
      const el = root.querySelector(selector);
      if (!el) throw new Error(`missing ${selector}`);
      return el;
    };

    const against = (el: Element) => ratio(getComputedStyle(el).color, surfaceOf(el));

    return {
      wordmark: against(pick("header a")),
      mastheadLink: against(pick("header a:last-child")),
      title: against(pick("h1")),
      copyright: against(pick("footer p")),
      legalLink: against(pick("footer nav a")),
    };
  });
}

test.describe("referral flow", () => {
  test("walks invite → share → reward → share on the fields, links and buttons alone", async ({
    page,
  }) => {
    await openWalk(page);
    const walked = flow(page);
    expect(await currentScreen(page)).toBe("referral-invite");

    // A bad address is refused by the assembly, and the reader stays put.
    const emails = walked.locator('textarea[name="emails"]');
    await emails.fill("ada@example.com, not-an-email");
    await walked.getByRole("button", { name: "Send invites" }).click();
    expect(await currentScreen(page)).toBe("referral-invite");
    await expect(walked).toContainText("not-an-email is not an email address.");

    await emails.fill("ada@example.com\ngrace@example.com");
    await walked.getByRole("button", { name: "Send invites" }).click();

    // A sent form leaves for the share screen, which lists who was just invited.
    expect(await currentScreen(page)).toBe("referral-share");
    expect(await reported(page)).toContain('oninvite(["ada@example.com","grace@example.com"])');
    expect(await reported(page)).toContain('onstepchange("referral-share")');
    await expect(walked.getByText("ada@example.com", { exact: true })).toBeVisible();
    await expect(walked.getByText("grace@example.com", { exact: true })).toBeVisible();

    // The share screen's own invite field adds to the same list.
    await walked.locator('input[name="email"]').fill("alan@example.com");
    await walked.getByRole("button", { name: "Invite", exact: true }).click();
    await expect(walked.getByText("alan@example.com", { exact: true })).toBeVisible();
    expect(await reported(page)).toContain('oninvite(["alan@example.com"])');

    // "Skip for now" is a real href, and the assembly takes the click without
    // letting the document navigate.
    const skip = walked.getByRole("link", { name: "Skip for now" });
    await expect(skip).toHaveAttribute("href", "#referral-reward");
    const before = page.url();
    await skip.click();
    expect(await currentScreen(page)).toBe("referral-reward");
    expect(page.url()).toBe(before);

    // The reward screen counts the one list: three invited, nobody joined yet.
    await expect(rewardValue(page, "Friends invited")).toHaveText("3");
    await expect(rewardValue(page, "Friends joined")).toHaveText("0");
    await expect(rewardValue(page, "Months earned")).toHaveText("0");

    const more = walked.getByRole("link", { name: "Invite more friends" });
    await expect(more).toHaveAttribute("href", "#referral-share");
    await more.click();
    expect(await currentScreen(page)).toBe("referral-share");
    expect(page.url()).toBe(before);
    await expect(walked.getByText("alan@example.com", { exact: true })).toBeVisible();
  });

  test('"Not now" skips the invite form and the reward shows no activity', async ({ page }) => {
    await openWalk(page);
    const walked = flow(page);

    await walked.getByRole("button", { name: "Not now" }).click();
    expect(await currentScreen(page)).toBe("referral-share");
    expect(await reported(page)).not.toContainEqual(expect.stringContaining("oninvite"));

    await walked.getByRole("link", { name: "Skip for now" }).click();
    expect(await currentScreen(page)).toBe("referral-reward");
    await expect(walked.getByText("No data yet")).toHaveCount(3);
  });

  test("invites an address once, however often and in whatever case it is typed", async ({
    page,
  }) => {
    await openWalk(page);
    const walked = flow(page);

    // Repeated in one send, and again in another case: one invitation, one row.
    await walked
      .locator('textarea[name="emails"]')
      .fill("ada@example.com, ada@example.com\nAda@example.com, grace@example.com");
    await walked.getByRole("button", { name: "Send invites" }).click();
    expect(await currentScreen(page)).toBe("referral-share");
    expect(await reported(page)).toContain('oninvite(["ada@example.com","grace@example.com"])');
    await expect(walked.getByText("ada@example.com", { exact: true })).toHaveCount(1);

    // Already on the list, in yet another case: nothing is added or sent.
    await walked.locator('input[name="email"]').fill("ADA@example.com");
    await walked.getByRole("button", { name: "Invite", exact: true }).click();
    expect(await reported(page)).not.toContainEqual(expect.stringContaining("ADA@example.com"));
    await expect(walked.getByText("ada@example.com", { exact: true })).toHaveCount(1);

    await walked.getByRole("link", { name: "Skip for now" }).click();
    expect(await currentScreen(page)).toBe("referral-reward");
    await expect(rewardValue(page, "Friends invited")).toHaveText("2");
  });

  test("opens a returning member on the rewards their friends earned", async ({ page }) => {
    await page.goto(PAGE, { waitUntil: "networkidle" });
    const example = page.locator('[data-demo-state="returning"] .moderno-flow-referral');
    await example.scrollIntoViewIfNeeded();
    await expect(example.locator("> div").first()).toHaveClass(/moderno-screen-referral-reward/);
    const value = (label: string) =>
      example
        .locator(".moderno-block-kpi-card")
        .filter({ has: page.getByText(label, { exact: true }) })
        .locator("p.tabular-nums");
    await expect(value("Friends invited")).toHaveText("3");
    await expect(value("Friends joined")).toHaveText("2");
    await expect(value("Months earned")).toHaveText("2");
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

          await hydrated(page);

          // One tab, one mounted copy: walk the tabs in order, so `mounted[i]`
          // is the copy `TABS[i]` mounted.
          const mounted: FlowMetrics[] = [];
          for (const tab of TABS) {
            await showTab(page, tab);
            const copies = await flowMetrics(page);
            expect(copies, `${scheme} ${width}px, ${tab}: mounted copies`).toHaveLength(1);
            mounted.push(copies[0]!);
          }

          const widths = mounted.map((m) => m.containerWidth);
          expect(
            widths.some((w) => w < CONTAINER_SM),
            `${scheme} ${width}px: a copy below @sm`,
          ).toBe(true);
          expect(
            widths.some((w) => w >= CONTAINER_MD),
            `${scheme} ${width}px: a copy at or above @md`,
          ).toBe(true);

          for (const [index, metrics] of mounted.entries()) {
            const where = `${scheme} ${width}px, ${TABS[index]} (${metrics.containerWidth}px)`;
            expect(metrics.mastheadDisplay, `${where}: masthead`).toBe(
              metrics.containerWidth >= CONTAINER_SM ? "flex" : "grid",
            );
            expect(metrics.footerDisplay, `${where}: footer`).toBe(
              metrics.containerWidth >= CONTAINER_MD ? "flex" : "grid",
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
