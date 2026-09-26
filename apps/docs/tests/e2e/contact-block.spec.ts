/**
 * The contact block, checked on the built docs page at the three widths of the
 * responsive policy (375 / 768 / 1280) in both colour schemes. It asserts text
 * and computed styles; no screenshot baseline is committed.
 *
 * Four claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` everything stacks and
 *    the send button fills its row; from `--container-sm` the reply note sits
 *    beside the button; at `--container-md` the heading steps up a size and
 *    name and email pair off; at `--container-lg` the channels move beside the
 *    form and the section gets more room above and below. Each copy on the
 *    page is measured against its own container width, so the narrow frame
 *    stays stacked at 1280 while the wide frame has crossed every step.
 * 2. **Every state renders what it claims**, at every width: heading,
 *    introduction, three channels and a live form by default; the form alone
 *    when there are no channels; disabled fields and a busy "Sending" while
 *    loading; an error Alert and an invalid field on error; disabled fields and
 *    button, with live channel links, when disabled; and "Message sent" in
 *    place of the form once sent. Every copy is centred in its box.
 * 3. **AA contrast** in both schemes on every text the block paints, and 3:1 on
 *    each channel icon against its surface.
 * 4. **Hover and focus-visible** on a channel link, a field and the send
 *    button, and no focus at all on a disabled field or button.
 *
 * It also checks the two demo round trips: sending from the default copy shows
 * the sent state, and sending again from the error copy clears the messages —
 * an empty `error` string counts as no error.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/contact/";

const BLOCK = "section.moderno-block-contact";

/** The copy the block ships with. */
const HEADING = "Get in touch";
const LABELS = ["Email", "Phone", "Office"];
const VALUES = ["hello@example.com", "+1 (555) 010-2030", "100 Market Street, San Francisco"];
const HREFS = ["mailto:hello@example.com", "tel:+15550102030", null];
const FIELDS = ["name", "email", "message"];
const FIELD_LABELS = ["Name", "Email", "Message"];
const NOTE = "We reply within one business day.";
const SEND = "Send message";
const SENDING = "Sending";
const SENT = "Message sent";
/** The demo's own messages (islands/ContactBlockDemo.svelte). */
const ERROR = "We could not send your message.";
const EMAIL_ERROR = "Enter an email address like you@example.com.";

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** The heading's text, font size in px, and whether it reads `--font-serif`. */
  heading: string | null;
  headingSize: number | null;
  serifHeading: boolean | null;
  /** Each channel's label, value, link target (null for plain text) and icon count. */
  labels: string[];
  values: string[];
  hrefs: Array<string | null>;
  icons: number;
  /** Columns of the channels-and-form wrapper: 2 once the channels sit beside the form. */
  bodyColumns: number;
  /** Columns of the name-and-email row: 2 once they pair off. */
  fieldColumns: number | null;
  /** The actions row's display: `grid` while stacked, `flex` once the note sits beside the button. */
  actionsDisplay: string | null;
  /** Whether the send button fills its row. */
  buttonFillsRow: boolean | null;
  /** The form's field names and labels, in order. */
  fields: string[];
  fieldLabels: string[];
  /** Fields that are disabled / invalid, by name. */
  disabledFields: string[];
  invalidFields: string[];
  /** The field error messages shown. */
  fieldErrors: string[];
  /** The reply note under the form. */
  note: string | null;
  /** The send button's label, whether it is disabled and whether it is busy. */
  button: string | null;
  buttonDisabled: boolean | null;
  buttonBusy: boolean;
  /** Every Alert: its role and its title. */
  alerts: Array<{ role: string | null; title: string }>;
  /** The block's padding above its content, in px. */
  paddingTop: number;
  /** Horizontal offset between the heading block's centre and the block's, in px. */
  offCentre: number;
}

