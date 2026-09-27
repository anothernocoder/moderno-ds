/**
 * The share-invite block, checked on the built docs page at the three widths
 * of the responsive policy (375 / 768 / 1280) in both colour schemes. It
 * asserts text and computed styles, never pixels (see `playwright.config.ts`).
 *
 * Five claims:
 *
 * 1. **Container, not viewport**: below `--container-sm` everything stacks
 *    and the channels sit two a row; from `--container-sm` each field sits
 *    beside its button and the channels line up four a row; from
 *    `--container-md` the people split into two columns; from
 *    `--container-lg` the invite and the link become two panes (the people
 *    back to one column and the channels two a row inside their pane). Each
 *    copy is measured against its own container width, so the narrow frame
 *    keeps its stacked layout at 1280 while the wide one shows two panes.
 * 2. **Every state renders what it claims**: the people, the link and the
 *    channels by default; "Only you have access" when there is nobody;
 *    placeholders in a busy region while loading; one alert with a retry
 *    when the load failed; every control off but the text readable when
 *    disabled. Every copy is centred in its box.
 * 3. **Toast feedback**: copying the link, sharing to a channel and inviting
 *    each end in a success toast, and in an error toast when they fail; an
 *    invalid or known address shows an inline error and no toast.
 * 4. **Hover and focus-visible** on the copy button and the invite field.
 * 5. **AA contrast** on every text the block paints, per scheme.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/share-invite/";
const BLOCK = "section.moderno-block-share-invite";
const TOAST_TITLE = '[data-scope="toast"][data-part="title"]';

const STATES = [
  "default",
  "narrow",
  "compact",
  "panel",
  "wide",
  "invite-fails",
  "empty",
  "loading",
  "error",
  "disabled",
] as const;
type State = (typeof STATES)[number];

/** Copies that render the full settings (not loading, not failed). */
const SETTINGS: State[] = [
  "default",
  "narrow",
  "compact",
  "panel",
  "wide",
  "invite-fails",
  "empty",
  "disabled",
];

interface BlockMetrics {
  /** Width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** The card's title text. */
  title: string;
  /** Number of grid columns of the panes wrapper, the invite form and its row display. */
  paneColumns: number | null;
  inviteDisplay: string | null;
  linkDisplay: string | null;
  /** Grid columns of the people list and of the channel group. */
  peopleColumns: number | null;
  channelColumns: number | null;
  /** The people's names and roles, the link's value and the channel labels. */
  people: string[];
  roles: string[];
  link: string | null;
  channels: string[];
  /** Whether every button and the invite field are off, and the link still readable. */
  allControlsInert: boolean;
  anyControlInert: boolean;
  /** Placeholders inside a busy `status` region. */
  busyPlaceholders: number;
  /** Whether this copy renders the empty message, and the failed-load alert with its retry. */
  emptyMessage: boolean;
  failedLoad: boolean;
  /** Distance between the block's centre and its box's centre; `null` when it scrolls. */
  offCentre: number | null;
}

function blockIn(page: Page, state: State) {
  return page.locator(`[data-demo-state="${state}"] ${BLOCK}`);
}

async function showState(page: Page, state: State): Promise<void> {
  const block = blockIn(page, state);
  await block.scrollIntoViewIfNeeded();
  await block.waitFor({ state: "visible" });
}

