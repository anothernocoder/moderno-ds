/**
 * The slide-over block, checked on the built docs page at the three widths of
 * the responsive policy (375 / 768 / 1280) in both colour schemes. It asserts
 * text and computed styles; no screenshot baseline is committed.
 *
 * Seven claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` the trigger fills its
 *    row and each term sits above its value; at `--container-sm` the trigger
 *    takes its own width, each term sits beside its value and the panel's
 *    padding grows; at `--container-md` the heading steps up a size; at
 *    `--container-lg` the trigger sits beside the name with more room above
 *    and below. Each copy on the page is measured against its own container
 *    width.
 * 2. **The drawer slides in from the right**: pinned to the viewport's right
 *    edge, as tall as the viewport, as wide as it up to `--container-sm`, with
 *    the form's buttons at its foot.
 * 3. **Every state renders what it claims**, at every width: the record in
 *    every copy, "Not added" for the empty one's role and notes, the trigger
 *    disabled only in the disabled copy; inside the drawer, the form filled
 *    from the record, the busy one and the failed one.
 * 4. **Centred** in every Preview.
 * 5. **AA contrast** in both schemes on every text the block paints, the
 *    drawer included.
 * 6. **Hover and focus-visible** on the trigger, a field and the drawer's
 *    close button.
 * 7. **The drawer itself**: named by its title and described by its
 *    description; Cancel, the close button and Escape close it, drop unsaved
 *    edits and hand focus back to the trigger; a form without a name or email
 *    is refused (both invalid with their errors, focus on name); a filled one
 *    is saved, the drawer closes and the panel shows the saved record; the
 *    failed copy keeps what was typed and clears its error when saved again;
 *    the busy save is announced.
 */
import { expect, test, type Locator, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/slide-over/";

const BLOCK = "section.moderno-block-slide-over";

const NAME = "Ada Lovelace";
const EMAIL = "ada@example.com";
const ROLE = "Engineering lead";
const NOTES = "Leads the payments team. Prefers email to calls.";
const EMPTY_NAME = "Grace Hopper";
const EMPTY_EMAIL = "grace@example.com";
const NOT_ADDED = "Not added";
const TRIGGER = "Edit details";
const DRAWER = "Edit details";
const DRAWER_DESCRIPTION = "Update this person's profile. Nothing changes until you save.";
const FIELDS = ["name", "email", "role", "notes"];
const FIELD_LABELS = ["Name", "Email", "Role", "Notes"];
const SAVE = "Save changes";
const SAVING = "Saving";
const ERROR = "We could not save your changes.";

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  heading: string;
  /** Whether the heading resolves to the theme's display face. */
  serifHeading: boolean;
  /** The heading's font size, in px. */
  headingSize: number;
  email: string;
  terms: string[];
  values: string[];
  trigger: string;
  triggerDisabled: boolean;
  /** Whether the trigger says it opens a dialog. */
  opensDialog: boolean;
  /** Whether the trigger spans the panel's content box. */
  triggerFillsRow: boolean;
  /** Whether the trigger sits on the name's line rather than below it. */
  triggerBesideName: boolean;
  /** Whether every term sits on its value's line rather than above it. */
  termsBesideValues: boolean;
  /** The panel's inline padding, in px. */
  panelPadding: number;
  /** The room above the panel, in px. */
  paddingTop: number;
  /** How far the panel sits off the middle of the block, in px. */
  offCentre: number;
}

/**
 * The page's previews (islands/SlideOverBlockDemo.svelte): the main preview
 * mounts the default; the Examples frame the same block at 18rem, 30rem, 40rem
 * and 50rem, then mount the empty, loading, error and disabled states. Every
 * copy is found by the `data-demo-state` its wrapper carries.
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
        const name = heading?.parentElement;
        const header = name?.parentElement;
        const panel = header?.parentElement;
        const trigger = section.querySelector<HTMLButtonElement>('[data-scope="button"]');
        const terms = [...section.querySelectorAll("dt")];
        const values = [...section.querySelectorAll("dd")];
        if (!heading || !name || !panel || !trigger || terms.length === 0) {
          throw new Error("the slide-over block did not render its own markup");
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
          email: name.querySelector("p")?.textContent?.trim() ?? "",
          terms: terms.map((term) => term.textContent?.trim() ?? ""),
          values: values.map((value) => value.textContent?.trim() ?? ""),
          trigger: trigger.textContent?.trim() ?? "",
          triggerDisabled: trigger.disabled,
          opensDialog: trigger.getAttribute("aria-haspopup") === "dialog",
          triggerFillsRow: Math.abs(trigger.getBoundingClientRect().width - contentBox) < 1,
          triggerBesideName:
            trigger.getBoundingClientRect().top < name.getBoundingClientRect().bottom,
          termsBesideValues: terms.every((term, index) => {
            const termRect = term.getBoundingClientRect();
            const valueRect = values[index]!.getBoundingClientRect();
            return termRect.bottom > valueRect.top && termRect.right <= valueRect.left;
          }),
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

/** Open the drawer of the copy mounted for `state` and return it. */
async function openDrawer(page: Page, state: State): Promise<Locator> {
  await showState(page, state);
  await trigger(page, state).click();
  const drawer = page.getByRole("dialog", { name: DRAWER });
  await expect(drawer).toBeVisible();
  return drawer;
}