/**
 * The page's previews (islands/ContactBlockDemo.svelte): the main preview
 * mounts the default; the Examples frame the same block at 18rem, 30rem, 40rem
 * and 50rem, then mount the empty, loading, error, disabled and sent states.
 * Every copy is found by the `data-demo-state` its wrapper carries.
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
  "sent",
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
      const columns = (el: Element) =>
        getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean).length;

      return [...wrapper.querySelectorAll<HTMLElement>(selector)].map((section) => {
        const inner = section.firstElementChild as HTMLElement | null;
        const intro = inner?.firstElementChild as HTMLElement | null;
        const body = inner?.children[1] as HTMLElement | undefined;
        if (!inner || !intro || !body) {
          throw new Error("the contact block did not render its own markup");
        }

        const heading = section.querySelector("h2");
        const channels = [...section.querySelectorAll<HTMLElement>("ul > li")];
        const form = section.querySelector("form");
        const controls = form
          ? [
              ...form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
                '[data-scope="field"][data-part="input"], [data-scope="field"][data-part="textarea"]',
              ),
            ]
          : [];
        const button = form?.querySelector<HTMLButtonElement>('button[type="submit"]') ?? null;
        const actions = button?.parentElement ?? null;
        const pair = form?.querySelector('[data-scope="field"][data-part="root"]')?.parentElement;
        const blockBox = section.getBoundingClientRect();
        const introBox = intro.getBoundingClientRect();

        return {
          containerWidth: section.offsetWidth,
          heading: heading ? text(heading) : null,
          headingSize: heading ? parseFloat(getComputedStyle(heading).fontSize) : null,
          serifHeading: heading ? normalise(getComputedStyle(heading).fontFamily) === serif : null,
          labels: channels.map((li) => text(li.querySelector("div > p:first-child"))),
          values: channels.map((li) => text(li.querySelector("div > :last-child"))),
          hrefs: channels.map((li) => li.querySelector("a")?.getAttribute("href") ?? null),
          icons: channels.filter((li) => li.querySelector('span > svg[aria-hidden="true"] path'))
            .length,
          bodyColumns: columns(body),
          fieldColumns: pair ? columns(pair) : null,
          actionsDisplay: actions ? getComputedStyle(actions).display : null,
          buttonFillsRow:
            button && actions ? Math.abs(button.offsetWidth - actions.clientWidth) < 1 : null,
          fields: controls.map((control) => control.name),
          fieldLabels: form
            ? [...form.querySelectorAll('[data-scope="field"][data-part="label"]')].map((label) =>
                // The required marker is the label's own decoration, not its text.
                text(label).replace(/\s*\*$/, ""),
              )
            : [],
          disabledFields: controls.filter((c) => c.disabled).map((c) => c.name),
          invalidFields: controls
            .filter((c) => c.getAttribute("aria-invalid") === "true")
            .map((c) => c.name),
          fieldErrors: form
            ? [...form.querySelectorAll('[data-scope="field"][data-part="error-text"]')]
                .map((el) => text(el))
                .filter(Boolean)
            : [],
          note: actions ? text(actions.querySelector("p")) : null,
          button: button ? text(button) : null,
          buttonDisabled: button ? button.disabled : null,
          buttonBusy: button?.getAttribute("aria-busy") === "true",
          alerts: [...section.querySelectorAll('[data-scope="alert"][data-part="root"]')].map(
            (alert) => ({
              role: alert.getAttribute("role"),
              title: text(alert.querySelector('[data-part="title"]')),
            }),
          ),
          paddingTop: parseFloat(getComputedStyle(inner).paddingTop),
          offCentre: Math.abs(
            introBox.left + introBox.width / 2 - (blockBox.left + blockBox.width / 2),
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
  state: "default" | "error" | "sent",
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
      const form = block.querySelector("form");
      const parts: Array<[string, Element | null | undefined]> = [
        ["heading", block.querySelector("h2")],
        ["description", block.querySelector("h2 + p")],
        ["note", form?.querySelector('button[type="submit"]')?.parentElement?.querySelector("p")],
        ["send button", form?.querySelector('button[type="submit"]')],
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
        const label = item.querySelector("div > p:first-child")!;
        const name = label.textContent?.trim() ?? "channel";
        ratios[`${state} ${name} label`] = against(label);
        ratios[`${state} ${name} value`] = against(item.querySelector("div > :last-child")!);
        // Non-text contrast (WCAG 1.4.11): the icon's stroke against its surface.
        ratios[`${state} ${name} icon`] = against(item.querySelector("svg")!);
      }
      for (const label of form?.querySelectorAll('[data-scope="field"][data-part="label"]') ?? []) {
        ratios[`${state} ${label.textContent?.trim().replace(/\s*\*$/, "")} field label`] =
          against(label);
      }
      for (const error of form?.querySelectorAll('[data-scope="field"][data-part="error-text"]') ??
        []) {
        if (error.textContent?.trim()) ratios[`${state} field error`] = against(error);
      }
      return ratios;
    },
    { state, selector: BLOCK },
  );
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`contact — ${scheme}`, () => {
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
          const hasChannels = state !== "empty";
          const hasForm = state !== "sent";

          expect(block.heading, `${where}: heading`).toBe(HEADING);
          expect(block.serifHeading, `${where}: serif heading`).toBe(true);
          expect(block.paddingTop, `${where}: room above`).toBe(
            block.containerWidth >= CONTAINER_LG ? 64 : 48,
          );
          expect(block.bodyColumns, `${where}: channels beside the form`).toBe(
            hasChannels && block.containerWidth >= CONTAINER_LG ? 2 : 1,
          );
          expect(block.offCentre, `${where}: centred`).toBeLessThan(1);

          if (hasChannels) {
            expect(block.labels, `${where}: channel labels`).toEqual(LABELS);
            expect(block.values, `${where}: channel values`).toEqual(VALUES);
            expect(block.hrefs, `${where}: channel links`).toEqual(HREFS);
            expect(block.icons, `${where}: one hidden icon per channel`).toBe(LABELS.length);
          } else {
            expect(block.labels, `${where}: no channels`).toEqual([]);
          }

          if (!hasForm) {
            expect(block.fields, `${where}: no form once sent`).toEqual([]);
            expect(block.alerts, `${where}: sent alert`).toEqual([{ role: "status", title: SENT }]);
            continue;
          }

          expect(block.fields, `${where}: fields`).toEqual(FIELDS);
          expect(block.fieldLabels, `${where}: field labels`).toEqual(FIELD_LABELS);
          expect(block.note, `${where}: reply note`).toBe(NOTE);
          expect(block.fieldColumns, `${where}: name and email side by side`).toBe(
            block.containerWidth >= CONTAINER_MD ? 2 : 1,
          );
          expect(block.actionsDisplay, `${where}: note beside the button`).toBe(
            block.containerWidth >= CONTAINER_SM ? "flex" : "grid",
          );
          expect(block.buttonFillsRow, `${where}: full-width button`).toBe(
            block.containerWidth < CONTAINER_SM,
          );

          const inert = state === "loading" || state === "disabled";
          expect(block.disabledFields, `${where}: disabled fields`).toEqual(inert ? FIELDS : []);
          expect(block.buttonDisabled, `${where}: disabled button`).toBe(inert);
          expect(block.buttonBusy, `${where}: busy button`).toBe(state === "loading");
          expect(block.button, `${where}: button label`).toBe(state === "loading" ? SENDING : SEND);

          if (state === "error") {
            expect(block.alerts, `${where}: error alert`).toEqual([
              { role: "alert", title: ERROR },
            ]);
            expect(block.invalidFields, `${where}: invalid field`).toEqual(["email"]);
            expect(block.fieldErrors, `${where}: field error`).toEqual([EMAIL_ERROR]);
          } else {
            expect(block.alerts, `${where}: no alert`).toEqual([]);
            expect(block.invalidFields, `${where}: no invalid field`).toEqual([]);
            expect(block.fieldErrors, `${where}: no field error`).toEqual([]);
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
      for (const state of ["default", "empty", "loading", "error", "disabled", "sent"] as const) {
        await showState(page, state);
        const gaps = await page.evaluate(
          ({ state, selector }) => {
            const wrapper = document.querySelector(`[data-demo-state="${state}"]`)!;
            const panel = wrapper.closest(".preview-panel--demo")!.getBoundingClientRect();
            const block = wrapper.querySelector(selector)!;
            const content = [...block.firstElementChild!.children].map((el) =>
              el.getBoundingClientRect(),
            );
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
        ...(await contrastRatios(page, "error")),
        ...(await contrastRatios(page, "sent")),
      };
      for (const label of [
        "default heading",
        "default description",
        ...LABELS.flatMap((name) => [
          `default ${name} label`,
          `default ${name} value`,
          `default ${name} icon`,
        ]),
        ...FIELD_LABELS.map((name) => `default ${name} field label`),
        "default note",
        "default send button",
        "error alert title",
        "error alert description",
        "error field error",
        "sent alert title",
        "sent alert description",
      ]) {
        expect(Object.keys(ratios), `${scheme}: ${label} measured`).toContain(label);
      }
      for (const [what, ratio] of Object.entries(ratios)) {
        const floor = what.endsWith(" icon") ? 3 : 4.5;
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(floor);
      }
    });

    test("shows hover and focus-visible on a channel link", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const link = page
        .locator(`[data-demo-state="default"] ${BLOCK}`)
        .getByRole("link", { name: VALUES[0] });
      await expect(link).toHaveAttribute("href", HREFS[0]!);

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

    test("shows focus-visible on a field and the send button", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);

      const ring = (selector: string) =>
        block.locator(selector).evaluate((el) => ({
          focused: el.matches(":focus-visible"),
          style: getComputedStyle(el).outlineStyle,
        }));

      await block.locator('input[name="name"]').focus();
      expect(await ring('input[name="name"]'), `${scheme}: field ring`).toEqual({
        focused: true,
        style: "solid",
      });

      await block.locator('textarea[name="message"]').focus();
      await page.keyboard.press("Tab");
      const button = await ring('button[type="submit"]');
      expect(button.focused, `${scheme}: button keyboard focus`).toBe(true);
      expect(button.style, `${scheme}: button ring`).not.toBe("none");
    });

    test("keeps disabled fields and button out of reach", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "disabled");
      const block = page.locator(`[data-demo-state="disabled"] ${BLOCK}`);

      for (const name of FIELDS) {
        const control = block.locator(`[name="${name}"]`);
        await expect(control).toBeDisabled();
        await control.evaluate((el) => (el as HTMLElement).focus());
        await expect(control).not.toBeFocused();
      }
      const button = block.getByRole("button", { name: SEND });
      await expect(button).toBeDisabled();
      await button.evaluate((el) => (el as HTMLElement).focus());
      await expect(button).not.toBeFocused();

      // The channels are another way to reach the team, so they stay live.
      await expect(block.getByRole("link")).toHaveCount(2);
    });

    test("announces the busy send and the failed one as an alert", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const busy = page.locator(`[data-demo-state="loading"] ${BLOCK} button[type="submit"]`);
      await expect(busy).toHaveAttribute("aria-busy", "true");
      await expect(busy).toHaveText(SENDING);
      const spinnerHidden = await busy.evaluate(
        (el) => el.querySelector('[aria-hidden="true"]') !== null,
      );
      expect(spinnerHidden).toBe(true);

      await showState(page, "error");
      const block = page.locator(`[data-demo-state="error"] ${BLOCK}`);
      await expect(block.getByRole("alert")).toContainText(ERROR);
      await expect(block.getByRole("textbox", { name: /Email/ })).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    });

    test("sends from the default copy and clears the error by sending again", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });

      await showState(page, "error");
      const failed = page.locator(`[data-demo-state="error"] ${BLOCK}`);
      await failed.locator('textarea[name="message"]').fill("Hello there");
      // The demo clears its messages to "" and {}, the way a consumer holding
      // them as strings does once a send succeeds.
      await failed.getByRole("button", { name: SEND }).click();
      await expect(failed.locator('[data-scope="alert"]')).toHaveCount(0);
      await expect(failed.locator('[aria-invalid="true"]')).toHaveCount(0);
      // What the visitor typed is still there.
      await expect(failed.locator('textarea[name="message"]')).toHaveValue("Hello there");

      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      await block.getByRole("button", { name: SEND }).click();
      await expect(block.getByRole("status")).toContainText(SENT);
      await expect(block.locator("form")).toHaveCount(0);
      await expect(page).toHaveURL(new RegExp(`${PAGE}$`));
    });
  });
}