async function blockMetrics(page: Page, state: State): Promise<BlockMetrics[]> {
  return page.evaluate(
    ({ state, BLOCK }) => {
      const wrapper = document.querySelector(`[data-demo-state="${state}"]`);
      if (!wrapper) throw new Error(`no preview for the ${state} state on the page`);
      const text = (el: Element | null | undefined) =>
        el?.textContent?.replace(/\s+/g, " ").trim() ?? "";
      const columns = (el: Element | null) =>
        el ? getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean).length : null;

      return [...wrapper.querySelectorAll<HTMLElement>(BLOCK)].map((section) => {
        const content = section.querySelector('[data-scope="card"][data-part="content"]');
        const title = section.querySelector('[data-scope="card"][data-part="title"]');
        if (!content || !title) throw new Error("the share-invite block did not render its markup");

        const panes = content.firstElementChild;
        const form = content.querySelector("form");
        const email = content.querySelector<HTMLInputElement>('input[name="email"]');
        const linkInput = content.querySelector<HTMLInputElement>("input[readonly]");
        const linkRow =
          linkInput?.closest('[data-scope="field"][data-part="root"]')?.parentElement ?? null;
        const people = content.querySelector('ul[aria-label="People with access"]');
        const group = content.querySelector('[role="group"][aria-label="Share to"]');
        const busy = content.querySelector('[role="status"][aria-busy="true"]');
        const alert = content.querySelector('[data-scope="alert"][data-part="root"]');
        const buttons = [...section.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];
        const inert = [
          ...buttons.map((button) => button.disabled),
          ...(email ? [email.disabled] : []),
        ];

        const box = section.closest(".demo-viewport") ?? section.closest(".preview-panel--demo");
        const scrolls = section.closest(".demo-scroll") !== null;
        let offCentre: number | null = null;
        if (box && !scrolls) {
          const style = getComputedStyle(box);
          const rect = box.getBoundingClientRect();
          const left =
            rect.left + parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft);
          const inner =
            box.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
          const own = section.getBoundingClientRect();
          offCentre = Math.abs(left + inner / 2 - (own.left + own.width / 2));
        }

        return {
          containerWidth: section.getBoundingClientRect().width,
          title: text(title),
          paneColumns: busy || alert ? null : columns(panes),
          inviteDisplay: form ? getComputedStyle(form).display : null,
          linkDisplay: linkRow ? getComputedStyle(linkRow).display : null,
          peopleColumns: columns(people),
          channelColumns: columns(group),
          people: people ? [...people.querySelectorAll("li p:first-child")].map(text) : [],
          roles: people ? [...people.querySelectorAll('[data-scope="badge"]')].map(text) : [],
          link: linkInput?.value ?? null,
          channels: group ? [...group.querySelectorAll('[data-scope="button"]')].map(text) : [],
          allControlsInert:
            inert.length > 0 && inert.every(Boolean) && linkInput?.disabled !== true,
          anyControlInert: inert.some(Boolean),
          busyPlaceholders: busy ? busy.querySelectorAll('[data-scope="skeleton"]').length : 0,
          emptyMessage: !people && text(content).includes("Only you have access"),
          failedLoad:
            alert?.getAttribute("data-variant") === "error" &&
            text(alert.querySelector('[data-scope="button"]')) === "Try again",
          offCentre,
        };
      });
    },
    { state, BLOCK },
  );
}

