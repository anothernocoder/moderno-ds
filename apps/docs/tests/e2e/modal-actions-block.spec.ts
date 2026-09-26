/**
 * The modal-actions block, checked on the built docs page at the three widths
 * of the responsive policy (375 / 768 / 1280) in both colour schemes. It
 * asserts text and computed styles; no screenshot baseline is committed.
 *
 * Five claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` each row button sits
 *    under its text; at `--container-sm` it moves beside its text and the
 *    list's padding grows; at `--container-md` the heading steps up a size;
 *    at `--container-lg` the heading moves into a column beside the list.
 *    Each copy on the page is measured against its own container width. A
 *    dialog is a container too: its buttons stack below `--container-sm` and
 *    sit in a row from there on.
 * 2. **Every state renders what it claims**, at every width: one outline
 *    button per row that opens a dialog, the Irreversible badge on the
 *    destructive row only, an empty message, skeleton rows in a busy region
 *    while loading, one alert with a retry on a failed load, and rows whose
 *    every button is inert when disabled.
 * 3. **AA contrast** in both schemes on every text the block paints, the
 *    dialogs included.
 * 4. **Hover and focus-visible** on a row button.
 * 5. **The dialogs themselves**: a confirmation is a `dialog`, a destructive
 *    one an `alertdialog`, each named by its title and described by its
 *    description; Cancel and Escape close it and hand focus back to the row
 *    button; a form dialog refuses an empty value — the field turns invalid,
 *    shows its error and takes focus — and closes on a filled one.
 */
import { expect, test, type Locator, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/modal-actions/";

const BLOCK = "section.moderno-block-modal-actions";

/** The sample list the block ships with, in order. */
const TITLES = ["Workspace name", "Export data", "Delete workspace"];
const TRIGGERS = ["Rename", "Export", "Delete"];

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** The row titles, in order. */
  titles: string[];
  /** The label of each row button, in row order. */
  triggers: string[];
  /** The `data-variant` of each row button, in row order. */
  triggerVariants: string[];
  /** Whether each row button says it opens a dialog, in row order. */
  opensDialog: boolean[];
  /** The titles of the rows carrying the Irreversible badge. */
  irreversible: string[];
  /** Whether the first row button sits on its text's line rather than below it. */
  buttonBesideText: boolean | null;
  /** The list's inline padding, in px. */
  panelPadding: number;
  /** The heading's font size, in px. */
  headingSize: number;
  /** Whether the heading column sits beside the list rather than above it. */
  headingBesidePanel: boolean;
  /** Whether every row button in this copy is disabled. */
  allTriggersInert: boolean;
  /** Skeleton rows inside a busy status region, each hidden from assistive tech. */
  skeletonRows: number;
  /** Whether this copy renders the "No actions yet" message. */
  emptyMessage: boolean;
  /** Whether this copy renders an alert in place of the rows. */
  panelAlert: boolean;
}

