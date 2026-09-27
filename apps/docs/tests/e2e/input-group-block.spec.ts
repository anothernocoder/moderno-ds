/**
 * The input-group block, checked on the built docs page at the three widths of
 * the responsive policy (375 / 768 / 1280) in both colour schemes. It asserts
 * text and computed styles; no screenshot baseline is committed.
 *
 * Five claims:
 *
 * 1. **Container, not viewport.** At `--container-sm` the block takes more
 *    room between its parts; at `--container-md` the heading steps up a size
 *    and the groups sit two to a row; at `--container-lg` the heading moves
 *    beside the groups. Each copy on the page is measured against its own
 *    container width, so the narrow frame stays one column at 1280 while the
 *    wide frame is split.
 * 2. **Each input and its add-ons read as one control**: the same height, no
 *    gap between them, square inner corners and the input's own radius on the
 *    outer ones; an invalid field turns its add-ons' edge red with the input.
 * 3. **Every state renders what it claims**, at every width: sample values,
 *    placeholders with Copy disabled when empty, a spinner on a busy Search
 *    while loading, messages under the invalid fields on error, and every
 *    control inert when disabled. Every copy sits centred in its box.
 * 4. **AA contrast** in both schemes on every text the block paints.
 * 5. **Hover, focus-visible and naming** on the inputs and both buttons.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/input-group/";

const BLOCK = "section.moderno-block-input-group";

/** The labels of the four groups, in source order. */
const LABELS = ["Store address", "Price", "API key", "Find a product"];

/** The fixed text on either side of each input, in source order. */
const ADD_ONS = [["https://"], ["$", "USD"], [], []];

interface GroupMetrics {
  label: string;
  value: string;
  placeholder: string;
  disabled: boolean;
  invalid: boolean;
  /** The error message under the group, when one renders. */
  error: string | null;
  /** The text add-ons beside the input. */
  addOns: string[];
  /** Whether every add-on's edge is the input's own edge colour. */
  addOnsShareEdge: boolean;
  /** Every part of the row (add-ons, input, button) has the input's height. */
  sameHeight: boolean;
  /** No gap between neighbouring parts of the row. */
  flush: boolean;
  /** Inner corners square, outer corners at the input's own radius. */
  joinedCorners: boolean;
}

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  heading: string;
  /** Whether the heading is set at `--text-heading-sm` rather than `--text-body-lg`. */
  largeHeading: boolean;
  /** Groups side by side on the first row of the fields grid. */
  groupsPerRow: number;
  /** Whether the heading sits left of the groups rather than over them. */
  headingBeside: boolean;
  /** Whether the room between the parts is the `@sm` step's (gap-8), not gap-6. */
  roomyGaps: boolean;
  groups: GroupMetrics[];
  copy: { label: string; name: string | null; disabled: boolean };
  search: { label: string; disabled: boolean; busy: string | null; spinner: boolean };
  /** The block's left/right and top/bottom room inside its preview box, in px. */
  offCentre: { x: number; y: number } | null;
}

/**
 * The page's previews (islands/InputGroupBlockDemo.svelte): the main preview
 * mounts the default; the Examples frame the same block at 18rem, 30rem, 40rem
 * and 50rem, then mount the empty, loading, error and disabled states. Every
 * copy is found by the `data-demo-state` its wrapper carries.
 */
const STATES = [
  "default",
  "narrow",
  "compact",
  "two-up",
  "wide",
  "empty",
  "loading",
  "error",
  "disabled",
] as const;
type State = (typeof STATES)[number];

/** The copies that sit alone in their preview box, so centring is theirs to keep. */
const ALONE: readonly State[] = ["default", "empty", "loading", "error", "disabled"];

async function showState(page: Page, state: State): Promise<void> {
  const block = page.locator(`[data-demo-state="${state}"] ${BLOCK}`);
  await block.scrollIntoViewIfNeeded();
  await block.waitFor({ state: "visible" });
}

