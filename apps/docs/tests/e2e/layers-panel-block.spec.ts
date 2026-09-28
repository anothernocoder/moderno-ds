/**
 * The layers panel block, checked on the built docs page. It asserts text,
 * attributes and computed styles; no screenshot baseline is committed.
 *
 * Eight claims:
 *
 * 1. **Rows render what they are given**: a SortableList named "Layers", one
 *    row per layer with a thumbnail or icon, a name button carrying the row's
 *    state ("Logo, locked", `aria-current` when selected), a visibility and a
 *    lock Toggle named for what they do, and a menu.
 * 2. **Container, not viewport.** Below `--container-sm` the thumbnails are
 *    small and Add layer is an icon; from it they grow and Add layer shows its
 *    label. Nothing overflows sideways, and the main preview is centred.
 * 3. **Keyboard**: one Tab stop on the selected row; Up/Down/Home/End between
 *    rows; Tab through the row's toggles and menu, then out; Shift+Tab back;
 *    Enter selects.
 * 4. **Hover reveals the toggles**, which stay while the layer is hidden or
 *    locked; hidden rows are dimmed; long names are cut short with the full
 *    name in a tooltip, and a long list scrolls.
 * 5. **Selection and toggles report and render**: a click selects (a tint and
 *    a bar, not only colour); the toggles hide, show, lock and unlock.
 * 6. **Rename inline** with a double click, F2 or the menu: Enter saves,
 *    Escape cancels, and the focus comes back to the row.
 * 7. **Reorder, duplicate, delete and add**: dragging and Space + arrows move
 *    a row; Duplicate and Delete in the menu, the Delete key, and Add layer
 *    from the empty state, each with the focus where it belongs.
 * 8. **Looks right** in theme-moderno and theme-contrast, light and dark: AA
 *    text and 3:1 for the icons and the selection bar.
 */
import { expect, test, type Locator, type Page } from "@playwright/test";

const PAGE = "/en/layers-panel/";
const BLOCK = "section.moderno-block-layers-panel";

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

type State = "default" | "narrow" | "wide" | "empty" | "many";

function block(page: Page, state: State): Locator {
  return page.locator(`[data-demo-state="${state}"] ${BLOCK}`);
}

async function show(page: Page, state: State): Promise<Locator> {
  const copy = block(page, state);
  await copy.scrollIntoViewIfNeeded();
  await copy.waitFor({ state: "visible" });
  // client:visible hydrates once the copy is on screen.
  await expect
    .poll(() => copy.evaluate((section) => !section.closest("astro-island")?.hasAttribute("ssr")))
    .toBe(true);
  return copy;
}

async function openPage(page: Page, width = 1280): Promise<void> {
  await page.setViewportSize({ width, height: 1000 });
  await page.goto(PAGE, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready.then(() => true));
}

const list = (copy: Locator) => copy.getByRole("list", { name: "Layers" });
const nameButton = (copy: Locator, name: string) =>
  list(copy).getByRole("button", { name, exact: true });
const button = (copy: Locator, name: string) => copy.getByRole("button", { name, exact: true });
const row = (copy: Locator, id: string) => copy.locator(`li[data-value="${id}"] > div`);
const names = (copy: Locator) =>
  list(copy)
    .locator("[data-layer-name]")
    .evaluateAll((buttons) => buttons.map((b) => b.getAttribute("aria-label")));
const focused = (page: Page) =>
  page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? null);

test.describe("layers panel — what renders", () => {
  test("one row per layer: its name with its state, two named toggles and a menu", async ({
    page,
  }) => {
    await openPage(page);
    const copy = await show(page, "default");
    await expect(list(copy)).toBeVisible();
    expect(await names(copy)).toEqual([
      "Title",
      "Logo, locked",
      "Hero photo",
      "Call to action",
      "Guides, hidden",
      "Background, locked",
    ]);
    await expect(nameButton(copy, "Logo, locked")).toHaveAttribute("aria-current", "true");
    await expect(nameButton(copy, "Title")).not.toHaveAttribute("aria-current");
    await expect(button(copy, "Hide Title")).toHaveAttribute("aria-pressed", "false");
    await expect(button(copy, "Show Guides")).toHaveAttribute("aria-pressed", "true");
    await expect(button(copy, "Lock Title")).toHaveAttribute("aria-pressed", "false");
    await expect(button(copy, "Unlock Logo")).toHaveAttribute("aria-pressed", "true");
    await expect(button(copy, "Actions for Title")).toHaveAttribute("aria-haspopup", "menu");
    // A thumbnail where the layer has one, its kind's icon where it has not.
    await expect(row(copy, "photo").locator("img")).toHaveCount(1);
    await expect(row(copy, "title").locator("span[aria-hidden] svg")).toHaveCount(1);
  });
});

