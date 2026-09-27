/**
 * The onboarding flow, checked on the built docs page: walked end to end with
 * nothing but the controls a reader can see, and then measured at the three
 * widths of the responsive policy (375 / 768 / 1280) in both colour schemes.
 *
 * What is asserted here:
 *
 * 1. **The journey.** welcome → profile-setup → plan-select → invite-team →
 *    `oncomplete`, through Continue, a saved profile, a chosen plan, sent
 *    invites and Continue. The docs page prints the assembly's two callbacks
 *    as they fire, so the walk witnesses `onstepchange` and `oncomplete`, and
 *    what the flow carried between screens (the name, the plan, the invites).
 * 2. **The assembly checks what a form can.** An empty profile and a bad
 *    address are refused on their step.
 * 3. **Skip is a link, routed.** "Skip for now" is a real `href` from
 *    `hrefFor`; a plain click moves one step on without changing the document
 *    URL, and "Skip for now" on welcome leaves the flow at once.
 * 4. **Container, not viewport.** The Phone, Tablet and Desktop tabs mount the
 *    flow in three frame widths, so at every viewport they disagree: the
 *    masthead lines up at `--container-sm` and the footer at `--container-md`
 *    (ADR-0005), and the screen fills its frame.
 */
import { expect, test, type Locator, type Page } from "@playwright/test";

/** The two container steps the screens read, in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/onboarding/";

/** The demo's tabs (islands/OnboardingFlowDemo.svelte), in order. */
const TABS = ["phone", "tablet", "desktop"] as const;
type Tab = (typeof TABS)[number];

/** The top preview: the one that opens on welcome with no name. */
function preview(page: Page): Locator {
  return page.locator(".preview-panel--demo").first();
}

/** The walkable copy — the Desktop tab's, which the walks select first. */
function flow(page: Page): Locator {
  return preview(page).locator('[data-demo-state="desktop"] .moderno-flow-onboarding');
}

/** Scrolls the top preview into view and waits for it to hydrate. */
async function hydrated(page: Page): Promise<void> {
  await preview(page).scrollIntoViewIfNeeded();
  await preview(page).locator("astro-island:not([ssr])").first().waitFor({ state: "attached" });
}