async function blockMetrics(page: Page, state: State): Promise<BlockMetrics[]> {
  return page.evaluate(
    ({ state, selector, alone }) => {
      const panel = document.querySelector(`[data-demo-state="${state}"]`);
      if (!panel) throw new Error(`no preview for the ${state} state on the page`);

      return [...panel.querySelectorAll<HTMLElement>(selector)].map((section) => {
        // Reads what a token or utility resolves to inside this block, so the
        // spec compares against the theme on the page rather than a literal.
        const probe = (style: Partial<CSSStyleDeclaration>) => {
          const el = document.createElement("span");
          Object.assign(el.style, style);
          section.append(el);
          const computed = getComputedStyle(el);
          const read = {
            fontSize: computed.fontSize,
            rowGap: computed.rowGap,
            radius: computed.borderTopLeftRadius,
          };
          el.remove();
          return read;
        };

        const heading = section.querySelector("h2")!;
        const header = heading.closest("header")!;
        const fields = header.nextElementSibling as HTMLElement;
        const outer = header.parentElement!;
        const roots = [
          ...section.querySelectorAll<HTMLElement>('[data-scope="field"][data-part="root"]'),
        ];

        const groups = roots.map((root) => {
          const input = root.querySelector<HTMLInputElement>('[data-part="input"]')!;
          const row = input.parentElement!;
          const parts = [...row.children] as HTMLElement[];
          const addOns = parts.filter((part) => part.tagName === "SPAN");
          const inputStyle = getComputedStyle(input);
          const radius = probe({ borderTopLeftRadius: "var(--radius)" }).radius;

          const boxes = parts.map((part) => part.getBoundingClientRect());
          const joinedCorners = parts.every((part, i) => {
            const style = getComputedStyle(part);
            const first = i === 0;
            const last = i === parts.length - 1;
            const expect = (outerEdge: boolean) => (outerEdge ? radius : "0px");
            return (
              style.borderStartStartRadius === expect(first) &&
              style.borderEndStartRadius === expect(first) &&
              style.borderStartEndRadius === expect(last) &&
              style.borderEndEndRadius === expect(last)
            );
          });

          return {
            label: root.querySelector('[data-part="label"]')?.textContent?.trim() ?? "",
            value: input.value,
            placeholder: input.placeholder,
            disabled: input.disabled,
            invalid: input.getAttribute("aria-invalid") === "true",
            error: root.querySelector('[data-part="error-text"]')?.textContent?.trim() || null,
            addOns: addOns.map((addOn) => addOn.textContent?.trim() ?? ""),
            addOnsShareEdge: addOns.every(
              (addOn) => getComputedStyle(addOn).borderTopColor === inputStyle.borderTopColor,
            ),
            sameHeight: boxes.every((box) => Math.abs(box.height - boxes[0]!.height) < 0.5),
            flush: boxes.every(
              (box, i) => i === 0 || Math.abs(box.left - boxes[i - 1]!.right) < 0.5,
            ),
            joinedCorners,
          };
        });

        const tops = roots.map((root) => Math.round(root.getBoundingClientRect().top));
        const [copy, search] = [...section.querySelectorAll<HTMLButtonElement>("button")];
        // The visible label a reader hears: text outside any aria-hidden part.
        const spokenText = (el: Element): string => {
          const clone = el.cloneNode(true) as Element;
          clone.querySelectorAll('[aria-hidden="true"]').forEach((hidden) => hidden.remove());
          return clone.textContent?.trim() ?? "";
        };

        let offCentre: { x: number; y: number } | null = null;
        if (alone) {
          const box = section.closest(".preview-panel--demo")!.getBoundingClientRect();
          const own = section.getBoundingClientRect();
          offCentre = {
            x: Math.abs(own.left - box.left - (box.right - own.right)),
            y: Math.abs(own.top - box.top - (box.bottom - own.bottom)),
          };
        }

        return {
          containerWidth: section.getBoundingClientRect().width,
          heading: heading.textContent?.trim() ?? "",
          largeHeading:
            getComputedStyle(heading).fontSize ===
            probe({ fontSize: "var(--text-heading-sm)" }).fontSize,
          groupsPerRow: tops.filter((top) => top === tops[0]).length,
          headingBeside:
            header.getBoundingClientRect().right <= fields.getBoundingClientRect().left,
          roomyGaps:
            getComputedStyle(outer).rowGap === probe({ rowGap: "calc(var(--spacing) * 8)" }).rowGap,
          groups,
          copy: {
            label: spokenText(copy!),
            name: copy!.getAttribute("aria-label"),
            disabled: copy!.disabled,
          },
          search: {
            label: spokenText(search!),
            disabled: search!.disabled,
            busy: search!.getAttribute("aria-busy"),
            spinner: search!.querySelector('[data-scope="spinner"]') !== null,
          },
          offCentre,
        };
      });
    },
    { state, selector: BLOCK, alone: ALONE.includes(state) },
  );
}

