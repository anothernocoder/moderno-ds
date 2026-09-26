/**
 * The newsletter block, checked on the built docs page at the three widths of
 * the responsive policy (375 / 768 / 1280) in both colour schemes. It asserts
 * text and computed styles; no screenshot baseline is committed.
 *
 * Four claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` the field and the
 *    button stack, the button as wide as the form; at `--container-sm` they
 *    share one row; at `--container-md` the heading steps up a size; at
 *    `--container-lg` the text moves to the start and the form beside it. Each
 *    copy on the page is measured against its own container width, so the
 *    narrow frame stays stacked at 1280 while the wide frame has crossed every
 *    step.
 * 2. **Every state renders what it claims**, at every width: serif heading,
 *    description, the field, "Subscribe" and the note by default; the heading
 *    and the form alone when empty; a disabled field and a busy "Subscribing"
 *    while loading; an invalid field with its message on error; a disabled
 *    field and button when disabled; "You are subscribed" in place of the form
 *    once subscribed. Every copy is centred in its box.
 * 3. **AA contrast** in both schemes on every text the block paints.
 * 4. **Hover and focus-visible** on the field and the button.
 *
 * It also subscribes from the default copy, and checks that an empty `error`
 * string counts as no error while what the reader typed stays.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/newsletter/";

const BLOCK = "section.moderno-block-newsletter";

/** The copy the block ships with. */
const HEADING = "One calm email a month";
const NOTE = "No spam. Unsubscribe with one click.";
const SUBSCRIBE = "Subscribe";
const SUBSCRIBING = "Subscribing";
const SUBSCRIBED = "You are subscribed";
const ERROR = "Enter an email address like you@example.com.";

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** The heading's text. */
  heading: string | null;
  /** The heading's font size, in px. */
  headingSize: number | null;
  /** Whether the heading is set in the contract's `--font-serif`. */
  serifHeading: boolean | null;
  /** The description's text, or null when there is none. */
  description: string | null;
  /** The note under the form, or null when there is none. */
  note: string | null;
  /** The panel's own background and border, as painted. */
  panel: { background: string; border: string; borderWidth: number };
  /** `--card` and `--border` resolved inside the panel, the same way. */
  tokens: { card: string; border: string };
  /** The text alignment of the panel's content. */
  textAlign: string;
  /** Whether the form (or the success Alert) sits beside the text, not under it. */
  split: boolean;
  /** The email field, or null once subscribed. */
  field: {
    name: string;
    type: string;
    label: string;
    labelHidden: boolean;
    disabled: boolean;
    invalid: boolean;
    error: string | null;
  } | null;
  /** The submit button, or null once subscribed. */
  button: { label: string; variant: string; disabled: boolean; busy: boolean } | null;
  /** Whether the button sits beside the field rather than under it. */
  buttonBeside: boolean | null;
  /** Whether the button spans the form's whole width. */
  buttonFullWidth: boolean | null;
  /** Every Alert: its role and its title. */
  alerts: Array<{ role: string | null; title: string }>;
  /** Horizontal offset between the text's centre and the panel's, in px. */
  offCentre: number;
}