async function textRatios(
  page: Page,
  state: "default" | "empty" | "error",
): Promise<Record<string, number>> {
  return page.evaluate(
    ({ state, BLOCK }) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("no 2d context");

      // Colours are resolved through a canvas: the contract's values are OKLCH,
      // and the browser is the only thing that converts them the way it painted.
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

      const block = document.querySelector(`[data-demo-state="${state}"] ${BLOCK}`);
      if (!block) throw new Error(`the ${state} share-invite demo did not render`);

      const pick = (selector: string): Element => {
        const el = block.querySelector(selector);
        if (!el) throw new Error(`${state}: missing ${selector}`);
        return el;
      };
      const against = (el: Element) => ratio(getComputedStyle(el).color, surfaceOf(el));

      const ratios: Record<string, number> = {
        [`${state} title`]: against(pick('[data-scope="card"][data-part="title"]')),
        [`${state} description`]: against(pick('[data-scope="card"][data-part="description"]')),
      };
      if (state === "error") {
        ratios["error alert title"] = against(pick('[data-scope="alert"][data-part="title"]'));
        ratios["error alert description"] = against(
          pick('[data-scope="alert"][data-part="description"]'),
        );
        ratios["error Try again button"] = against(
          pick('[data-scope="alert"] [data-scope="button"]'),
        );
        return ratios;
      }
      const [inviteHeading, linkHeading] = [...block.querySelectorAll("h4")];
      if (!inviteHeading || !linkHeading) throw new Error(`${state}: missing its pane headings`);
      ratios[`${state} invite heading`] = against(inviteHeading);
      ratios[`${state} link heading`] = against(linkHeading);
      ratios[`${state} Invite button`] = against(pick('form [data-scope="button"]'));
      ratios[`${state} link`] = against(pick("input[readonly]"));
      const copy = [...block.querySelectorAll('[data-scope="button"]')].find(
        (button) => button.textContent?.trim() === "Copy link",
      );
      if (!copy) throw new Error(`${state}: missing Copy link`);
      ratios[`${state} Copy link button`] = against(copy);
      ratios[`${state} channel`] = against(pick('[role="group"] [data-scope="button"]'));
      const labels = [...block.querySelectorAll("p.text-muted-foreground, p.font-medium")];
      labels.forEach((label, i) => {
        ratios[`${state} label ${i} (${label.textContent?.trim()})`] = against(label);
      });
      if (state === "default") {
        ratios["default role"] = against(pick('[data-scope="badge"]'));
        ratios["default initials"] = against(pick('[data-scope="avatar"][data-part="fallback"]'));
      }
      return ratios;
    },
    { state, BLOCK },
  );
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`share-invite — ${scheme}`, () => {
    test.use({ colorScheme: scheme });

    for (const width of WIDTHS) {
      test(`lays itself out from its container at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1200 });
        await page.goto(PAGE, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready.then(() => true));

        expect(await page.evaluate(() => document.documentElement.classList.contains("dark"))).toBe(
          scheme === "dark",
        );

        const blocks: (BlockMetrics & { state: State })[] = [];
        for (const state of STATES) {
          await showState(page, state);
          const mounted = await blockMetrics(page, state);
          expect(mounted, `${state}: mounted copies`).toHaveLength(1);
          const block = mounted[0]!;
          blocks.push({ ...block, state });
          const where = `${scheme} ${width}px, ${state} (${block.containerWidth}px)`;
          const sm = block.containerWidth >= CONTAINER_SM;
          const md = block.containerWidth >= CONTAINER_MD;
          const lg = block.containerWidth >= CONTAINER_LG;

          expect(block.title, `${where}: title`).toBe("Share this project");
          if (block.offCentre !== null) {
            expect(block.offCentre, `${where}: centred`).toBeLessThan(1);
          }

          if (SETTINGS.includes(state)) {
            expect(block.paneColumns, `${where}: panes`).toBe(lg ? 2 : 1);
            expect(block.inviteDisplay, `${where}: invite field beside its button`).toBe(
              sm ? "flex" : "grid",
            );
            expect(block.linkDisplay, `${where}: link beside its button`).toBe(
              sm ? "flex" : "grid",
            );
            expect(block.channelColumns, `${where}: channels a row`).toBe(sm && !lg ? 4 : 2);
            expect(block.link, `${where}: link`).toBe("https://example.com/share/q3-planning");
            expect(block.channels, `${where}: channels`).toEqual([
              "Email",
              "Slack",
              "LinkedIn",
              "X",
            ]);
            if (state !== "empty") {
              expect(block.peopleColumns, `${where}: people columns`).toBe(md && !lg ? 2 : 1);
              expect(block.people, `${where}: people`).toEqual([
                "Ana Ruiz",
                "Leo Park",
                "Mia Chen",
              ]);
              expect(block.roles, `${where}: roles`).toEqual(["Owner", "Can edit", "Can view"]);
            }
          }

          const panel = await page.evaluate((state) => {
            const el = document
              .querySelector(`[data-demo-state="${state}"]`)!
              .closest(".preview-panel--demo") as HTMLElement;
            return { scroll: el.scrollWidth, client: el.clientWidth };
          }, state);
          expect(panel.scroll, `${where}: demo panel overflow`).toBeLessThanOrEqual(panel.client);
        }

        const byState = (state: State) => blocks.find((block) => block.state === state)!;
        expect(byState("empty").emptyMessage, "the empty render").toBe(true);
        expect(byState("empty").peopleColumns, "no list when empty").toBeNull();
        expect(
          byState("loading").busyPlaceholders,
          "the loading render: field, people and link placeholders",
        ).toBe(13);
        expect(byState("error").failedLoad, "the failed-load render").toBe(true);
        expect(byState("disabled").allControlsInert, "the disabled render").toBe(true);
        expect(byState("default").anyControlInert, "the default render").toBe(false);

        // Each step is exercised on both sides at every viewport.
        const widths = blocks
          .filter((block) => SETTINGS.includes(block.state))
          .map((block) => block.containerWidth);
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

    test("checks the address before it invites, then reports the invite in a toast", async ({
      page,
    }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = blockIn(page, "default");
      const field = block.getByRole("textbox", { name: "Email address to invite" });
      const invite = block.getByRole("button", { name: "Invite" });

      await invite.click();
      await expect(block.getByText("Enter a valid email address.")).toBeVisible();
      await expect(field).toHaveAttribute("aria-invalid", "true");

      await field.fill("leo.park@example.com");
      await expect(field).not.toHaveAttribute("aria-invalid", "true");
      await invite.click();
      await expect(block.getByText("leo.park@example.com already has access.")).toBeVisible();
      await expect(page.locator(TOAST_TITLE)).toHaveCount(0);

      await field.fill("sam@acme.io");
      await invite.click();
      const sending = block.getByRole("button", { name: "Sending" });
      await expect(sending).toBeDisabled();
      await expect(sending).toHaveAttribute("aria-busy", "true");
      await expect(field).toBeDisabled();

      const toast = page.locator('[data-scope="toast"][data-part="root"]', {
        hasText: "Invite sent",
      });
      await expect(toast).toBeVisible();
      await expect(toast).toHaveAttribute("data-type", "success");
      await expect(toast).toContainText("sam@acme.io will get an email to join.");
      await expect(field).toHaveValue("");
      await expect(invite).toBeEnabled();
    });

    test("reports a failed invite in an error toast", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "invite-fails");
      const block = blockIn(page, "invite-fails");
      const field = block.getByRole("textbox", { name: "Email address to invite" });
      await field.fill("sam@acme.io");
      await block.getByRole("button", { name: "Invite" }).click();

      const toast = page.locator('[data-scope="toast"][data-part="root"]', {
        hasText: "Invite not sent",
      });
      await expect(toast).toBeVisible();
      await expect(toast).toHaveAttribute("data-type", "error");
      // The address stays in the field so the user can try again.
      await expect(field).toHaveValue("sam@acme.io");
    });

    test("copies the link and shares to a channel, with a toast for each", async ({
      page,
      context,
      baseURL,
    }) => {
      await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: baseURL });
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = blockIn(page, "default");

      await block.getByRole("button", { name: "Copy link" }).click();
      const copied = page.locator('[data-scope="toast"][data-part="root"]', {
        hasText: "Link copied",
      });
      await expect(copied).toBeVisible();
      await expect(copied).toHaveAttribute("data-type", "success");
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
        "https://example.com/share/q3-planning",
      );

      await block
        .getByRole("group", { name: "Share to" })
        .getByRole("button", { name: "Slack" })
        .click();
      const shared = page.locator('[data-scope="toast"][data-part="root"]', {
        hasText: "Shared to Slack",
      });
      await expect(shared).toBeVisible();
      await expect(shared).toHaveAttribute("data-type", "success");

      // A browser that refuses the clipboard gets an error toast, not silence.
      await page.evaluate(() => {
        navigator.clipboard.writeText = () => Promise.reject(new Error("denied"));
      });
      await block.getByRole("button", { name: "Copy link" }).click();
      const refused = page.locator('[data-scope="toast"][data-part="root"]', {
        hasText: "Could not copy the link",
      });
      await expect(refused).toBeVisible();
      await expect(refused).toHaveAttribute("data-type", "error");
      await expect(refused).toContainText("Select the link and copy it by hand.");
    });

    test("pins its toasts to the viewport, outside its container", async ({
      page,
      context,
      baseURL,
    }) => {
      await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: baseURL });
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      await blockIn(page, "default").getByRole("button", { name: "Copy link" }).click();
      const toast = page.locator('[data-scope="toast"][data-part="root"]', {
        hasText: "Link copied",
      });
      await expect(toast).toBeVisible();
      const placement = await toast.evaluate((el) => {
        const group = el.closest('[data-scope="toast"][data-part="group"]')!;
        const box = el.getBoundingClientRect();
        return {
          insideBlock: group.closest("section") !== null,
          position: getComputedStyle(group).position,
          bottomGap: window.innerHeight - box.bottom,
        };
      });
      expect(placement.insideBlock, `${scheme}: toaster outside the @container`).toBe(false);
      expect(placement.position, `${scheme}: toaster pinned`).toBe("fixed");
      expect(
        placement.bottomGap,
        `${scheme}: at the bottom of the viewport`,
      ).toBeGreaterThanOrEqual(0);
      expect(placement.bottomGap, `${scheme}: at the bottom of the viewport`).toBeLessThan(64);
    });

    test("shows hover and focus-visible on its controls", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = blockIn(page, "default");

      const copy = block.getByRole("button", { name: "Copy link" });
      const fill = () =>
        copy.evaluate((el) => {
          const canvas = document.createElement("canvas").getContext("2d")!;
          canvas.fillStyle = getComputedStyle(el).backgroundColor;
          canvas.fillRect(0, 0, 1, 1);
          return [...canvas.getImageData(0, 0, 1, 1).data].join(",");
        });

      await page.mouse.move(0, 0);
      const resting = await fill();
      await copy.hover();
      await expect.poll(fill, { message: `${scheme}: hover fill` }).not.toBe(resting);

      // Keyboard focus draws a ring on the button and on the invite field.
      await page.mouse.move(0, 0);
      await copy.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      await expect(copy).toBeFocused();
      const ring = await copy.evaluate((el) => ({
        focused: el.matches(":focus-visible"),
        style: getComputedStyle(el).outlineStyle,
      }));
      expect(ring.focused, `${scheme}: keyboard focus`).toBe(true);
      expect(ring.style, `${scheme}: focus ring`).not.toBe("none");

      const field = block.getByRole("textbox", { name: "Email address to invite" });
      const outline = () => field.evaluate((el) => getComputedStyle(el).outlineStyle);
      expect(await outline(), `${scheme}: field at rest`).toBe("none");
      await block.getByRole("button", { name: "Invite" }).focus();
      await page.keyboard.press("Shift+Tab");
      await expect(field).toBeFocused();
      const fieldRing = await field.evaluate((el) => ({
        focused: el.matches(":focus-visible"),
        style: getComputedStyle(el).outlineStyle,
      }));
      expect(fieldRing.focused, `${scheme}: field keyboard focus`).toBe(true);
      expect(fieldRing.style, `${scheme}: field focus ring`).not.toBe("none");
    });

    test("announces the loading settings and the failed load, and retries", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const region = page.locator(`[data-demo-state="loading"] ${BLOCK} [role="status"]`);
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region).toContainText("Loading sharing settings");

      await showState(page, "error");
      const block = blockIn(page, "error");
      const alert = block.locator('[role="alert"]');
      await expect(alert).toContainText("We could not load the sharing settings.");

      // The demo's retry clears its message to "", which counts as no error.
      await alert.getByRole("button", { name: "Try again" }).click();
      await expect(alert).toHaveCount(0);
      await expect(block.getByRole("list", { name: "People with access" })).toBeVisible();
      await expect(block.getByRole("button", { name: "Copy link" })).toBeEnabled();
    });

    test("clears AA contrast on every text it paints", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      let ratios: Record<string, number> = {};
      for (const state of ["default", "empty", "error"] as const) {
        await showState(page, state);
        ratios = { ...ratios, ...(await textRatios(page, state)) };
      }
      for (const label of [
        "default title",
        "default role",
        "default link",
        "default channel",
        "error alert title",
      ]) {
        expect(Object.keys(ratios), `${scheme}: ${label} measured`).toContain(label);
      }
      expect(
        Object.keys(ratios).some((key) => key.includes("Only you have access")),
        `${scheme}: empty message measured`,
      ).toBe(true);
      for (const [what, ratio] of Object.entries(ratios)) {
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
      }
    });
  });
}