/**
 * The page's previews (islands/ModalActionsBlockDemo.svelte): the main
 * preview mounts the default; the Examples frame the same block at 18rem,
 * 30rem, 40rem and 50rem, then mount the empty, loading, error and disabled
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
      const panel = document.querySelector(`[data-demo-state="${state}"]`);
      if (!panel) throw new Error(`no preview for the ${state} state on the page`);
      return [...panel.querySelectorAll<HTMLElement>(selector)].map((section) => {
        const heading = section.querySelector("h2");
        const header = heading?.parentElement;
        const card = section.querySelector<HTMLElement>('[data-scope="card"][data-part="root"]');
        const content = card?.querySelector<HTMLElement>(
          '[data-scope="card"][data-part="content"]',
        );
        if (!heading || !header || !card || !content) {
          throw new Error("the modal-actions block did not render its own markup");
        }

        const rows = [...content.querySelectorAll<HTMLElement>("ul > li")];
        const busy = content.querySelector('[role="status"][aria-busy="true"]');
        const skeletons = busy
          ? [...busy.querySelectorAll<HTMLElement>(':scope > [aria-hidden="true"]')].filter(
              (row) => row.querySelector('[data-scope="skeleton"]') !== null,
            )
          : [];

        const triggerOf = (row: Element) =>
          row.querySelector<HTMLButtonElement>('[data-scope="button"][aria-haspopup]');
        const titleOf = (row: Element) => row.querySelector("p.font-medium");

        const firstRow = rows[0];
        const firstTrigger = firstRow ? triggerOf(firstRow) : null;
        const firstTitle = firstRow ? titleOf(firstRow) : null;
        const buttonBesideText =
          firstTrigger && firstTitle
            ? firstTrigger.getBoundingClientRect().top < firstTitle.getBoundingClientRect().bottom
            : null;

        const triggers = rows.flatMap((row) => {
          const trigger = triggerOf(row);
          return trigger ? [trigger] : [];
        });

        return {
          containerWidth: section.offsetWidth,
          titles: rows.map((row) => titleOf(row)?.textContent?.trim() ?? ""),
          triggers: triggers.map((trigger) => trigger.textContent?.trim() ?? ""),
          triggerVariants: triggers.map((trigger) => trigger.getAttribute("data-variant") ?? ""),
          opensDialog: triggers.map(
            (trigger) => trigger.getAttribute("aria-haspopup") === "dialog",
          ),
          irreversible: rows
            .filter((row) => row.querySelector('[data-scope="badge"]') !== null)
            .map((row) => titleOf(row)?.textContent?.trim() ?? ""),
          buttonBesideText,
          panelPadding: parseFloat(getComputedStyle(content).paddingInlineStart),
          headingSize: parseFloat(getComputedStyle(heading).fontSize),
          headingBesidePanel:
            card.getBoundingClientRect().left >= header.getBoundingClientRect().right,
          allTriggersInert: triggers.length > 0 && triggers.every((el) => el.disabled),
          skeletonRows: skeletons.length,
          emptyMessage:
            rows.length === 0 && content.textContent?.includes("No actions yet") === true,
          panelAlert:
            rows.length === 0 &&
            content.querySelector('[data-scope="alert"][data-part="root"]') !== null,
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

/** The row button of `title` in the default copy. */
function rowTrigger(page: Page, name: string): Locator {
  return page
    .locator(`[data-demo-state="default"] ${BLOCK} ul > li`)
    .getByRole("button", { name, exact: true });
}