test.describe("layers panel — container, not viewport", () => {
  for (const width of WIDTHS) {
    test(`thumbnails and Add layer follow the block's own width at ${width}px`, async ({
      page,
    }) => {
      await openPage(page, width);
      for (const state of ["narrow", "wide"] as const) {
        const copy = await show(page, state);
        const measured = await copy.evaluate((section) => {
          const add = section.querySelector('[aria-label="Add layer"]')!;
          const label = add.querySelector("span")!;
          const thumb = section.querySelector("li span[aria-hidden]")!;
          return {
            width: section.getBoundingClientRect().width,
            thumb: thumb.getBoundingClientRect().width,
            label: getComputedStyle(label).display !== "none",
            overflow: section.scrollWidth - section.clientWidth,
          };
        });
        const wide = measured.width >= 384;
        expect(measured.thumb, `${state} ${width}px: thumbnail`).toBe(wide ? 32 : 20);
        expect(measured.label, `${state} ${width}px: Add layer label`).toBe(wide);
        expect(measured.overflow, `${state} ${width}px: no sideways scroll`).toBeLessThanOrEqual(0);
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
      ).toBeLessThanOrEqual(0);
    });
  }

  test("the main preview sits in the middle of its box", async ({ page }) => {
    await openPage(page);
    const copy = await show(page, "default");
    const offsets = await copy.evaluate((section) => {
      const frame = section.parentElement!.getBoundingClientRect();
      const panel = section.closest(".preview-panel--demo")!.getBoundingClientRect();
      return {
        x: frame.left - panel.left - (panel.right - frame.right),
        y: frame.top - panel.top - (panel.bottom - frame.bottom),
      };
    });
    expect(Math.abs(offsets.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(offsets.y)).toBeLessThanOrEqual(2);
  });
});

test.describe("layers panel — keyboard", () => {
  test("one Tab stop on the selected row; arrows between rows; Tab through the row, then out", async ({
    page,
  }) => {
    await openPage(page);
    const copy = await show(page, "default");
    await button(copy, "Add layer").focus();
    await page.keyboard.press("Tab");
    expect(await focused(page)).toBe("Logo, locked");
    await page.keyboard.press("ArrowDown");
    await expect.poll(() => focused(page)).toBe("Hero photo");
    await page.keyboard.press("End");
    await expect.poll(() => focused(page)).toBe("Background, locked");
    await page.keyboard.press("Home");
    await expect.poll(() => focused(page)).toBe("Title");
    await page.keyboard.press("ArrowUp");
    // SortableList focuses the row on the next frame, even when it stays on
    // Title: let that frame pass, or it takes the focus back from a Tab.
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
    await expect.poll(() => focused(page)).toBe("Title");

    for (const next of ["Hide Title", "Lock Title", "Actions for Title"]) {
      await page.keyboard.press("Tab");
      expect(await focused(page)).toBe(next);
      // The row's controls show while the focus is in it.
      await expect(button(copy, next)).toHaveCSS("opacity", "1");
    }
    await page.keyboard.press("Tab");
    expect(await copy.evaluate((section) => section.contains(document.activeElement))).toBe(false);
    await page.keyboard.press("Shift+Tab");
    // Back on the selected row's menu: the Tab stop returns to the selection once the focus leaves.
    expect(await focused(page)).toBe("Actions for Logo");
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Shift+Tab");
    expect(await focused(page)).toBe("Logo, locked");

    await page.keyboard.press("ArrowDown");
    await expect.poll(() => focused(page)).toBe("Hero photo");
    await page.keyboard.press("Enter");
    await expect(nameButton(copy, "Hero photo")).toHaveAttribute("aria-current", "true");
  });
});

test.describe("layers panel — hover, dimming, long names", () => {
  test("toggles show on hover and stay while hidden or locked; hidden rows are dimmed", async ({
    page,
  }) => {
    await openPage(page);
    const copy = await show(page, "default");
    await page.mouse.move(0, 0);
    await expect(button(copy, "Hide Title")).toHaveCSS("opacity", "0");
    await expect(button(copy, "Actions for Title")).toHaveCSS("opacity", "0");
    await expect(button(copy, "Show Guides")).toHaveCSS("opacity", "1");
    await expect(button(copy, "Unlock Logo")).toHaveCSS("opacity", "1");
    await expect(button(copy, "Lock Logo")).toHaveCount(0);

    await nameButton(copy, "Title").hover();
    await expect(button(copy, "Hide Title")).toHaveCSS("opacity", "1");
    await expect(button(copy, "Lock Title")).toHaveCSS("opacity", "1");
    await expect(button(copy, "Actions for Title")).toHaveCSS("opacity", "1");

    const dimmed = await copy.evaluate((section) => {
      const nameOf = (id: string) => section.querySelector(`[data-layer-name="${id}"] span`)!;
      const thumbOf = (id: string) =>
        section.querySelector(`li[data-value="${id}"] span[aria-hidden]`)!;
      return {
        hiddenName: getComputedStyle(nameOf("guides")).color,
        shownName: getComputedStyle(nameOf("title")).color,
        hiddenThumb: getComputedStyle(thumbOf("guides")).opacity,
        shownThumb: getComputedStyle(thumbOf("title")).opacity,
      };
    });
    expect(dimmed.hiddenName).not.toBe(dimmed.shownName);
    expect(dimmed.hiddenThumb).toBe("0.5");
    expect(dimmed.shownThumb).toBe("1");
  });

  test("a long name is cut short, its tooltip shows it whole, and a long list scrolls", async ({
    page,
  }) => {
    await openPage(page);
    const copy = await show(page, "many");
    const name = copy.locator('[data-layer-name="quote"] span');
    const cut = await name.evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(cut).toBe(true);
    await name.hover();
    await expect(page.getByRole("tooltip")).toHaveText(
      "Pull quote from the interview with the lead designer",
    );
    // A short name opens no tooltip.
    await copy.locator('[data-layer-name="title"] span').hover();
    await expect(page.getByRole("tooltip")).toHaveCount(0);

    const scroller = copy.locator(".overflow-y-auto");
    expect(await scroller.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
  });
});

test.describe("layers panel — selecting and toggling", () => {
  test("a click selects the row, marked with a tint and a bar", async ({ page }) => {
    await openPage(page);
    const copy = await show(page, "default");
    await row(copy, "title").locator("span[aria-hidden]").click();
    await expect(nameButton(copy, "Title")).toHaveAttribute("aria-current", "true");
    await expect(nameButton(copy, "Logo, locked")).not.toHaveAttribute("aria-current");
    const marks = await copy.evaluate((section) => {
      const of = (id: string) =>
        section.querySelector<HTMLElement>(`li[data-value="${id}"] > div`)!;
      return {
        selectedFill: getComputedStyle(of("title")).backgroundColor,
        otherFill: getComputedStyle(of("logo")).backgroundColor,
        bar: getComputedStyle(of("title"), "::before").width,
      };
    });
    expect(marks.selectedFill).not.toBe(marks.otherFill);
    expect(parseFloat(marks.bar)).toBeGreaterThan(0);
    // A toggle does not select.
    await button(copy, "Unlock Logo").click();
    await expect(nameButton(copy, "Title")).toHaveAttribute("aria-current", "true");
  });

  test("the toggles hide, show, lock and unlock", async ({ page }) => {
    await openPage(page);
    const copy = await show(page, "default");
    await nameButton(copy, "Title").hover();
    await button(copy, "Hide Title").click();
    await expect(button(copy, "Show Title")).toHaveAttribute("aria-pressed", "true");
    await expect(nameButton(copy, "Title, hidden")).toBeVisible();
    await button(copy, "Show Title").click();
    await expect(nameButton(copy, "Title")).toBeVisible();
    await button(copy, "Unlock Logo").click();
    await expect(button(copy, "Lock Logo")).toHaveAttribute("aria-pressed", "false");
    await expect(nameButton(copy, "Logo")).toBeVisible();
  });
});

test.describe("layers panel — rename", () => {
  test("a double click renames: Enter saves and the focus comes back", async ({ page }) => {
    await openPage(page);
    const copy = await show(page, "default");
    await nameButton(copy, "Title").dblclick();
    const input = copy.getByRole("textbox", { name: "Layer name" });
    await expect(input).toBeFocused();
    expect(
      await input.evaluate((el: HTMLInputElement) => el.selectionEnd! - el.selectionStart!),
    ).toBe("Title".length);
    await page.keyboard.type("Headline");
    await page.keyboard.press("Enter");
    await expect(input).toHaveCount(0);
    await expect(nameButton(copy, "Headline")).toBeFocused();
  });

  test("F2 renames and Escape cancels", async ({ page }) => {
    await openPage(page);
    const copy = await show(page, "default");
    await nameButton(copy, "Hero photo").focus();
    await page.keyboard.press("F2");
    const input = copy.getByRole("textbox", { name: "Layer name" });
    await expect(input).toBeFocused();
    await page.keyboard.type("Sky");
    await page.keyboard.press("Escape");
    await expect(input).toHaveCount(0);
    await expect(nameButton(copy, "Hero photo")).toBeFocused();
  });

  test("Rename in the menu renames", async ({ page }) => {
    await openPage(page);
    const copy = await show(page, "default");
    await nameButton(copy, "Call to action").hover();
    await button(copy, "Actions for Call to action").click();
    await page.getByRole("menuitem", { name: "Rename" }).click();
    const input = copy.getByRole("textbox", { name: "Layer name" });
    await expect(input).toBeFocused();
    await page.keyboard.type("Sign up");
    await page.keyboard.press("Enter");
    await expect(nameButton(copy, "Sign up")).toBeFocused();
  });
});

test.describe("layers panel — reorder, duplicate, delete, add", () => {
  test("dragging a row moves it", async ({ page }) => {
    await openPage(page);
    const copy = await show(page, "default");
    const from = await row(copy, "title").boundingBox();
    const to = await row(copy, "photo").boundingBox();
    await page.mouse.move(from!.x + from!.width / 3, from!.y + from!.height / 2);
    await page.mouse.down();
    await page.mouse.move(from!.x + from!.width / 3, to!.y + to!.height / 2 + 4, { steps: 12 });
    await page.mouse.up();
    await expect
      .poll(() => names(copy))
      .toEqual([
        "Logo, locked",
        "Hero photo",
        "Title",
        "Call to action",
        "Guides, hidden",
        "Background, locked",
      ]);
  });

  test("Space picks a row up, the arrows move it and Space drops it", async ({ page }) => {
    await openPage(page);
    const copy = await show(page, "default");
    await nameButton(copy, "Background, locked").focus();
    await page.keyboard.press("Space");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("Space");
    await expect
      .poll(() => names(copy))
      .toEqual([
        "Title",
        "Logo, locked",
        "Hero photo",
        "Background, locked",
        "Call to action",
        "Guides, hidden",
      ]);
    await expect.poll(() => focused(page)).toBe("Background, locked");
  });

  test("Duplicate and Delete in the menu, and the Delete key", async ({ page }) => {
    await openPage(page);
    const copy = await show(page, "default");
    await nameButton(copy, "Title").hover();
    await button(copy, "Actions for Title").click();
    await page.getByRole("menuitem", { name: "Duplicate" }).click();
    await expect.poll(() => names(copy)).toContain("Title 2");
    await expect(nameButton(copy, "Title 2")).toHaveAttribute("aria-current", "true");

    await nameButton(copy, "Hero photo").hover();
    await button(copy, "Actions for Hero photo").click();
    await page.getByRole("menuitem", { name: "Delete" }).click();
    await expect.poll(() => names(copy)).not.toContain("Hero photo");
    await expect(nameButton(copy, "Call to action")).toBeFocused();

    await page.keyboard.press("Delete");
    await expect.poll(() => names(copy)).not.toContain("Call to action");
    await expect(nameButton(copy, "Guides, hidden")).toBeFocused();
  });

  test("the empty state adds the first layer and hands it the focus", async ({ page }) => {
    await openPage(page);
    const copy = await show(page, "empty");
    await expect(copy.getByText("No layers yet")).toBeVisible();
    await expect(list(copy)).toHaveCount(0);
    await button(copy, "Add layer").click();
    await expect(nameButton(copy, "Layer 1")).toBeFocused();
    await expect(nameButton(copy, "Layer 1")).toHaveAttribute("aria-current", "true");
  });
});

/**
 * Contrast ratios read off the rendered page. Colours are resolved through a
 * canvas: the contract's values are OKLCH, and the browser is the only thing
 * that converts them exactly the way it painted them. A translucent fill is
 * laid over what is behind it first.
 */
async function ratios(copy: Locator): Promise<Record<string, number>> {
  return copy.evaluate((section) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    const rgba = (color: string) => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      return [r!, g!, b!, a! / 255] as const;
    };
    const over = (top: string, bottom: string) => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = bottom;
      ctx.fillRect(0, 0, 1, 1);
      ctx.fillStyle = top;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      return `rgb(${r}, ${g}, ${b})`;
    };
    const luminance = (color: string) => {
      const channel = (v: number) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      };
      const [r, g, b] = rgba(color);
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    };
    const ratio = (fg: string, bg: string) => {
      const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
      return (hi! + 0.05) / (lo! + 0.05);
    };
    const surface = getComputedStyle(section).backgroundColor;
    const rowFill = (el: Element) => {
      const fill = getComputedStyle(el.closest("li > div")!).backgroundColor;
      return rgba(fill)[3] === 0 ? surface : over(fill, surface);
    };
    const result: Record<string, number> = {};
    result.heading = ratio(getComputedStyle(section.querySelector("h2")!).color, surface);
    section.querySelectorAll("[data-layer-name] span").forEach((name) => {
      const label = name.closest("[data-layer-name]")!.getAttribute("aria-label");
      result[`name ${label}`] = ratio(getComputedStyle(name).color, rowFill(name));
    });
    // Every row control that is showing (the pressed ones, and the hovered row's).
    section.querySelectorAll("li button[aria-label]:not([data-layer-name])").forEach((icon) => {
      if (getComputedStyle(icon).opacity !== "1") return;
      result[`icon ${icon.getAttribute("aria-label")}`] = ratio(
        getComputedStyle(icon).color,
        rowFill(icon),
      );
    });
    const selected = section.querySelector("li > div[data-selected]")!;
    result.bar = ratio(getComputedStyle(selected, "::before").backgroundColor, rowFill(selected));
    return result;
  });
}

for (const theme of ["moderno", "contrast"] as const) {
  for (const scheme of ["light", "dark"] as const) {
    test.describe(`layers panel — theme-${theme}, ${scheme}`, () => {
      test.use({ colorScheme: scheme });

      test("AA text, and 3:1 for the icons and the selection bar", async ({ page }) => {
        await page.addInitScript((id) => localStorage.setItem("moderno-site-theme", id), theme);
        await openPage(page);
        expect(await page.evaluate(() => document.documentElement.dataset.brand)).toBe(theme);
        const copy = await show(page, "default");
        // The selected row, hovered: its controls show on its tint.
        await nameButton(copy, "Logo, locked").hover();
        const found = await ratios(copy);
        expect(Object.keys(found)).toEqual(
          expect.arrayContaining(["name Guides, hidden", "icon Hide Logo", "icon Show Guides"]),
        );
        for (const [name, value] of Object.entries(found)) {
          const floor = name === "bar" || name.startsWith("icon ") ? 3 : 4.5;
          expect(value, `${theme} ${scheme}: ${name}`).toBeGreaterThanOrEqual(floor);
        }
      });
    });
  }
}
