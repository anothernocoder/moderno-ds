/**
 * The contact-modal block, checked on the built docs page at the three widths
 * of the responsive policy (375 / 768 / 1280) in both colour schemes. It
 * asserts text and computed styles; no screenshot baseline is committed.
 *
 * Six claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` the trigger fills its
 *    row; at `--container-sm` it takes its own width and the panel's padding
 *    grows; at `--container-md` the heading steps up a size; at
 *    `--container-lg` the text sits beside the trigger with more room above
 *    and below. Each copy on the page is measured against its own container
 *    width. The dialog is a container too: name and email sit side by side and
 *    its buttons sit in a row once its content box reaches `--container-sm`;
 *    below it they stack, send on top and full width.
 * 2. **Every state renders what it claims**, at every width: the same panel
 *    and trigger in every copy, disabled only in the disabled one; inside the
 *    dialog, the empty form, the busy one, the failed one and the sent one.
 * 3. **Centred** in every Preview.
 * 4. **AA contrast** in both schemes on every text the block paints, the
 *    dialog included.
 * 5. **Hover and focus-visible** on the trigger and on a field.
 * 6. **The dialog itself**: named by its title and described by its
 *    description; Cancel and Escape close it and hand focus back to the
 *    trigger; an empty form is refused (name and email invalid with their
 *    errors, focus on name); a filled one is sent, the sent message takes its
 *    place and focus lands on Close; the failed copy keeps what was typed and
 *    clears its error when sent again.
 */
import { expect, test, type Locator, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/contact-modal/";

const BLOCK = "section.moderno-block-contact-modal";

const HEADING = "Talk to our team";
const TRIGGER = "Contact sales";
const DIALOG = "Contact sales";
const DIALOG_DESCRIPTION = "Share a few details and we will reply within one business day.";
const FIELDS = ["name", "email", "company", "message"];
const FIELD_LABELS = ["Name", "Work email", "Company", "Message"];
const SEND = "Send message";
const SENDING = "Sending";
const SENT = "Message sent";
const ERROR = "We could not send your message.";

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  heading: string;
  /** Whether the heading resolves to the theme's display face. */
  serifHeading: boolean;
  /** The heading's font size, in px. */
  headingSize: number;
  trigger: string;
  triggerDisabled: boolean;
  /** Whether the trigger says it opens a dialog. */
  opensDialog: boolean;
  /** Whether the trigger spans the panel's content box. */
  triggerFillsRow: boolean;
  /** Whether the trigger sits on the text's line rather than below it. */
  triggerBesideText: boolean;
  /** The panel's inline padding, in px. */
  panelPadding: number;
  /** The room above the panel, in px. */
  paddingTop: number;
  /** How far the panel sits off the middle of the block, in px. */
  offCentre: number;
}

/**
 * The page's previews (islands/ContactModalBlockDemo.svelte): the main preview
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
      return [...wrapper.querySelectorAll<HTMLElement>(selector)].map((section) => {
        const heading = section.querySelector("h2");
        const text = heading?.parentElement;
        const panel = text?.parentElement;
        const trigger = section.querySelector<HTMLButtonElement>('[data-scope="button"]');
        if (!heading || !text || !panel || !trigger) {
          throw new Error("the contact-modal block did not render its own markup");
        }
        const panelStyle = getComputedStyle(panel);
        const contentBox =
          panel.clientWidth -
          parseFloat(panelStyle.paddingInlineStart) -
          parseFloat(panelStyle.paddingInlineEnd);
        const panelRect = panel.getBoundingClientRect();
        const sectionRect = section.getBoundingClientRect();
        return {
          containerWidth: section.offsetWidth,
          heading: heading.textContent?.trim() ?? "",
          serifHeading:
            getComputedStyle(heading).fontFamily ===
            getComputedStyle(document.documentElement).getPropertyValue("--font-serif").trim(),
          headingSize: parseFloat(getComputedStyle(heading).fontSize),
          trigger: trigger.textContent?.trim() ?? "",
          triggerDisabled: trigger.disabled,
          opensDialog: trigger.getAttribute("aria-haspopup") === "dialog",
          triggerFillsRow: Math.abs(trigger.getBoundingClientRect().width - contentBox) < 1,
          triggerBesideText:
            trigger.getBoundingClientRect().top < text.getBoundingClientRect().bottom,
          panelPadding: parseFloat(panelStyle.paddingInlineStart),
          paddingTop: parseFloat(getComputedStyle(panel.parentElement!).paddingTop),
          offCentre: Math.abs(
            panelRect.left - sectionRect.left - (sectionRect.right - panelRect.right),
          ),
        };
      });
    },
    { state, selector: BLOCK },
  );
}

/**
 * Contrast ratios of every text under `root`, read off the rendered page.
 * Colours are resolved through a canvas: the contract's values are OKLCH, and
 * the browser is the only thing that converts them exactly the way it painted
 * them.
 */
