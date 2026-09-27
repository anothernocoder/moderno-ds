/**
 * The checkout-form block, checked on the built docs page at the three widths
 * of the responsive policy (375 / 768 / 1280) in both colour schemes. It
 * asserts text and computed styles; no screenshot baseline is committed.
 *
 * Four claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` every field has its
 *    own row and the buttons stack full width, continue on top; from
 *    `--container-sm` the fields pair off and the buttons share a row; at
 *    `--container-md` the heading steps up a size and the delivery options sit
 *    side by side; at `--container-lg` each group's title moves beside its
 *    fields and the section gets more room above and below. Each copy on the
 *    page is measured against its own container width, so the narrow frame
 *    stays stacked at 1280 while the wide frame has crossed every step.
 * 2. **Every state renders what it claims**, at every width: the shipping step
 *    (contact, address, delivery method) by default; the card details and the
 *    save switch on the payment step; no delivery method when there are no
 *    options; every control disabled and a busy "Saving" while loading; an
 *    error Alert and an invalid field on error; every control and both buttons
 *    disabled when disabled. Every copy is centred in its box.
 * 3. **AA contrast** in both schemes on every text the block paints, and 3:1 on
 *    the picked delivery option's border against its surface.
 * 4. **Hover and focus-visible** on a delivery option, a field, a radio and
 *    both buttons, and no focus at all on a disabled control.
 *
 * It also checks the demo round trips: the default copy walks from the
 * shipping step to the payment step and back, and submitting the error copy
 * again clears the messages — an empty `error` string counts as no error.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/checkout-form/";

const BLOCK = "section.moderno-block-checkout-form";

/** The copy the block ships with. */
const SHIPPING = {
  heading: "Shipping details",
  groups: ["Contact", "Shipping address", "Delivery method"],
  fields: ["email", "fullName", "address", "city", "region", "postalCode", "country"],
  labels: ["Email", "Full name", "Address", "City", "State / Province", "Postal code", "Country"],
  back: "Back to cart",
  submit: "Continue to payment",
  busy: "Saving",
};
const PAYMENT = {
  heading: "Payment",
  groups: ["Card details"],
  fields: ["cardName", "cardNumber", "expiry", "cvc"],
  labels: ["Name on card", "Card number", "Expiry", "CVC"],
  back: "Back to shipping",
  submit: "Place order",
};
const OPTIONS = [
  { value: "standard", text: ["Standard", "4–10 business days", "$5.00"] },
  { value: "express", text: ["Express", "2–5 business days", "$16.00"] },
];
const SAVE_CARD = "Save this card for next time";
/** The demo's own messages (islands/CheckoutFormBlockDemo.svelte). */
const ERROR = "We could not save your address.";
const POSTAL_ERROR = "Enter a postal code, like 94103.";

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** The heading's text, level, font size in px, and whether it reads `--font-serif`. */
  heading: string | null;
  headingTag: string | null;
  headingSize: number | null;
  serifHeading: boolean | null;
  /** Each group's title, and the columns of each group (3 once titles sit beside fields). */
  groups: string[];
  groupColumns: number[];
  /** Columns of each group's field grid: 2 once the fields pair off. */
  fieldColumns: number[];
  /** Columns of the delivery options: 2 once they sit side by side. */
  optionColumns: number | null;
  /** The text fields' names and labels, in order. */
  fields: string[];
  fieldLabels: string[];
  /** Text fields that are disabled / invalid, by name. */
  disabledFields: string[];
  invalidFields: string[];
  /** The field error messages shown. */
  fieldErrors: string[];
  /** Each delivery radio's value, text, whether it is checked and disabled. */
  options: Array<{ value: string; text: string[]; checked: boolean; disabled: boolean }>;
  /** The save switch's label and whether it is disabled, or null on the shipping step. */
  saveCard: { label: string; disabled: boolean } | null;
  /** The actions row's flex direction and whether the buttons fill it. */
  actionsDirection: string | null;
  buttonsFillRow: boolean | null;
  /** The back and submit buttons: label, disabled, busy. */
  back: { label: string; disabled: boolean } | null;
  submit: { label: string; disabled: boolean; busy: boolean } | null;
  /** Every Alert: its role and its title. */
  alerts: Array<{ role: string | null; title: string }>;
  /** The block's padding above its content, in px. */
  paddingTop: number;
  /** Horizontal offset between the heading block's centre and the block's, in px. */
  offCentre: number;
}