/**
 * The page's previews (islands/NewsletterBlockDemo.svelte): the main preview
 * mounts the default; the Examples frame the same block at 18rem, 30rem, 40rem
 * and 50rem, then mount the empty, loading, error, disabled and subscribed
 * states. Every copy is found by the `data-demo-state` its wrapper carries.
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
  "subscribed",
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
      const root = getComputedStyle(document.documentElement);
      const serif = normalise(root.getPropertyValue("--font-serif"));

      /** A token as the browser paints it inside `host`, so it compares to a computed style. */
      function resolve(host: Element, token: string): string {
        const probe = document.createElement("span");
        host.append(probe);
        probe.style.color = `var(${token})`;
        const painted = getComputedStyle(probe).color;
        probe.remove();
        return painted;
      }

      return [...wrapper.querySelectorAll<HTMLElement>(selector)].map((section) => {
        const panel = section.firstElementChild as HTMLElement | null;
        const body = panel?.firstElementChild as HTMLElement | null;
        if (!panel || !body) throw new Error("the newsletter block did not render its own markup");
        const tokens = { card: resolve(panel, "--card"), border: resolve(panel, "--border") };

        const [text, second] = [...body.children].map((el) => el.getBoundingClientRect());
        const heading = section.querySelector("h2");
        const description = section.querySelector("h2 + p");
        const form = section.querySelector("form");
        const note = form?.querySelector(":scope > p") ?? null;
        const input = section.querySelector<HTMLInputElement>("input");
        const label = section.querySelector<HTMLLabelElement>('[data-part="label"]');
        const errorText = section.querySelector('[data-part="error-text"]');
        const button = section.querySelector<HTMLButtonElement>('button[type="submit"]');
        const inputBox = input?.getBoundingClientRect();
        const buttonBox = button?.getBoundingClientRect();
        const formBox = form?.getBoundingClientRect();
        const panelBox = panel.getBoundingClientRect();
        const panelStyle = getComputedStyle(panel);

        return {
          containerWidth: section.offsetWidth,
          heading: heading?.textContent?.trim() ?? null,
          headingSize: heading ? parseFloat(getComputedStyle(heading).fontSize) : null,
          serifHeading: heading ? normalise(getComputedStyle(heading).fontFamily) === serif : null,
          description: description?.textContent?.trim() ?? null,
          note: note?.textContent?.trim() ?? null,
          panel: {
            background: panelStyle.backgroundColor,
            border: panelStyle.borderTopColor,
            borderWidth: parseFloat(panelStyle.borderTopWidth),
          },
          tokens,
          textAlign: getComputedStyle(body).textAlign,
          split: Boolean(text && second && second.top < text.bottom && second.left >= text.right),
          field: input
            ? {
                name: input.name,
                type: input.type,
                label: label?.textContent?.trim() ?? "",
                labelHidden: label ? label.getBoundingClientRect().width <= 1 : false,
                disabled: input.disabled,
                invalid: input.getAttribute("aria-invalid") === "true",
                error: errorText?.textContent?.trim() || null,
              }
            : null,
          button: button
            ? {
                label: button.textContent?.trim() ?? "",
                variant: button.getAttribute("data-variant") ?? "",
                disabled: button.disabled,
                busy: button.getAttribute("aria-busy") === "true",
              }
            : null,
          buttonBeside:
            inputBox && buttonBox
              ? buttonBox.top < inputBox.bottom && buttonBox.left >= inputBox.right
              : null,
          buttonFullWidth:
            buttonBox && formBox ? Math.abs(buttonBox.width - formBox.width) < 1 : null,
          alerts: [...section.querySelectorAll('[data-scope="alert"][data-part="root"]')].map(
            (alert) => ({
              role: alert.getAttribute("role"),
              title: alert.querySelector('[data-part="title"]')?.textContent?.trim() ?? "",
            }),
          ),
          offCentre: text
            ? Math.abs(text.left + text.width / 2 - (panelBox.left + panelBox.width / 2))
            : 0,
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
async function textRatios(
  page: Page,
  state: "default" | "error" | "subscribed",
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
        ["note", block.querySelector("form > p")],
        ["email", block.querySelector("input")],
        ["field error", block.querySelector('[data-part="error-text"]')],
        ["button", block.querySelector('button[type="submit"]')],
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
      return ratios;
    },
    { state, selector: BLOCK },
  );
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`newsletter — ${scheme}`, () => {
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
          if (block.buttonBeside !== null) {
            expect(block.buttonBeside, `${where}: button beside the field`).toBe(sm);
          }
          if (block.buttonFullWidth !== null) {
            expect(block.buttonFullWidth, `${where}: button as wide as the form`).toBe(!sm);
          }
          expect(block.split, `${where}: text and form in two columns`).toBe(lg);
          expect(block.textAlign, `${where}: text alignment`).toBe(lg ? "start" : "center");
          if (!lg) expect(block.offCentre, `${where}: centred`).toBeLessThan(1);

          // The panel is the --card surface with a --border hairline.
          expect(block.panel.background, `${where}: panel surface`).toBe(block.tokens.card);
          expect(block.panel.border, `${where}: panel border colour`).toBe(block.tokens.border);
          expect(block.panel.borderWidth, `${where}: panel border`).toBeGreaterThan(0);

          expect(block.serifHeading, `${where}: serif heading`).toBe(true);
          expect(block.heading, `${where}: heading`).toBe(HEADING);

          if (state === "subscribed") {
            expect(block.field, `${where}: no field once subscribed`).toBeNull();
            expect(block.button, `${where}: no button once subscribed`).toBeNull();
            expect(block.alerts, `${where}: subscribed alert`).toEqual([
              { role: "status", title: SUBSCRIBED },
            ]);
            continue;
          }

          expect(block.alerts, `${where}: no alert`).toEqual([]);
          expect(block.field, `${where}: the email field`).toMatchObject({
            name: "email",
            type: "email",
            label: "Email address",
            labelHidden: true,
          });
          expect(block.button?.variant, `${where}: button variant`).toBe("primary");

          if (state === "empty") {
            expect(block.description, `${where}: no description`).toBeNull();
            expect(block.note, `${where}: no note`).toBeNull();
          } else {
            expect(block.description, `${where}: description`).not.toBeNull();
            expect(block.note, `${where}: note`).toBe(NOTE);
          }

          const inert = state === "loading" || state === "disabled";
          expect(block.field?.disabled, `${where}: field disabled`).toBe(inert);
          expect(block.button?.disabled, `${where}: button disabled`).toBe(inert);
          expect(block.button?.busy, `${where}: button busy`).toBe(state === "loading");
          expect(block.button?.label, `${where}: button label`).toBe(
            state === "loading" ? SUBSCRIBING : SUBSCRIBE,
          );
          expect(block.field?.invalid, `${where}: field invalid`).toBe(state === "error");
          expect(block.field?.error, `${where}: field error`).toBe(
            state === "error" ? ERROR : null,
          );

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
      });
    }

    test("sits in the middle of its preview", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      for (const state of [
        "default",
        "empty",
        "loading",
        "error",
        "disabled",
        "subscribed",
      ] as const) {
        await showState(page, state);
        const gaps = await page.evaluate(
          ({ state, selector }) => {
            const wrapper = document.querySelector(`[data-demo-state="${state}"]`)!;
            const panel = wrapper.closest(".preview-panel--demo")!.getBoundingClientRect();
            const card = wrapper
              .querySelector(selector)!
              .firstElementChild!.getBoundingClientRect();
            return {
              above: card.top - panel.top,
              below: panel.bottom - card.bottom,
              before: card.left - panel.left,
              after: panel.right - card.right,
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
        ...(await textRatios(page, "default")),
        ...(await textRatios(page, "error")),
        ...(await textRatios(page, "subscribed")),
      };
      for (const label of [
        "default heading",
        "default description",
        "default note",
        "default email",
        "default button",
        "error field error",
        "subscribed alert title",
        "subscribed alert description",
      ]) {
        expect(Object.keys(ratios), `${scheme}: ${label} measured`).toContain(label);
      }
      for (const [what, ratio] of Object.entries(ratios)) {
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
      }
    });

    test("shows hover and focus-visible on the field and the button", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      const field = block.getByRole("textbox", { name: "Email address" });
      const button = block.getByRole("button", { name: SUBSCRIBE });

      // The field raises its border to --ring under the pointer.
      const border = () => field.evaluate((el) => getComputedStyle(el).borderTopColor);
      await page.mouse.move(0, 0);
      const restingBorder = await border();
      await field.hover();
      expect(await border(), `${scheme}: field hover`).not.toBe(restingBorder);

      // The primary button darkens through a filter or a new fill.
      const surface = () =>
        button.evaluate((el) => {
          const style = getComputedStyle(el);
          return `${style.backgroundColor} ${style.filter}`;
        });
      await page.mouse.move(0, 0);
      const restingSurface = await surface();
      await button.hover();
      expect(await surface(), `${scheme}: button hover`).not.toBe(restingSurface);

      await page.mouse.move(0, 0);
      const ring = (target: typeof field) =>
        target.evaluate((el) => ({
          focused: el.matches(":focus-visible"),
          style: getComputedStyle(el).outlineStyle,
        }));
      await field.focus();
      expect(await ring(field), `${scheme}: field ring`).toEqual({
        focused: true,
        style: "solid",
      });
      await page.keyboard.press("Tab");
      const pressed = await ring(button);
      expect(pressed.focused, `${scheme}: button keyboard focus`).toBe(true);
      expect(pressed.style, `${scheme}: button ring`).not.toBe("none");
    });

    test("keeps the disabled field and button out of reach", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "disabled");
      const block = page.locator(`[data-demo-state="disabled"] ${BLOCK}`);

      for (const control of [
        block.getByRole("textbox", { name: "Email address" }),
        block.getByRole("button", { name: SUBSCRIBE }),
      ]) {
        await expect(control).toBeDisabled();
        await control.evaluate((el) => (el as HTMLElement).focus());
        await expect(control).not.toBeFocused();
      }
    });

    test("puts its heading in the page outline as an h2", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      await expect(block.getByRole("heading", { level: 2 })).toHaveText(HEADING);
    });

    test("announces the busy subscribe and ties the error to the field", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const busy = page.locator(`[data-demo-state="loading"] ${BLOCK} button[type="submit"]`);
      await expect(busy).toHaveAttribute("aria-busy", "true");
      await expect(busy).toHaveText(SUBSCRIBING);
      const spinnerHidden = await busy.evaluate(
        (el) => el.querySelector('[aria-hidden="true"]') !== null,
      );
      expect(spinnerHidden).toBe(true);

      await showState(page, "error");
      const field = page
        .locator(`[data-demo-state="error"] ${BLOCK}`)
        .getByRole("textbox", { name: "Email address" });
      await expect(field).toHaveAttribute("aria-invalid", "true");
      await expect(field).toHaveAccessibleDescription(ERROR);
    });

    test("subscribes from the default copy and clears the error by subscribing again", async ({
      page,
    }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });

      await showState(page, "error");
      const failed = page.locator(`[data-demo-state="error"] ${BLOCK}`);
      await failed.getByRole("textbox", { name: "Email address" }).fill("ada@example.com");
      // The demo clears its message to "", the way a consumer holding the
      // error as a string does once a subscribe succeeds.
      await failed.getByRole("button", { name: SUBSCRIBE }).click();
      await expect(failed.locator('[aria-invalid="true"]')).toHaveCount(0);
      await expect(failed.locator('[data-part="error-text"]')).toHaveCount(0);
      // What the reader typed is still there.
      await expect(failed.getByRole("textbox", { name: "Email address" })).toHaveValue(
        "ada@example.com",
      );

      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      await block.getByRole("button", { name: SUBSCRIBE }).click();
      await expect(block.getByRole("status")).toContainText(SUBSCRIBED);
      await expect(block.locator("form")).toHaveCount(0);
      await expect(page).toHaveURL(new RegExp(`${PAGE}$`));
    });
  });
}