async function textRatios(
  root: Locator,
  targets: Record<string, string>,
): Promise<Record<string, number>> {
  return root.evaluate((element, targets) => {
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

    const ratios: Record<string, number> = {};
    for (const [name, css] of Object.entries(targets)) {
      const matches = [...element.querySelectorAll(css)];
      if (matches.length === 0) throw new Error(`missing ${css}`);
      for (const [index, el] of matches.entries()) {
        const label = el.textContent?.trim() || String(index);
        ratios[`${name} "${label}"`] = ratio(getComputedStyle(el).color, surfaceOf(el));
      }
    }
    return ratios;
  }, targets);
}

/** The trigger of the copy mounted for `state`. */
function trigger(page: Page, state: State): Locator {
  return page
    .locator(`[data-demo-state="${state}"] ${BLOCK}`)
    .getByRole("button", { name: TRIGGER, exact: true });
}

/** Open the dialog of the copy mounted for `state` and return it. */
async function openDialog(page: Page, state: State): Promise<Locator> {
  await showState(page, state);
  await trigger(page, state).click();
  const dialog = page.getByRole("dialog", { name: DIALOG });
  await expect(dialog).toBeVisible();
  return dialog;
}

interface DialogMetrics {
  fields: string[];
  labels: string[];
  disabledFields: string[];
  invalidFields: string[];
  fieldErrors: string[];
  alerts: Array<{ role: string | null; title: string }>;
  buttons: string[];
  submitBusy: boolean;
  submitDisabled: boolean;
}