/**
 * The page's previews (islands/CheckoutFormBlockDemo.svelte): the main preview
 * mounts the default; the Examples frame the same block at 18rem, 30rem, 40rem
 * and 50rem, then mount the payment, empty, loading, error and disabled states.
 * Every copy is found by the `data-demo-state` its wrapper carries.
 */
const STATES = [
  "default",
  "narrow",
  "compact",
  "panel",
  "wide",
  "payment",
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
  // The islands hydrate once visible (`client:visible`); Astro drops `ssr` from
  // the island when it has, and only then does focus or a click stick.
  await page
    .locator(`astro-island:not([ssr]):has([data-demo-state="${state}"])`)
    .first()
    .waitFor({ state: "attached" });
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
        const form = section.querySelector("form");
        if (!inner || !intro || !form) {
          throw new Error("the checkout-form block did not render its own markup");
        }

        const heading = intro.querySelector("h1, h2");
        const groups = [...form.querySelectorAll<HTMLElement>(':scope > [role="group"]')];
        const controls = [
          ...form.querySelectorAll<HTMLInputElement>('[data-scope="field"][data-part="input"]'),
        ];
        const radios = [
          ...form.querySelectorAll<HTMLElement>('[data-scope="radio-group"][data-part="item"]'),
        ];
        const optionGrid = form.querySelector('[data-scope="radio-group"][data-part="root"] > div');
        const saveCard = form.querySelector<HTMLElement>('[data-scope="switch"][data-part="root"]');
        const back = form.querySelector<HTMLButtonElement>('button[type="button"]');
        const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
        const actions = submit?.parentElement ?? null;
        const blockBox = section.getBoundingClientRect();
        const introBox = intro.getBoundingClientRect();

        return {
          containerWidth: section.offsetWidth,
          heading: heading ? text(heading) : null,
          headingTag: heading ? heading.tagName.toLowerCase() : null,
          headingSize: heading ? parseFloat(getComputedStyle(heading).fontSize) : null,
          serifHeading: heading ? normalise(getComputedStyle(heading).fontFamily) === serif : null,
          groups: groups.map((group) => text(group.querySelector("h2, h3"))),
          groupColumns: groups.map(columns),
          fieldColumns: groups
            .map((group) => group.children[1] as HTMLElement)
            .filter((grid) => grid.querySelector('[data-scope="field"]'))
            .map(columns),
          optionColumns: optionGrid ? columns(optionGrid) : null,
          fields: controls.map((control) => control.name),
          fieldLabels: [...form.querySelectorAll('[data-scope="field"][data-part="label"]')].map(
            // The required marker is the label's own decoration, not its text.
            (label) => text(label).replace(/\s*\*$/, ""),
          ),
          disabledFields: controls.filter((c) => c.disabled).map((c) => c.name),
          invalidFields: controls
            .filter((c) => c.getAttribute("aria-invalid") === "true")
            .map((c) => c.name),
          fieldErrors: [...form.querySelectorAll('[data-scope="field"][data-part="error-text"]')]
            .map((el) => text(el))
            .filter(Boolean),
          options: radios.map((item) => {
            const input = item.querySelector<HTMLInputElement>('input[type="radio"]')!;
            return {
              value: input.value,
              text: [...item.querySelector('[data-part="item-text"]')!.children].map((el) =>
                text(el),
              ),
              checked: input.checked,
              disabled: input.disabled,
            };
          }),
          saveCard: saveCard
            ? {
                label: text(saveCard.querySelector('[data-part="label"]')),
                disabled: saveCard.querySelector<HTMLInputElement>("input")!.disabled,
              }
            : null,
          actionsDirection: actions ? getComputedStyle(actions).flexDirection : null,
          buttonsFillRow:
            back && submit && actions
              ? Math.abs(back.offsetWidth - actions.clientWidth) < 1 &&
                Math.abs(submit.offsetWidth - actions.clientWidth) < 1
              : null,
          back: back ? { label: text(back), disabled: back.disabled } : null,
          submit: submit
            ? {
                label: text(submit),
                disabled: submit.disabled,
                busy: submit.getAttribute("aria-busy") === "true",
              }
            : null,
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
  state: "default" | "payment" | "error",
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
      const form = block.querySelector("form")!;

      const against = (el: Element) => ratio(getComputedStyle(el).color, surfaceOf(el));
      const ratios: Record<string, number> = {};
      const measure = (name: string, el: Element | null | undefined) => {
        if (el) ratios[`${state} ${name}`] = against(el);
      };

      measure("heading", block.querySelector("h1, h2"));
      measure("description", block.querySelector(":is(h1, h2) + p"));
      measure("back button", form.querySelector('button[type="button"]'));
      measure("submit button", form.querySelector('button[type="submit"]'));
      measure("alert title", block.querySelector('[data-scope="alert"] [data-part="title"]'));
      measure(
        "alert description",
        block.querySelector('[data-scope="alert"] [data-part="description"]'),
      );
      measure("save label", form.querySelector('[data-scope="switch"] [data-part="label"]'));
      for (const group of form.querySelectorAll(':scope > [role="group"]')) {
        const title = group.querySelector("h2, h3")!;
        const name = title.textContent?.trim() ?? "group";
        measure(`${name} title`, title);
        measure(`${name} summary`, title.nextElementSibling);
      }
      for (const label of form.querySelectorAll('[data-scope="field"][data-part="label"]')) {
        measure(`${label.textContent?.trim().replace(/\s*\*$/, "")} field label`, label);
      }
      for (const error of form.querySelectorAll('[data-scope="field"][data-part="error-text"]')) {
        if (error.textContent?.trim()) measure("field error", error);
      }
      for (const item of form.querySelectorAll('[data-scope="radio-group"][data-part="item"]')) {
        const [label, description, price] = [
          ...item.querySelector('[data-part="item-text"]')!.children,
        ];
        const name = label!.textContent?.trim() ?? "option";
        measure(`${name} option label`, label);
        measure(`${name} option description`, description);
        measure(`${name} option price`, price);
        // Non-text contrast (WCAG 1.4.11): the picked option's border is how
        // the card reads as chosen, beside the radio's own dot.
        if (item.getAttribute("data-state") === "checked") {
          ratios[`${state} picked option border`] = ratio(
            getComputedStyle(item).borderTopColor,
            surfaceOf(item.parentElement!),
          );
        }
      }
      return ratios;
    },
    { state, selector: BLOCK },
  );
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`checkout-form — ${scheme}`, () => {
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
          const payment = state === "payment";
          const copy = payment ? PAYMENT : SHIPPING;
          const groups = state === "empty" ? SHIPPING.groups.slice(0, 2) : copy.groups;

          expect(block.heading, `${where}: heading`).toBe(copy.heading);
          expect(block.headingTag, `${where}: heading level`).toBe("h2");
          expect(block.serifHeading, `${where}: serif heading`).toBe(true);
          expect(block.paddingTop, `${where}: room above`).toBe(
            block.containerWidth >= CONTAINER_LG ? 64 : 48,
          );
          expect(block.offCentre, `${where}: centred`).toBeLessThan(1);

          expect(block.groups, `${where}: groups`).toEqual(groups);
          expect(block.groupColumns, `${where}: titles beside fields`).toEqual(
            groups.map(() => (block.containerWidth >= CONTAINER_LG ? 3 : 1)),
          );
          expect(block.fieldColumns, `${where}: fields paired off`).toEqual(
            (payment ? [0] : [0, 0]).map(() => (block.containerWidth >= CONTAINER_SM ? 2 : 1)),
          );
          expect(block.fields, `${where}: fields`).toEqual(copy.fields);
          expect(block.fieldLabels, `${where}: field labels`).toEqual(copy.labels);

          if (groups.includes("Delivery method")) {
            expect(
              block.options.map(({ value, text }) => ({ value, text })),
              `${where}: delivery options`,
            ).toEqual(OPTIONS);
            expect(
              block.options.map((option) => option.checked),
              `${where}: first option picked`,
            ).toEqual([true, false]);
            expect(block.optionColumns, `${where}: options side by side`).toBe(
              block.containerWidth >= CONTAINER_MD ? 2 : 1,
            );
          } else {
            expect(block.options, `${where}: no delivery options`).toEqual([]);
          }

          const inert = state === "loading" || state === "disabled";
          expect(block.saveCard, `${where}: save switch`).toEqual(
            payment ? { label: SAVE_CARD, disabled: false } : null,
          );
          expect(block.disabledFields, `${where}: disabled fields`).toEqual(
            inert ? copy.fields : [],
          );
          expect(
            block.options.every((option) => option.disabled === inert),
            `${where}: disabled radios`,
          ).toBe(true);
          expect(block.back, `${where}: back button`).toEqual({
            label: copy.back,
            disabled: inert,
          });
          expect(block.submit, `${where}: submit button`).toEqual({
            label: state === "loading" ? SHIPPING.busy : copy.submit,
            disabled: inert,
            busy: state === "loading",
          });
          expect(block.actionsDirection, `${where}: buttons share a row`).toBe(
            block.containerWidth >= CONTAINER_SM ? "row" : "column-reverse",
          );
          expect(block.buttonsFillRow, `${where}: full-width buttons`).toBe(
            block.containerWidth < CONTAINER_SM,
          );

          if (state === "error") {
            expect(block.alerts, `${where}: error alert`).toEqual([
              { role: "alert", title: ERROR },
            ]);
            expect(block.invalidFields, `${where}: invalid field`).toEqual(["postalCode"]);
            expect(block.fieldErrors, `${where}: field error`).toEqual([POSTAL_ERROR]);
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
      for (const state of [
        "default",
        "payment",
        "empty",
        "loading",
        "error",
        "disabled",
      ] as const) {
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
        ...(await contrastRatios(page, "payment")),
        ...(await contrastRatios(page, "error")),
      };
      for (const label of [
        "default heading",
        "default description",
        ...SHIPPING.groups.flatMap((name) => [`default ${name} title`, `default ${name} summary`]),
        ...SHIPPING.labels.map((name) => `default ${name} field label`),
        ...OPTIONS.flatMap(({ text: [name] }) => [
          `default ${name} option label`,
          `default ${name} option description`,
          `default ${name} option price`,
        ]),
        "default picked option border",
        "default back button",
        "default submit button",
        "payment heading",
        "payment Card details title",
        "payment Card details summary",
        ...PAYMENT.labels.map((name) => `payment ${name} field label`),
        "payment save label",
        "error alert title",
        "error alert description",
        "error field error",
      ]) {
        expect(Object.keys(ratios), `${scheme}: ${label} measured`).toContain(label);
      }
      for (const [what, ratio] of Object.entries(ratios)) {
        const floor = what.endsWith(" border") ? 3 : 4.5;
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(floor);
      }
    });

    test("shows hover and focus-visible on a delivery option", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      const express = block.locator('[data-scope="radio-group"][data-part="item"]').nth(1);
      const border = () => express.evaluate((el) => getComputedStyle(el).borderTopColor);

      await page.mouse.move(0, 0);
      const resting = await border();
      await express.hover();
      await expect.poll(border, { message: `${scheme}: hover border` }).not.toBe(resting);

      // The hidden radio carries focus; the ring is drawn on the circle.
      await page.mouse.move(0, 0);
      await block.locator('input[name="country"]').focus();
      await page.keyboard.press("Tab");
      const control = block.locator('[data-scope="radio-group"][data-part="item-control"]').first();
      await expect(control).toHaveAttribute("data-focus-visible", "");
      expect(
        await control.evaluate((el) => getComputedStyle(el).outlineStyle),
        `${scheme}: radio ring`,
      ).toBe("solid");

      // Arrow keys move the pick, and the picked card takes the border.
      await page.keyboard.press("ArrowDown");
      await expect(express).toHaveAttribute("data-state", "checked");
      await expect(block.locator('input[name="delivery"]:checked')).toHaveValue("express");
    });

    test("shows focus-visible on a field and both buttons", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "empty");
      const block = page.locator(`[data-demo-state="empty"] ${BLOCK}`);

      const ring = (selector: string) =>
        block.locator(selector).evaluate((el) => ({
          focused: el.matches(":focus-visible"),
          style: getComputedStyle(el).outlineStyle,
        }));

      await block.locator('input[name="email"]').focus();
      expect(await ring('input[name="email"]'), `${scheme}: field ring`).toEqual({
        focused: true,
        style: "solid",
      });

      await block.locator('input[name="country"]').focus();
      await page.keyboard.press("Tab");
      const back = await ring('button[type="button"]');
      expect(back.focused, `${scheme}: back keyboard focus`).toBe(true);
      expect(back.style, `${scheme}: back ring`).not.toBe("none");

      await page.keyboard.press("Tab");
      const submit = await ring('button[type="submit"]');
      expect(submit.focused, `${scheme}: submit keyboard focus`).toBe(true);
      expect(submit.style, `${scheme}: submit ring`).not.toBe("none");
    });

    test("keeps disabled controls out of reach", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "disabled");
      const block = page.locator(`[data-demo-state="disabled"] ${BLOCK}`);

      for (const name of [...SHIPPING.fields, "delivery"]) {
        for (const control of await block.locator(`input[name="${name}"]`).all()) {
          await expect(control).toBeDisabled();
          await control.evaluate((el) => (el as HTMLElement).focus());
          await expect(control).not.toBeFocused();
        }
      }
      for (const label of [SHIPPING.back, SHIPPING.submit]) {
        const button = block.getByRole("button", { name: label });
        await expect(button).toBeDisabled();
        await button.evaluate((el) => (el as HTMLElement).focus());
        await expect(button).not.toBeFocused();
      }
    });

    test("announces the busy step and the failed one as an alert", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const busy = page.locator(`[data-demo-state="loading"] ${BLOCK} button[type="submit"]`);
      await expect(busy).toHaveAttribute("aria-busy", "true");
      await expect(busy).toHaveText(SHIPPING.busy);
      expect(await busy.evaluate((el) => el.querySelector('[aria-hidden="true"]') !== null)).toBe(
        true,
      );

      await showState(page, "error");
      const block = page.locator(`[data-demo-state="error"] ${BLOCK}`);
      await expect(block.getByRole("alert")).toContainText(ERROR);
      await expect(block.getByRole("textbox", { name: /Postal code/ })).toHaveAttribute(
        "aria-invalid",
        "true",
      );
      // Each group is named by its own title.
      await expect(block.getByRole("group", { name: "Shipping address" })).toBeVisible();
      await expect(block.getByRole("radiogroup", { name: "Delivery method" })).toBeVisible();
    });

    test("walks the steps and clears the error by submitting again", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });

      await showState(page, "error");
      const failed = page.locator(`[data-demo-state="error"] ${BLOCK}`);
      await failed.locator('input[name="postalCode"]').fill("94103");
      // The demo clears its messages to "" and {}, the way a consumer holding
      // them as strings does once the step succeeds.
      await failed.getByRole("button", { name: SHIPPING.submit }).click();
      await expect(failed.locator('[data-scope="alert"]')).toHaveCount(0);
      await expect(failed.locator('[aria-invalid="true"]')).toHaveCount(0);
      // What was typed is still there.
      await expect(failed.locator('input[name="postalCode"]')).toHaveValue("94103");

      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      await block.getByRole("button", { name: SHIPPING.submit }).click();
      await expect(block.getByRole("heading", { level: 2 })).toHaveText(PAYMENT.heading);
      await expect(block.locator('input[name="cardNumber"]')).toHaveAttribute(
        "autocomplete",
        "cc-number",
      );
      await expect(block.getByRole("switch", { name: SAVE_CARD })).not.toBeChecked();
      await block.getByRole("button", { name: PAYMENT.back }).click();
      await expect(block.getByRole("heading", { level: 2 })).toHaveText(SHIPPING.heading);
      await expect(page).toHaveURL(new RegExp(`${PAGE}$`));
    });
  });
}