/** Open the dialog behind a row button of the default copy and return it. */
async function openDialog(
  page: Page,
  trigger: string,
  role: "dialog" | "alertdialog",
  name: string,
): Promise<Locator> {
  await showState(page, "default");
  await rowTrigger(page, trigger).click();
  const dialog = page.getByRole(role, { name });
  await expect(dialog).toBeVisible();
  return dialog;
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`modal-actions — ${scheme}`, () => {
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
          if (block.buttonBesideText !== null) {
            expect(block.buttonBesideText, `${where}: button beside text`).toBe(sm);
          }
          expect(block.panelPadding, `${where}: list padding`).toBe(sm ? 24 : 16);
          expect(block.headingBesidePanel, `${where}: heading beside list`).toBe(
            block.containerWidth >= CONTAINER_LG,
          );

          if (block.titles.length > 0) {
            expect(block.titles, `${where}: titles`).toEqual(TITLES);
            expect(block.triggers, `${where}: row buttons`).toEqual(TRIGGERS);
            expect(block.triggerVariants, `${where}: row button variants`).toEqual([
              "outline",
              "outline",
              "outline",
            ]);
            expect(block.opensDialog, `${where}: row buttons open dialogs`).toEqual([
              true,
              true,
              true,
            ]);
            expect(block.irreversible, `${where}: irreversible rows`).toEqual(["Delete workspace"]);
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

        const lists = blocks.filter((block) => block.titles.length > 0);
        expect(lists.length, `${scheme} ${width}px: copies rendering rows`).toBe(6);
        expect(blocks.filter((block) => block.emptyMessage).length, "the empty render").toBe(1);
        expect(
          blocks.filter((block) => block.skeletonRows === 3).length,
          "the loading render",
        ).toBe(1);
        expect(blocks.filter((block) => block.panelAlert).length, "the failed-load render").toBe(1);
        expect(
          lists.filter((block) => block.allTriggersInert).map((block) => block.state),
          "the disabled render",
        ).toEqual(["disabled"]);

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

        // The dialog is a container of its own: its buttons stack, confirm on
        // top and full width, until its content box reaches `--container-sm`.
        const dialog = await openDialog(page, "Delete", "alertdialog", "Delete this workspace?");
        const footer = await dialog.evaluate((content) => {
          const buttons = [...content.querySelectorAll<HTMLElement>('[data-scope="button"]')];
          const [cancel, confirm] = buttons.map((b) => b.getBoundingClientRect());
          const style = getComputedStyle(content);
          const box =
            content.clientWidth -
            parseFloat(style.paddingInlineStart) -
            parseFloat(style.paddingInlineEnd);
          return {
            labels: buttons.map((b) => b.textContent?.trim()),
            box,
            inRow: Math.abs(cancel!.top - confirm!.top) < 1,
            confirmFirst: confirm!.bottom <= cancel!.top || confirm!.right <= cancel!.left,
            confirmLast: confirm!.left >= cancel!.right,
            fullWidth: Math.abs(confirm!.width - box) < 1 && Math.abs(cancel!.width - box) < 1,
          };
        });
        expect(footer.labels, `${scheme} ${width}px: dialog buttons`).toEqual([
          "Cancel",
          "Delete workspace",
        ]);
        const row = footer.box >= CONTAINER_SM;
        expect(footer.inRow, `${scheme} ${width}px: dialog buttons in a row`).toBe(row);
        if (row) {
          expect(footer.confirmLast, `${scheme} ${width}px: confirm last`).toBe(true);
        } else {
          expect(footer.confirmFirst, `${scheme} ${width}px: confirm on top`).toBe(true);
          expect(footer.fullWidth, `${scheme} ${width}px: stacked full width`).toBe(true);
        }
      });
    }

    test("clears AA contrast on every text it paints", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      let ratios: Record<string, number> = {};

      await showState(page, "default");
      ratios = {
        ...ratios,
        ...(await textRatios(page.locator(`[data-demo-state="default"] ${BLOCK}`), {
          heading: "h2",
          "heading description": "h2 + p",
          title: "ul > li p.font-medium",
          description: "ul > li [id$='-description']",
          badge: '[data-scope="badge"]',
          "row button": 'ul > li [data-scope="button"]',
        })),
      };

      await showState(page, "empty");
      ratios = {
        ...ratios,
        ...(await textRatios(page.locator(`[data-demo-state="empty"] ${BLOCK}`), {
          "empty line": '[data-scope="card"][data-part="content"] p',
        })),
      };

      await showState(page, "error");
      ratios = {
        ...ratios,
        ...(await textRatios(page.locator(`[data-demo-state="error"] ${BLOCK}`), {
          "failed title": '[data-scope="alert"][data-part="title"]',
          "failed description": '[data-scope="alert"][data-part="description"]',
          "failed action": '[data-scope="alert"] [data-scope="button"]',
        })),
      };

      const rename = await openDialog(page, "Rename", "dialog", "Rename workspace");
      await rename.getByRole("textbox").fill("");
      await rename.getByRole("button", { name: "Save" }).click();
      ratios = {
        ...ratios,
        ...(await textRatios(rename, {
          "dialog title": '[data-part="title"]',
          "dialog description": '[data-part="description"]',
          "field label": '[data-scope="field"][data-part="label"]',
          "field error": '[data-scope="field"][data-part="error-text"]',
          "dialog button": '[data-scope="button"]',
        })),
      };
      await page.keyboard.press("Escape");
      await expect(rename).toBeHidden();

      const remove = await openDialog(page, "Delete", "alertdialog", "Delete this workspace?");
      ratios = {
        ...ratios,
        ...(await textRatios(remove, { "destructive button": '[data-variant="destructive"]' })),
      };

      for (const title of TITLES) {
        expect(ratios[`title "${title}"`], `${scheme}: ${title} measured`).toBeDefined();
      }
      expect(ratios['badge "Irreversible"'], `${scheme}: badge measured`).toBeDefined();
      expect(ratios['field error "Enter a value to continue."']).toBeDefined();
      expect(ratios['destructive button "Delete workspace"']).toBeDefined();
      for (const [what, ratio] of Object.entries(ratios)) {
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
      }
    });

    test("shows hover and focus-visible on a row button", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const exportButton = rowTrigger(page, "Export");

      const background = () => exportButton.evaluate((el) => getComputedStyle(el).backgroundColor);
      const resting = await background();
      await exportButton.hover();
      expect(await background(), `${scheme}: hover background`).not.toBe(resting);

      await page.mouse.move(0, 0);
      await exportButton.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const outline = await exportButton.evaluate((el) => ({
        focused: el.matches(":focus-visible"),
        style: getComputedStyle(el).outlineStyle,
      }));
      expect(outline.focused, `${scheme}: keyboard focus`).toBe(true);
      expect(outline.style, `${scheme}: focus ring`).not.toBe("none");
    });

    test("describes each row button by its row description", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      await expect(rowTrigger(page, "Export")).toHaveAccessibleDescription(
        "Download every document and comment as one archive.",
      );
      await expect(rowTrigger(page, "Delete")).toHaveAccessibleDescription(
        "Remove the workspace, its documents and its members for good.",
      );
    });

    test("confirms in a dialog and hands focus back on cancel", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      const dialog = await openDialog(page, "Export", "dialog", "Export your data?");
      await expect(dialog).toHaveAccessibleDescription(
        "We will email you a link to the archive when it is ready.",
      );
      expect(
        await dialog.evaluate((el) => el.contains(document.activeElement)),
        `${scheme}: focus moves into the dialog`,
      ).toBe(true);
      await expect(dialog.getByRole("button", { name: "Export" })).toHaveAttribute(
        "data-variant",
        "primary",
      );

      await dialog.getByRole("button", { name: "Cancel" }).click();
      await expect(dialog).toBeHidden();
      await expect(rowTrigger(page, "Export")).toBeFocused();

      await rowTrigger(page, "Export").click();
      await page
        .getByRole("dialog", { name: "Export your data?" })
        .getByRole("button", {
          name: "Export",
        })
        .click();
      await expect(page.getByRole("dialog", { name: "Export your data?" })).toBeHidden();
    });

    test("warns in an alertdialog before a destructive action", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      const dialog = await openDialog(page, "Delete", "alertdialog", "Delete this workspace?");
      await expect(dialog).toHaveAccessibleDescription(
        "Every document, comment and member goes with it. This cannot be undone.",
      );
      await expect(dialog.getByRole("button", { name: "Delete workspace" })).toHaveAttribute(
        "data-variant",
        "destructive",
      );
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(rowTrigger(page, "Delete")).toBeFocused();
    });

    test("refuses an empty value in the form dialog, then saves", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      const dialog = await openDialog(page, "Rename", "dialog", "Rename workspace");
      const input = dialog.getByRole("textbox", { name: "Workspace name" });
      await expect(input).toHaveValue("Acme");
      await expect(dialog.getByText("Enter a value to continue.")).toHaveCount(0);

      await input.fill("   ");
      await dialog.getByRole("button", { name: "Save" }).click();
      await expect(dialog).toBeVisible();
      await expect(input).toHaveAttribute("aria-invalid", "true");
      await expect(input).toBeFocused();
      await expect(dialog.getByText("Enter a value to continue.")).toBeVisible();
      await expect(input).toHaveAccessibleDescription(/Enter a value to continue\./);

      await input.fill("Acme Inc");
      await input.press("Enter");
      await expect(dialog).toBeHidden();
      await expect(rowTrigger(page, "Rename")).toBeFocused();

      // A fresh open starts clean: the first value back and no error.
      await rowTrigger(page, "Rename").click();
      const reopened = page.getByRole("dialog", { name: "Rename workspace" });
      await expect(reopened.getByRole("textbox")).toHaveValue("Acme");
      await expect(reopened.getByRole("textbox")).not.toHaveAttribute("aria-invalid", "true");
    });

    test("announces the loading list once, not each skeleton row", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const region = page.locator(`[data-demo-state="loading"] ${BLOCK} [role="status"]`);
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region).toContainText("Loading actions");
      const hidden = await region.evaluate((el) =>
        [...el.querySelectorAll(":scope > div")].every(
          (row) => row.getAttribute("aria-hidden") === "true",
        ),
      );
      expect(hidden).toBe(true);
    });
  });
}