/** Selects a tab of the top demo and waits for its copy of the flow to mount. */
async function showTab(page: Page, tab: Tab): Promise<void> {
  await preview(page).locator(`[data-demo-tab="${tab}"]`).click();
  await preview(page)
    .locator(`[data-demo-state="${tab}"] div.moderno-flow-onboarding`)
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

/** The callback lines the top demo printed, newest first. */
async function reported(page: Page): Promise<string[]> {
  return preview(page).locator(".demo-events li code").allInnerTexts();
}

async function openDesktop(page: Page): Promise<Locator> {
  await page.setViewportSize({ width: 1280, height: 1200 });
  await page.goto(PAGE, { waitUntil: "networkidle" });
  await hydrated(page);
  await showTab(page, "desktop");
  return flow(page);
}

interface FlowMetrics {
  containerWidth: number;
  rootHeight: number;
  frameHeight: number;
  mastheadDisplay: string;
  footerDisplay: string;
}

/** Every copy of the flow the top demo's active tab mounted — one, when the demo is right. */
async function flowMetrics(page: Page): Promise<FlowMetrics[]> {
  return page.evaluate(() => {
    const panel = document.querySelector(".preview-panel--demo [data-demo-state]");
    if (!panel) throw new Error("no demo tab panel on the page");
    return [...panel.querySelectorAll("div.moderno-flow-onboarding")].map((wrapper) => {
      const root = wrapper.firstElementChild;
      if (!root) throw new Error("the flow rendered no screen");
      const masthead = root.querySelector("header");
      const footer = root.querySelector("footer");
      if (!masthead || !footer) throw new Error("the screen lost its own markup");
      return {
        containerWidth: (root as HTMLElement).offsetWidth,
        rootHeight: (root as HTMLElement).offsetHeight,
        frameHeight: (wrapper.parentElement as HTMLElement).clientHeight,
        mastheadDisplay: getComputedStyle(masthead).display,
        footerDisplay: getComputedStyle(footer).display,
      };
    });
  });
}

test.describe("onboarding flow", () => {
  test("walks welcome → profile → plan → invites → complete", async ({ page }) => {
    const walked = await openDesktop(page);
    expect(await currentScreen(page)).toBe("welcome");
    await expect(walked.getByRole("heading", { level: 1 })).toHaveText("Welcome to Moderno");

    await walked.getByRole("button", { name: "Continue" }).click();
    expect(await currentScreen(page)).toBe("profile-setup");
    expect(await reported(page)).toContain('onstepchange("profile-setup")');

    // An empty profile is refused by the assembly, on its own step.
    await walked.getByRole("button", { name: "Save changes" }).click();
    expect(await currentScreen(page)).toBe("profile-setup");
    await expect(walked.getByText("Enter your name.")).toBeVisible();

    await walked.locator('input[name="fullName"]').fill("Ada Lovelace");
    await walked.locator('input[name="email"]').fill("ada@example.com");
    await walked.getByRole("button", { name: "Save changes" }).click();
    expect(await currentScreen(page)).toBe("plan-select");

    await walked.getByRole("button", { name: "Start free trial: Pro" }).click();
    expect(await currentScreen(page)).toBe("invite-team");

    // A bad address stays on the step and is named; good ones join the list.
    const emails = walked.locator('input[name="emails"]');
    await emails.fill("mara@example.com, not-an-address");
    await walked.getByRole("button", { name: "Send invites" }).click();
    await expect(walked.getByText("not-an-address is not an email address.")).toBeVisible();

    await emails.fill("mara@example.com, ben@example.com");
    await walked.getByRole("button", { name: "Send invites" }).click();
    await expect(emails).toHaveValue("");
    await expect(walked.getByText("mara@example.com")).toBeVisible();
    await expect(walked.getByText("ben@example.com")).toBeVisible();

    await walked.getByRole("button", { name: "Remove ben" }).click();
    await expect(walked.getByText("ben@example.com")).toHaveCount(0);

    await walked.getByRole("button", { name: "Continue" }).click();
    expect(await currentScreen(page)).toBe("welcome");
    expect(await reported(page)).toContain(
      'oncomplete({"name":"Ada Lovelace","plan":"pro","invites":["mara@example.com"]})',
    );

    // The name the profile saved is carried back to the greeting.
    await expect(walked.getByRole("heading", { level: 1 })).toHaveText("Welcome, Ada");
  });

  test("routes Skip for now one step on, as a link", async ({ page }) => {
    const walked = await openDesktop(page);
    await walked.getByRole("button", { name: "Continue" }).click();
    expect(await currentScreen(page)).toBe("profile-setup");

    const skip = walked.getByRole("link", { name: "Skip for now" });
    await expect(skip).toHaveAttribute("href", "#plan-select");
    const before = page.url();
    await skip.click();
    expect(await currentScreen(page)).toBe("plan-select");
    expect(page.url()).toBe(before);
  });

  test("leaves the flow from welcome's Skip for now", async ({ page }) => {
    const walked = await openDesktop(page);
    await walked.getByRole("button", { name: "Skip for now" }).click();
    expect(await currentScreen(page)).toBe("welcome");
    expect(await reported(page)).toContain('oncomplete({"name":"","invites":[]})');
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
            `${width}px: a copy below @sm`,
          ).toBe(true);
          expect(
            widths.some((w) => w >= CONTAINER_MD),
            `${width}px: a copy at @md`,
          ).toBe(true);

          for (const [index, metrics] of mounted.entries()) {
            const where = `${scheme} ${width}px, ${TABS[index]} (${metrics.containerWidth}px)`;
            expect(metrics.mastheadDisplay, `${where}: masthead`).toBe(
              metrics.containerWidth >= CONTAINER_SM ? "flex" : "grid",
            );
            expect(metrics.footerDisplay, `${where}: footer`).toBe(
              metrics.containerWidth >= CONTAINER_MD ? "flex" : "grid",
            );
            expect(metrics.rootHeight, `${where}: root height`).toBeGreaterThanOrEqual(
              metrics.frameHeight,
            );
          }
        });
      }
    });
  }

  test("opens part-way through and greets a known reader", async ({ page }) => {
    await page.goto(PAGE, { waitUntil: "networkidle" });
    const partWay = page.locator(".preview-panel--demo").nth(1);
    await partWay.scrollIntoViewIfNeeded();
    await expect(
      partWay.locator(".moderno-flow-onboarding .moderno-screen-plan-select"),
    ).toHaveCount(1);
    const greeted = page.locator(".preview-panel--demo").nth(2);
    await greeted.scrollIntoViewIfNeeded();
    await expect(greeted.locator(".moderno-flow-onboarding h1")).toHaveText("Welcome, Ada");
  });
});