interface DrawerMetrics {
  fields: string[];
  values: string[];
  labels: string[];
  disabledFields: string[];
  invalidFields: string[];
  fieldErrors: string[];
  alerts: Array<{ role: string | null; title: string }>;
  buttons: string[];
  submitBusy: boolean;
  submitDisabled: boolean;
}

async function drawerMetrics(drawer: Locator): Promise<DrawerMetrics> {
  return drawer.evaluate((content) => {
    const inputs = [...content.querySelectorAll<HTMLInputElement>("input, textarea")];
    const submit = content.querySelector<HTMLButtonElement>('button[type="submit"]');
    return {
      fields: inputs.map((input) => input.name),
      values: inputs.map((input) => input.value),
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
  test.describe(`slide-over — ${scheme}`, () => {
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
          const empty = state === "empty";

          expect(block.heading, `${where}: heading`).toBe(empty ? EMPTY_NAME : NAME);
          expect(block.serifHeading, `${where}: serif heading`).toBe(true);
          expect(block.email, `${where}: email`).toBe(empty ? EMPTY_EMAIL : EMAIL);
          expect(block.terms, `${where}: terms`).toEqual(["Role", "Notes"]);
          expect(block.values, `${where}: values`).toEqual(
            empty ? [NOT_ADDED, NOT_ADDED] : [ROLE, NOTES],
          );
          expect(block.trigger, `${where}: trigger`).toBe(TRIGGER);
          expect(block.opensDialog, `${where}: trigger opens a dialog`).toBe(true);
          expect(block.triggerDisabled, `${where}: disabled trigger`).toBe(state === "disabled");
          expect(block.triggerFillsRow, `${where}: trigger fills its row`).toBe(!sm);
          expect(block.termsBesideValues, `${where}: terms beside values`).toBe(sm);
          expect(block.panelPadding, `${where}: panel padding`).toBe(sm ? 32 : 24);
          expect(block.triggerBesideName, `${where}: trigger beside the name`).toBe(lg);
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

        // The drawer is the Drawer primitive at its default placement: pinned
        // to the right edge, full height, as wide as the viewport up to
        // `--container-sm`, with the buttons at its foot, save last.
        const drawer = await openDrawer(page, "default");
        await expect(drawer).toHaveAttribute("data-placement", "right");
        await expect
          .poll(() => drawer.evaluate((el) => el.getBoundingClientRect().right))
          .toBeCloseTo(width, 0);
        const layout = await drawer.evaluate((content) => {
          const rect = content.getBoundingClientRect();
          const style = getComputedStyle(content);
          const cancel = content
            .querySelector('button[type="button"][data-scope="button"]')!
            .getBoundingClientRect();
          const save = content.querySelector('button[type="submit"]')!.getBoundingClientRect();
          return {
            width: rect.width,
            top: rect.top,
            height: rect.height,
            viewport: window.innerHeight,
            footGap: rect.bottom - parseFloat(style.paddingBlockEnd) - save.bottom,
            buttonsInRow: Math.abs(cancel.top - save.top) < 1,
            saveLast: save.left >= cancel.right,
          };
        });
        const where = `${scheme} ${width}px, drawer`;
        expect(layout.width, `${where}: width`).toBeCloseTo(Math.min(width, CONTAINER_SM), 0);
        expect(layout.top, `${where}: top`).toBeCloseTo(0, 0);
        expect(layout.height, `${where}: full height`).toBeCloseTo(layout.viewport, 0);
        expect(Math.abs(layout.footGap), `${where}: buttons at its foot`).toBeLessThan(1);
        expect(layout.buttonsInRow, `${where}: buttons in a row`).toBe(true);
        expect(layout.saveLast, `${where}: save last`).toBe(true);
      });
    }

    test("renders each state inside its drawer", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      const expected: Record<"default" | "empty" | "loading" | "error", Partial<DrawerMetrics>> = {
        default: {
          fields: FIELDS,
          values: [NAME, EMAIL, ROLE, NOTES],
          labels: FIELD_LABELS,
          disabledFields: [],
          invalidFields: [],
          fieldErrors: [],
          alerts: [],
          buttons: ["Cancel", SAVE],
          submitBusy: false,
          submitDisabled: false,
        },
        empty: {
          fields: FIELDS,
          values: [EMPTY_NAME, EMPTY_EMAIL, "", ""],
          invalidFields: [],
          alerts: [],
        },
        loading: {
          fields: FIELDS,
          disabledFields: FIELDS,
          alerts: [],
          buttons: ["Cancel", SAVING],
          submitBusy: true,
          submitDisabled: true,
        },
        error: {
          fields: FIELDS,
          disabledFields: [],
          alerts: [{ role: "alert", title: ERROR }],
          buttons: ["Cancel", SAVE],
          submitBusy: false,
        },
      };
      for (const [state, want] of Object.entries(expected) as Array<
        [keyof typeof expected, Partial<DrawerMetrics>]
      >) {
        const drawer = await openDrawer(page, state);
        const got = await drawerMetrics(drawer);
        for (const [key, value] of Object.entries(want)) {
          expect(got[key as keyof DrawerMetrics], `${scheme} ${state}: ${key}`).toEqual(value);
        }
        await page.keyboard.press("Escape");
        await expect(drawer).toBeHidden();
      }

      await showState(page, "disabled");
      await expect(trigger(page, "disabled")).toBeDisabled();
      await trigger(page, "disabled").click({ force: true });
      await expect(page.getByRole("dialog")).toHaveCount(0);
    });

    test("sits in the middle of its preview", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      for (const state of ["default", "empty", "loading", "error", "disabled"] as const) {
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
        email: "h2 + p",
        term: "dt",
        value: "dd",
        trigger: '[data-scope="button"]',
      });
      await showState(page, "empty");
      ratios = {
        ...ratios,
        ...(await textRatios(page.locator(`[data-demo-state="empty"] ${BLOCK}`), {
          "empty value": "dd",
        })),
      };

      const empty = await openDrawer(page, "empty");
      await empty.getByRole("textbox", { name: "Name" }).fill("");
      await empty.getByRole("textbox", { name: "Email" }).fill("");
      await empty.getByRole("button", { name: SAVE }).click();
      ratios = {
        ...ratios,
        ...(await textRatios(empty, {
          "drawer title": '[data-part="title"]',
          "drawer description": '[data-scope="drawer"][data-part="description"]',
          "field label": '[data-scope="field"][data-part="label"]',
          "field error": '[data-scope="field"][data-part="error-text"]',
          "drawer button": '[data-scope="button"]',
          "close button": '[data-scope="drawer"][data-part="close-trigger"]',
        })),
      };
      await page.keyboard.press("Escape");
      await expect(empty).toBeHidden();

      const failed = await openDrawer(page, "error");
      ratios = {
        ...ratios,
        ...(await textRatios(failed, {
          "error title": '[data-scope="alert"][data-part="title"]',
          "error description": '[data-scope="alert"][data-part="description"]',
        })),
      };

      for (const label of [
        `heading "${NAME}"`,
        `email "${EMAIL}"`,
        'term "Role"',
        `value "${NOTES}"`,
        `empty value "${NOT_ADDED}"`,
        `trigger "${TRIGGER}"`,
        `drawer title "${DRAWER}"`,
        'field error "Enter a name."',
        'field error "Enter an email."',
        `drawer button "${SAVE}"`,
        `error title "${ERROR}"`,
      ]) {
        expect(ratios[label], `${scheme}: ${label} measured`).toBeDefined();
      }
      for (const [what, ratio] of Object.entries(ratios)) {
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
      }
    });

    test("shows hover and focus-visible on the trigger, a field and the close button", async ({
      page,
    }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const button = trigger(page, "default");

      // The outline Button takes the --accent fill on hover.
      const fill = (target: Locator) =>
        target.evaluate((el) => getComputedStyle(el).backgroundColor);
      const resting = await fill(button);
      await button.hover();
      expect(await fill(button), `${scheme}: trigger hover fill`).not.toBe(resting);

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
      const drawer = page.getByRole("dialog", { name: DRAWER });
      await expect(drawer).toBeVisible();
      const email = drawer.getByRole("textbox", { name: "Email" });
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

      const close = drawer.getByRole("button", { name: "Close" });
      const closeResting = await fill(close);
      await close.hover();
      expect(await fill(close), `${scheme}: close button hover fill`).not.toBe(closeResting);
      await close.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const closeRing = await close.evaluate((el) => ({
        focused: el.matches(":focus-visible"),
        style: getComputedStyle(el).outlineStyle,
      }));
      expect(closeRing.focused, `${scheme}: keyboard focus on the close button`).toBe(true);
      expect(closeRing.style, `${scheme}: close button focus ring`).not.toBe("none");
    });

    test("names the drawer, drops unsaved edits and hands focus back", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      const drawer = await openDrawer(page, "default");
      await expect(drawer).toHaveAccessibleDescription(DRAWER_DESCRIPTION);
      expect(
        await drawer.evaluate((el) => el.contains(document.activeElement)),
        `${scheme}: focus moves into the drawer`,
      ).toBe(true);

      const close = [
        () => drawer.getByRole("button", { name: "Cancel" }).click(),
        () => drawer.getByRole("button", { name: "Close" }).click(),
        () => page.keyboard.press("Escape"),
      ];
      for (const closeDrawer of close) {
        await drawer.getByRole("textbox", { name: "Name" }).fill("Someone else");
        await closeDrawer();
        await expect(drawer).toBeHidden();
        await expect(trigger(page, "default")).toBeFocused();
        await trigger(page, "default").click();
        await expect(drawer).toBeVisible();
        await expect(drawer.getByRole("textbox", { name: "Name" })).toHaveValue(NAME);
      }
      await page.keyboard.press("Escape");
      await expect(page.locator(`[data-demo-state="default"] ${BLOCK} h2`)).toHaveText(NAME);
    });

    test("refuses a form without a name or email, then saves a filled one", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      const drawer = await openDrawer(page, "default");
      const name = drawer.getByRole("textbox", { name: "Name" });
      const email = drawer.getByRole("textbox", { name: "Email" });

      await name.fill("   ");
      await email.fill("");
      await drawer.getByRole("button", { name: SAVE }).click();
      await expect(drawer).toBeVisible();
      await expect(name).toHaveAttribute("aria-invalid", "true");
      await expect(email).toHaveAttribute("aria-invalid", "true");
      await expect(name).toBeFocused();
      await expect(name).toHaveAccessibleDescription(/Enter a name\./);
      await expect(email).toHaveAccessibleDescription(/Enter an email\./);
      await expect(drawer.getByRole("textbox", { name: "Role" })).not.toHaveAttribute(
        "aria-invalid",
        "true",
      );
      await expect(drawer.getByRole("textbox", { name: "Role" })).toHaveValue(ROLE);

      await name.fill("  Ada King  ");
      await email.fill("ada.king@example.com");
      await drawer.getByRole("textbox", { name: "Role" }).fill("");
      await email.press("Enter");
      await expect(drawer).toBeHidden();
      await expect(trigger(page, "default")).toBeFocused();

      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      await expect(block.locator("h2")).toHaveText("Ada King");
      await expect(block.locator("h2 + p")).toHaveText("ada.king@example.com");
      await expect(block.locator("dd")).toHaveText([NOT_ADDED, NOTES]);

      await trigger(page, "default").click();
      await expect(drawer).toBeVisible();
      await expect(name).toHaveValue("Ada King");
      await expect(name).not.toHaveAttribute("aria-invalid", "true");
    });

    test("keeps what was typed after a failed save and clears the error", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      const drawer = await openDrawer(page, "error");
      await expect(drawer.getByRole("alert")).toContainText(ERROR);

      await drawer.getByRole("textbox", { name: "Name" }).fill("Ada King");
      await drawer.getByRole("button", { name: SAVE }).click();
      await expect(drawer.getByRole("alert")).toHaveCount(0);
      await expect(drawer).toBeVisible();
      await expect(drawer.getByRole("textbox", { name: "Name" })).toHaveValue("Ada King");
    });

    test("announces the busy save", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      const drawer = await openDrawer(page, "loading");
      const save = drawer.locator('button[type="submit"]');
      await expect(save).toHaveAttribute("aria-busy", "true");
      await expect(save).toBeDisabled();
      await expect(save).toHaveText(SAVING);
      await expect(drawer.getByRole("button", { name: "Cancel" })).toBeEnabled();
    });
  });
}
