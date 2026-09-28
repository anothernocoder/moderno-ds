/**
 * The Toolbar primitive, checked on the built docs page (the Svelte islands).
 * It asserts roles, focus, geometry and computed colours; no screenshot
 * baseline is committed.
 *
 * 1. **Keyboard**: one Tab stop, arrows and Home/End between items, a
 *    disabled item still reachable, a tooltip with the label and shortcut
 *    that follows focus, and a menu trigger that opens its menu.
 * 2. **Sizes and hit areas**: items are Button's heights, icon-only items are
 *    square, and every item answers a pointer at least --spacing-8 (32px)
 *    wide and tall, also at `sm`.
 * 3. **Alignment**: a text readout sits on the items' centre line; the
 *    separators are visible rules across the bar; every preview is centred.
 * 4. **Looks right** in theme-moderno and theme-contrast, light and dark: 3:1
 *    for the icons (on a pressed toggle's fill too) and AA for the readout.
 */
import { expect, test, type Locator, type Page } from "@playwright/test";

const PAGE = "/en/toolbar/";

/** The toolbar named `name` on the page, once its island has hydrated. */
async function toolbar(page: Page, name: string): Promise<Locator> {
  const bar = page.getByRole("toolbar", { name, exact: true });
  await bar.scrollIntoViewIfNeeded();
  await expect
    .poll(() => bar.evaluate((el) => !el.closest("astro-island")?.hasAttribute("ssr")))
    .toBe(true);
  // The machine has found its first item: exactly one Tab stop.
  await expect(bar.locator('[data-ownedby][tabindex="0"]')).toHaveCount(1);
  return bar;
}

async function openPage(page: Page): Promise<void> {
  await page.goto(PAGE, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready.then(() => true));
}