async function dialogMetrics(dialog: Locator): Promise<DialogMetrics> {
  return dialog.evaluate((content) => {
    const inputs = [...content.querySelectorAll<HTMLInputElement>("input, textarea")];
    const submit = content.querySelector<HTMLButtonElement>('button[type="submit"]');
    return {
      fields: inputs.map((input) => input.name),
      labels: [...content.querySelectorAll('[data-scope="field"][data-part="label"]')].map(
        (label) => label.textContent?.replace("*", "").trim() ?? "",
      ),
      disabledFields: inputs.filter((input) => input.disabled).map((input) => input.name),
      invalidFields: inputs
        .filter((input) => input.getAttribute("aria-invalid") === "true")
        .map((input) => input.name),
      fieldErrors: [
        ...content.querySelectorAll<HTMLElement>('[data-scope="field"][data-part="error-text"]'),
      ]
        .filter((error) => error.checkVisibility())
        .map((error) => error.textContent?.trim() ?? ""),
      alerts: [...content.querySelectorAll('[data-scope="alert"][data-part="root"]')].map(
        (alert) => ({
          role: alert.getAttribute("role"),
          title:
            alert.querySelector('[data-scope="alert"][data-part="title"]')?.textContent?.trim() ??
            "",
        }),
      ),
      buttons: [...content.querySelectorAll('[data-scope="button"]')].map(
        (button) => button.textContent?.trim() ?? "",
      ),
      submitBusy: submit?.getAttribute("aria-busy") === "true",
      submitDisabled: submit?.disabled ?? false,
    };
  });
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`contact-modal — ${scheme}`, () => {
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
          const sm = block.containerWidth >= CONTAINER_SM;
          const lg = block.containerWidth >= CONTAINER_LG;

          expect(block.heading, `${where}: heading`).toBe(HEADING);
          expect(block.serifHeading, `${where}: serif heading`).toBe(true);
          expect(block.trigger, `${where}: trigger`).toBe(TRIGGER);
          expect(block.opensDialog, `${where}: trigger opens a dialog`).toBe(true);
          expect(block.triggerDisabled, `${where}: disabled trigger`).toBe(state === "disabled");
          expect(block.triggerFillsRow, `${where}: trigger fills its row`).toBe(!sm);
          expect(block.panelPadding, `${where}: panel padding`).toBe(sm ? 32 : 24);
          expect(block.triggerBesideText, `${where}: text beside the trigger`).toBe(lg);
          expect(block.paddingTop, `${where}: room above`).toBe(lg ? 64 : 48);
          expect(block.offCentre, `${where}: centred`).toBeLessThan(1);

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
        expect([...above][0]!, "the heading steps up at @md").toBeGreaterThan([...below][0]!);

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

        // The dialog is a container of its own: name and email sit side by
        // side and the buttons sit in a row, send last, once its content box
        // reaches `--container-sm`; below it both stack, send on top and full
        // width.
        const dialog = await openDialog(page, "default");
        const layout = await dialog.evaluate((content) => {
          const style = getComputedStyle(content);
          const box =
            content.clientWidth -
            parseFloat(style.paddingInlineStart) -
            parseFloat(style.paddingInlineEnd);
          const rect = (selector: string) =>
            content.querySelector(selector)!.getBoundingClientRect();
          const name = rect('[name="name"]');
          const email = rect('[name="email"]');
          const cancel = rect('button[type="button"]');
          const send = rect('button[type="submit"]');
          return {
            box,
            fieldsInRow: Math.abs(name.top - email.top) < 1,
            buttonsInRow: Math.abs(cancel.top - send.top) < 1,
            sendFirst: send.bottom <= cancel.top,
            sendLast: send.left >= cancel.right,
            fullWidth: Math.abs(send.width - box) < 1 && Math.abs(cancel.width - box) < 1,
          };
        });
        const row = layout.box >= CONTAINER_SM;
        const where = `${scheme} ${width}px, dialog (${layout.box}px)`;
        expect(layout.fieldsInRow, `${where}: name and email side by side`).toBe(row);
        expect(layout.buttonsInRow, `${where}: buttons in a row`).toBe(row);
        if (row) {
          expect(layout.sendLast, `${where}: send last`).toBe(true);
        } else {
          expect(layout.sendFirst, `${where}: send on top`).toBe(true);
          expect(layout.fullWidth, `${where}: stacked full width`).toBe(true);
        }
      });
    }

    test("renders each state inside its dialog", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      const expected: Record<"default" | "loading" | "error" | "sent", Partial<DialogMetrics>> = {
        default: {
          fields: FIELDS,
          labels: FIELD_LABELS,
          disabledFields: [],
          invalidFields: [],
          fieldErrors: [],
          alerts: [],
          buttons: ["Cancel", SEND],
          submitBusy: false,
          submitDisabled: false,
        },
        loading: {
          fields: FIELDS,
          disabledFields: FIELDS,
          alerts: [],
          buttons: ["Cancel", SENDING],
          submitBusy: true,
          submitDisabled: true,
        },
        error: {
          fields: FIELDS,
          disabledFields: [],
          alerts: [{ role: "alert", title: ERROR }],
          buttons: ["Cancel", SEND],
          submitBusy: false,
        },
        sent: { fields: [], alerts: [{ role: "status", title: SENT }], buttons: ["Close"] },
      };
      for (const [state, want] of Object.entries(expected) as Array<
        [keyof typeof expected, Partial<DialogMetrics>]
      >) {
        const dialog = await openDialog(page, state);
        const got = await dialogMetrics(dialog);
        for (const [key, value] of Object.entries(want)) {
          expect(got[key as keyof DialogMetrics], `${scheme} ${state}: ${key}`).toEqual(value);
        }
        await page.keyboard.press("Escape");
        await expect(dialog).toBeHidden();
      }

      await showState(page, "disabled");
      await expect(trigger(page, "disabled")).toBeDisabled();
      await trigger(page, "disabled").click({ force: true });
      await expect(page.getByRole("dialog")).toHaveCount(0);
    });

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
      await showState(page, "default");
      let ratios = await textRatios(page.locator(`[data-demo-state="default"] ${BLOCK}`), {
        heading: "h2",
        description: "h2 + p",
        trigger: '[data-scope="button"]',
      });

      const empty = await openDialog(page, "empty");
      await empty.getByRole("button", { name: SEND }).click();
      ratios = {
        ...ratios,
        ...(await textRatios(empty, {
          "dialog title": '[data-part="title"]',
          "dialog description": '[data-scope="dialog"][data-part="description"]',
          "field label": '[data-scope="field"][data-part="label"]',
          "field error": '[data-scope="field"][data-part="error-text"]',
          "dialog button": '[data-scope="button"]',
        })),
      };
      await page.keyboard.press("Escape");
      await expect(empty).toBeHidden();

      const failed = await openDialog(page, "error");
      ratios = {
        ...ratios,
        ...(await textRatios(failed, {
          "error title": '[data-scope="alert"][data-part="title"]',
          "error description": '[data-scope="alert"][data-part="description"]',
        })),
      };
      await page.keyboard.press("Escape");
      await expect(failed).toBeHidden();

      const sent = await openDialog(page, "sent");
      ratios = {
        ...ratios,
        ...(await textRatios(sent, {
          "sent title": '[data-scope="alert"][data-part="title"]',
          "sent description": '[data-scope="alert"][data-part="description"]',
          "close button": '[data-scope="button"]',
        })),
      };

      for (const label of [
        `heading "${HEADING}"`,
        `trigger "${TRIGGER}"`,
        'field error "Enter your name."',
        'field error "Enter your work email."',
        `error title "${ERROR}"`,
        `sent title "${SENT}"`,
        'close button "Close"',
      ]) {
        expect(ratios[label], `${scheme}: ${label} measured`).toBeDefined();
      }
      for (const [what, ratio] of Object.entries(ratios)) {
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
      }
    });

    test("shows hover and focus-visible on the trigger and a field", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const button = trigger(page, "default");

      // The primary Button darkens on hover through a filter, not its background.
      const filter = () => button.evaluate((el) => getComputedStyle(el).filter);
      const resting = await filter();
      await button.hover();
      expect(await filter(), `${scheme}: hover filter`).not.toBe(resting);

      await page.mouse.move(0, 0);
      await button.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const ring = await button.evaluate((el) => ({
        focused: el.matches(":focus-visible"),
        style: getComputedStyle(el).outlineStyle,
      }));
      expect(ring.focused, `${scheme}: keyboard focus on the trigger`).toBe(true);
      expect(ring.style, `${scheme}: trigger focus ring`).not.toBe("none");

      await page.keyboard.press("Enter");
      const dialog = page.getByRole("dialog", { name: DIALOG });
      await expect(dialog).toBeVisible();
      const email = dialog.getByRole("textbox", { name: "Work email" });
      await email.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const field = await email.evaluate((el) => ({
        focused: el.matches(":focus-visible"),
        outline: getComputedStyle(el).outlineStyle,
        shadow: getComputedStyle(el).boxShadow,
      }));
      expect(field.focused, `${scheme}: keyboard focus on a field`).toBe(true);
      expect(
        field.outline !== "none" || field.shadow !== "none",
        `${scheme}: field focus ring`,
      ).toBe(true);
    });

    test("names the dialog and hands focus back on cancel and Escape", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      const dialog = await openDialog(page, "default");
      await expect(dialog).toHaveAccessibleDescription(DIALOG_DESCRIPTION);
      expect(
        await dialog.evaluate((el) => el.contains(document.activeElement)),
        `${scheme}: focus moves into the dialog`,
      ).toBe(true);

      await dialog.getByRole("button", { name: "Cancel" }).click();
      await expect(dialog).toBeHidden();
      await expect(trigger(page, "default")).toBeFocused();

      await trigger(page, "default").click();
      await expect(dialog).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(trigger(page, "default")).toBeFocused();
    });

    test("refuses an empty form, then sends a filled one", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      const dialog = await openDialog(page, "default");
      const name = dialog.getByRole("textbox", { name: "Name" });
      const email = dialog.getByRole("textbox", { name: "Work email" });

      await name.fill("   ");
      await dialog.getByRole("button", { name: SEND }).click();
      await expect(dialog).toBeVisible();
      await expect(name).toHaveAttribute("aria-invalid", "true");
      await expect(email).toHaveAttribute("aria-invalid", "true");
      await expect(name).toBeFocused();
      await expect(name).toHaveAccessibleDescription(/Enter your name\./);
      await expect(email).toHaveAccessibleDescription(/Enter your work email\./);
      await expect(dialog.getByRole("textbox", { name: "Company" })).not.toHaveAttribute(
        "aria-invalid",
        "true",
      );

      await name.fill("Ada Lovelace");
      await email.fill("ada@example.com");
      await email.press("Enter");
      await expect(dialog.getByRole("status")).toContainText(SENT);
      await expect(dialog.getByRole("textbox")).toHaveCount(0);
      await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();

      await dialog.getByRole("button", { name: "Close" }).click();
      await expect(dialog).toBeHidden();
      await expect(trigger(page, "default")).toBeFocused();
    });

    test("keeps what was typed after a failed send and clears the error", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      const dialog = await openDialog(page, "error");
      await expect(dialog.getByRole("alert")).toContainText(ERROR);

      await dialog.getByRole("textbox", { name: "Name" }).fill("Ada Lovelace");
      await dialog.getByRole("textbox", { name: "Work email" }).fill("ada@example.com");
      await dialog.getByRole("button", { name: SEND }).click();
      await expect(dialog.getByRole("alert")).toHaveCount(0);
      await expect(dialog.getByRole("textbox", { name: "Name" })).toHaveValue("Ada Lovelace");
      await expect(dialog.getByRole("textbox", { name: "Work email" })).toHaveValue(
        "ada@example.com",
      );
    });

    test("announces the busy send", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      const dialog = await openDialog(page, "loading");
      const send = dialog.locator('button[type="submit"]');
      await expect(send).toHaveAttribute("aria-busy", "true");
      await expect(send).toBeDisabled();
      await expect(send).toHaveText(SENDING);
      await expect(dialog.getByRole("button", { name: "Cancel" })).toBeEnabled();
    });
  });
}