async function textRatios(
  page: Page,
  state: "default" | "empty" | "error",
): Promise<Record<string, number>> {
  await showState(page, state);
  return page.evaluate(
    ({ state, selector }) => {
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

      const block = document.querySelector(`[data-demo-state="${state}"] ${selector}`);
      if (!block) throw new Error(`the ${state} input-group demo did not render`);

      const all = (query: string): Element[] => {
        const found = [...block.querySelectorAll(query)];
        if (found.length === 0) throw new Error(`${state}: missing ${query}`);
        return found;
      };
      const against = (el: Element, pseudo?: string) =>
        ratio(getComputedStyle(el, pseudo).color, surfaceOf(el));

      const ratios: Record<string, number> = {
        [`${state} heading`]: against(all("h2")[0]!),
        [`${state} intro`]: against(all("header p")[0]!),
      };
      all('[data-part="label"]').forEach((el, i) => {
        ratios[`${state} label ${i}`] = against(el);
      });
      all('[data-part="helper-text"]').forEach((el, i) => {
        ratios[`${state} helper ${i}`] = against(el);
      });
      all('[data-scope="field"] span:not([data-part])').forEach((el, i) => {
        ratios[`${state} add-on ${i}`] = against(el);
      });
      all('[data-part="input"]').forEach((el, i) => {
        const input = el as HTMLInputElement;
        ratios[`${state} input ${i}`] = input.value
          ? against(input)
          : against(input, "::placeholder");
      });
      all("button:not(:disabled)").forEach((el, i) => {
        ratios[`${state} button ${i}`] = against(el);
      });
      if (state === "error") {
        all('[data-part="error-text"]').forEach((el, i) => {
          ratios[`error message ${i}`] = against(el);
        });
      }
      return ratios;
    },
    { state, selector: BLOCK },
  );
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`input-group — ${scheme}`, () => {
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
          const block = { ...mounted[0]!, state };
          blocks.push(block);
          const where = `${scheme} ${width}px, ${state} (${block.containerWidth}px)`;

          expect(block.heading, `${where}: heading`).toBe("Storefront");
          expect(block.roomyGaps, `${where}: room between parts`).toBe(
            block.containerWidth >= CONTAINER_SM,
          );
          expect(block.largeHeading, `${where}: heading size`).toBe(
            block.containerWidth >= CONTAINER_MD,
          );
          expect(block.groupsPerRow, `${where}: groups per row`).toBe(
            block.containerWidth >= CONTAINER_MD ? 2 : 1,
          );
          expect(block.headingBeside, `${where}: heading beside the groups`).toBe(
            block.containerWidth >= CONTAINER_LG,
          );

          expect(
            block.groups.map((group) => group.label),
            `${where}: groups`,
          ).toEqual(LABELS);
          expect(
            block.groups.map((group) => group.addOns),
            `${where}: add-ons`,
          ).toEqual(ADD_ONS);
          for (const group of block.groups) {
            const part = `${where}, ${group.label}`;
            expect(group.sameHeight, `${part}: one height`).toBe(true);
            expect(group.flush, `${part}: no gap between parts`).toBe(true);
            expect(group.joinedCorners, `${part}: joined corners`).toBe(true);
            expect(group.addOnsShareEdge, `${part}: add-ons share the edge`).toBe(true);
          }

          if (block.offCentre) {
            expect(block.offCentre.x, `${where}: centred across`).toBeLessThanOrEqual(2);
            expect(block.offCentre.y, `${where}: centred down`).toBeLessThanOrEqual(2);
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

        const byState = (state: State) => blocks.find((block) => block.state === state)!;
        const values = (state: State) => byState(state).groups.map((group) => group.value);
        const live = (state: State) =>
          byState(state).groups.every((group) => !group.disabled) &&
          !byState(state).copy.disabled &&
          !byState(state).search.disabled;

        for (const state of ["default", "narrow", "compact", "two-up", "wide"] as const) {
          expect(values(state), `${state}: sample values`).toEqual([
            "acme.shop",
            "49.00",
            "mdn_pub_5c1e8a93d0b74f2a",
            "",
          ]);
          expect(live(state), `${state}: every control live`).toBe(true);
        }

        const empty = byState("empty");
        expect(values("empty"), "empty: no values").toEqual(["", "", "", ""]);
        expect(
          empty.groups.map((group) => group.placeholder),
          "empty: placeholders",
        ).toEqual(["your-shop.com", "0.00", "No key yet", "Name or SKU"]);
        expect(empty.copy.disabled, "empty: nothing to copy").toBe(true);
        expect(empty.search.disabled, "empty: search stays live").toBe(false);

        const loading = byState("loading");
        expect(loading.search, "loading: a busy Search").toEqual({
          label: "Searching",
          disabled: true,
          busy: "true",
          spinner: true,
        });
        expect(
          loading.groups.every((group) => group.disabled),
          "loading: inputs inert",
        ).toBe(true);
        expect(loading.groups[3]!.value, "loading: the query stays").toBe("Linen shirt");

        const error = byState("error");
        expect(
          error.groups.map((group) => group.invalid),
          "error: invalid groups",
        ).toEqual([true, true, false, true]);
        expect(
          error.groups.map((group) => group.error),
          "error: messages",
        ).toEqual([
          "Enter an address like acme.shop, without spaces.",
          "Enter a price above zero.",
          null,
          "Type at least two letters.",
        ]);
        expect(live("error"), "error: every control live").toBe(true);

        const disabled = byState("disabled");
        expect(
          disabled.groups.every((group) => group.disabled),
          "disabled: inputs",
        ).toBe(true);
        expect(disabled.copy.disabled && disabled.search.disabled, "disabled: buttons").toBe(true);
        expect(disabled.search.spinner, "disabled: no spinner").toBe(false);

        for (const block of blocks) {
          expect(block.copy, `${block.state}: Copy`).toMatchObject({
            label: "Copy",
            name: "Copy API key",
          });
          if (block.state !== "loading") {
            expect(block.search, `${block.state}: Search`).toMatchObject({
              label: "Search",
              busy: "false",
              spinner: false,
            });
          }
          if (block.state !== "error") {
            expect(
              block.groups.some((group) => group.invalid || group.error),
              `${block.state}: nothing invalid`,
            ).toBe(false);
          }
        }

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

    test("turns an invalid field's add-ons red with its input", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "error");
      const edges = await page.evaluate((selector) => {
        const block = document.querySelector(`[data-demo-state="error"] ${selector}`)!;
        const probe = document.createElement("span");
        probe.style.borderTopColor = "var(--destructive)";
        probe.style.borderTopStyle = "solid";
        block.append(probe);
        const destructive = getComputedStyle(probe).borderTopColor;
        probe.remove();
        return [...block.querySelectorAll('[data-scope="field"] span:not([data-part])')].map(
          (addOn) => getComputedStyle(addOn).borderTopColor === destructive,
        );
      }, BLOCK);
      expect(edges, `${scheme}: https://, $ and USD in --destructive`).toEqual([true, true, true]);
    });

    test("clears AA contrast on every text it paints", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      let ratios: Record<string, number> = {};
      for (const state of ["default", "empty", "error"] as const) {
        ratios = { ...ratios, ...(await textRatios(page, state)) };
      }
      for (const measured of [
        "default add-on 2",
        "default input 2",
        "default button 1",
        "empty input 0",
        "error message 2",
      ]) {
        expect(ratios[measured], `${scheme}: ${measured} measured`).toBeDefined();
      }
      for (const [what, ratio] of Object.entries(ratios)) {
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
      }
    });

    test("shows hover and focus-visible on its inputs and buttons", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);

      const input = block.getByLabel("Store address");
      const border = () => input.evaluate((el) => getComputedStyle(el).borderTopColor);
      const restingBorder = await border();
      await input.hover();
      expect(await border(), `${scheme}: input hover border`).not.toBe(restingBorder);

      for (const name of ["Copy API key", "Search"]) {
        const button = block.getByRole("button", { name, exact: true });
        // Outline buttons tint their fill on hover; solid ones darken through `filter`.
        const paint = () =>
          button.evaluate((el) => {
            const style = getComputedStyle(el);
            return `${style.backgroundColor} ${style.filter}`;
          });
        await page.mouse.move(0, 0);
        const resting = await paint();
        await button.hover();
        expect(await paint(), `${scheme}: ${name} hover paint`).not.toBe(resting);
      }

      await page.mouse.move(0, 0);
      await input.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      for (const name of [
        "Store address",
        "Price",
        "API key",
        "Copy API key",
        "Find a product",
        "Search",
      ]) {
        const focused = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement;
          return {
            name:
              el.getAttribute("aria-label") ??
              (el as HTMLInputElement).labels?.[0]?.textContent?.trim() ??
              el.textContent?.trim(),
            visible: el.matches(":focus-visible"),
            outline: getComputedStyle(el).outlineStyle,
          };
        });
        expect(focused.name, `${scheme}: tab order`).toBe(name);
        expect(focused.visible, `${scheme}: ${name} keyboard focus`).toBe(true);
        expect(focused.outline, `${scheme}: ${name} focus ring`).not.toBe("none");
        await page.keyboard.press("Tab");
      }
    });

    test("labels every input and names the search", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      for (const label of LABELS) {
        await expect(block.getByLabel(label, { exact: true })).toHaveCount(1);
      }
      await expect(block.getByLabel("API key", { exact: true })).toHaveAttribute("readonly", "");
      const search = block.getByRole("search");
      await expect(search.getByRole("searchbox", { name: "Find a product" })).toBeVisible();
      await expect(search.getByRole("button", { name: "Search" })).toHaveAttribute(
        "type",
        "submit",
      );
    });
  });
}