test.describe("toolbar — keyboard", () => {
  test("is one Tab stop that remembers the item used last", async ({ page }) => {
    await openPage(page);
    const bar = await toolbar(page, "Canvas tools");
    const undo = bar.getByRole("button", { name: "Undo" });
    await expect(undo).toHaveAttribute("tabindex", "0");

    await undo.focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(bar.getByRole("button", { name: "Bold" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(bar.locator(":focus")).toHaveCount(0);
    await page.keyboard.press("Shift+Tab");
    await expect(bar.getByRole("button", { name: "Bold" })).toBeFocused();
  });

  test("moves with the arrows and Home/End, and wraps", async ({ page }) => {
    await openPage(page);
    const bar = await toolbar(page, "Canvas tools");
    await bar.getByRole("button", { name: "Undo" }).focus();

    await page.keyboard.press("End");
    await expect(bar.getByRole("button", { name: "Zoom in" })).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(bar.getByRole("button", { name: "Undo" })).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(bar.getByRole("button", { name: "Zoom in" })).toBeFocused();
    await page.keyboard.press("Home");
    await expect(bar.getByRole("button", { name: "Undo" })).toBeFocused();

    const column = await toolbar(page, "Drawing tools");
    await column.getByRole("button", { name: "Select" }).focus();
    await page.keyboard.press("ArrowDown");
    await expect(column.getByRole("button", { name: "Pen" })).toBeFocused();
  });

  test("presses a toggle and says so", async ({ page }) => {
    await openPage(page);
    const bar = await toolbar(page, "Canvas tools");
    const italic = bar.getByRole("button", { name: "Italic" });
    await expect(italic).toHaveAttribute("aria-pressed", "false");
    await italic.focus();
    await page.keyboard.press("Space");
    await expect(italic).toHaveAttribute("aria-pressed", "true");
    await expect(italic).toHaveAttribute("data-state", "on");
  });

  test("shows the label and shortcut in a tooltip that follows focus", async ({ page }) => {
    await openPage(page);
    const bar = await toolbar(page, "Canvas tools");
    await bar.getByRole("button", { name: "Undo" }).focus();
    // A key press makes the focus a keyboard one, which the tooltip follows.
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tooltip", { name: "Redo (⇧⌘Z)" })).toBeVisible();
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByRole("tooltip", { name: "Undo (⌘Z)" })).toBeVisible();
    await expect(page.getByRole("tooltip", { name: "Redo (⇧⌘Z)" })).toBeHidden();
  });

  test("reaches a disabled item, which does nothing", async ({ page }) => {
    await openPage(page);
    const bar = await toolbar(page, "History");
    const redo = bar.getByRole("button", { name: "Redo" });
    await expect(redo).toHaveAttribute("aria-disabled", "true");
    await expect(redo).not.toHaveAttribute("disabled", /.*/);
    await bar.getByRole("button", { name: "Undo" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(redo).toBeFocused();
  });

  test("opens a menu from a toolbar button", async ({ page }) => {
    await openPage(page);
    const bar = await toolbar(page, "Layer tools");
    await bar.getByRole("button", { name: "Duplicate" }).focus();
    await page.keyboard.press("ArrowRight");
    const more = bar.getByRole("button", { name: "More" });
    await expect(more).toBeFocused();
    await expect(more).toHaveAttribute("data-scope", "toolbar");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("menuitem", { name: "Rename" })).toBeVisible();
    await expect(more).toHaveAttribute("aria-expanded", "true");
  });

  test("reads out a value between its buttons", async ({ page }) => {
    await openPage(page);
    const bar = await toolbar(page, "Zoom");
    await bar.getByRole("button", { name: "Zoom in" }).click();
    await expect(bar).toContainText("125%");
  });
});

test.describe("toolbar — sizes, hit areas and alignment", () => {
  test("uses Button's heights and keeps icon-only items square", async ({ page }) => {
    await openPage(page);
    for (const [size, px] of [
      ["sm", 28],
      ["md", 32],
      ["lg", 40],
    ] as const) {
      const bar = await toolbar(page, `History, ${size}`);
      const boxes = await bar
        .locator('[data-part="button"]')
        .evaluateAll((items) => items.map((item) => item.getBoundingClientRect().toJSON()));
      for (const box of boxes) {
        expect(box.height, `${size} height`).toBeCloseTo(px, 0);
        expect(box.width, `${size} width`).toBeCloseTo(px, 0);
      }
    }
  });

  // Probes 15px from the centre, inside a 32px square: the square's edge is
  // shared with the neighbour's, and a hit test may round a point on it
  // either way.
  test("answers a pointer at least 32px each way, even at sm", async ({ page }) => {
    await openPage(page);
    for (const size of ["sm", "md", "lg"]) {
      const bar = await toolbar(page, `History, ${size}`);
      const hits = await bar.locator('[data-part="button"]').evaluateAll((items) =>
        items.flatMap((item) => {
          const r = item.getBoundingClientRect();
          const [cx, cy] = [(r.left + r.right) / 2, (r.top + r.bottom) / 2];
          return [
            [15, 0],
            [-15, 0],
            [0, 15],
            [0, -15],
          ].map(([dx, dy]) => {
            const hit = document.elementFromPoint(cx + dx!, cy + dy!);
            return hit === item || item.contains(hit);
          });
        }),
      );
      expect(hits, `${size}: every probe lands on its item`).not.toContain(false);
    }
  });

  test("keeps a text readout on the items' centre line", async ({ page }) => {
    await openPage(page);
    const bar = await toolbar(page, "Canvas tools");
    const centres = await bar.evaluate((root) =>
      [...root.children].map((child) => {
        const r = child.getBoundingClientRect();
        return (r.top + r.bottom) / 2;
      }),
    );
    for (const centre of centres) expect(centre).toBeCloseTo(centres[0]!, 0);
  });

  test("draws each separator as a visible rule across the bar", async ({ page }) => {
    await openPage(page);
    for (const [name, across] of [["Canvas tools", "vertical"]] as const) {
      const bar = await toolbar(page, name);
      const rules = await bar.getByRole("separator").evaluateAll((els) =>
        els.map((el) => ({
          ...el.getBoundingClientRect().toJSON(),
          orientation: el.getAttribute("aria-orientation"),
          fill: getComputedStyle(el).backgroundColor,
        })),
      );
      expect(rules.length).toBeGreaterThan(0);
      for (const rule of rules) {
        expect(rule.orientation).toBe(across);
        expect(rule.width).toBeCloseTo(1, 0);
        expect(rule.height).toBeGreaterThan(16);
        expect(rule.fill).not.toBe("rgba(0, 0, 0, 0)");
      }
    }
  });

  test("centres every preview", async ({ page }) => {
    await openPage(page);
    const offsets = await page.locator(".preview-panel--demo").evaluateAll((panels) =>
      panels.map((panel) => {
        const p = panel.getBoundingClientRect();
        const bars = [...panel.querySelectorAll('[data-scope="toolbar"][data-part="root"]')].map(
          (bar) => bar.getBoundingClientRect(),
        );
        const left = Math.min(...bars.map((b) => b.left));
        const right = Math.max(...bars.map((b) => b.right));
        const top = Math.min(...bars.map((b) => b.top));
        const bottom = Math.max(...bars.map((b) => b.bottom));
        return {
          dx: left - p.left - (p.right - right),
          dy: top - p.top - (p.bottom - bottom),
        };
      }),
    );
    expect(offsets.length).toBe(6);
    for (const { dx, dy } of offsets) {
      expect(Math.abs(dx)).toBeLessThanOrEqual(1);
      expect(Math.abs(dy)).toBeLessThanOrEqual(1);
    }
  });
});

/**
 * Contrast ratios read off the rendered bar. Colours are resolved through a
 * canvas: the contract's values are OKLCH, and the browser is the only thing
 * that converts them exactly the way it painted them.
 */
async function ratios(bar: Locator): Promise<Record<string, number>> {
  return bar.evaluate((root) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    const rgba = (color: string) => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      return [r!, g!, b!, a! / 255] as const;
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
    const surface = getComputedStyle(root).backgroundColor;
    const result: Record<string, number> = {};
    // Every item that can be used; a disabled one is exempt (WCAG 1.4.11).
    root.querySelectorAll("[data-ownedby]:not([aria-disabled])").forEach((item) => {
      const fill = getComputedStyle(item).backgroundColor;
      const behind = rgba(fill)[3] === 0 ? surface : fill;
      result[`icon ${item.getAttribute("aria-label")}`] = ratio(
        getComputedStyle(item).color,
        behind,
      );
    });
    const readout = root.querySelector(":scope > span")!;
    result.readout = ratio(getComputedStyle(readout).color, surface);
    return result;
  });
}

for (const theme of ["moderno", "contrast"] as const) {
  for (const scheme of ["light", "dark"] as const) {
    test.describe(`toolbar — theme-${theme}, ${scheme}`, () => {
      test.use({ colorScheme: scheme });

      test("3:1 for the icons, pressed or not, and AA for the readout", async ({ page }) => {
        await page.addInitScript((id) => localStorage.setItem("moderno-site-theme", id), theme);
        await openPage(page);
        expect(await page.evaluate(() => document.documentElement.dataset.brand)).toBe(theme);
        const bar = await toolbar(page, "Canvas tools");
        await expect(bar.getByRole("button", { name: "Bold" })).toHaveAttribute("data-state", "on");
        const found = await ratios(bar);
        expect(Object.keys(found)).toContain("icon Bold");
        for (const [name, value] of Object.entries(found)) {
          const floor = name === "readout" ? 4.5 : 3;
          expect(value, `${theme} ${scheme}: ${name}`).toBeGreaterThanOrEqual(floor);
        }
      });
    });
  }
}
