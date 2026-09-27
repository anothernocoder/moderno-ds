/**
 * SegmentedControl, checked on its built docs page. It asserts geometry, text
 * and computed styles; no screenshot baseline is committed.
 *
 * Four claims:
 *
 * 1. **Centred**: every Preview holds its demo in the middle of the stage.
 * 2. **The indicator**: once hydrated, the pill covers the checked segment
 *    exactly, and a click moves it onto the new one — at once, because the
 *    suite runs with `prefers-reduced-motion: reduce`.
 * 3. **Long labels**: a label too long for its segment is cut by an ellipsis
 *    inside a track that stays one line, and hovering it titles it in full.
 * 4. **Keyboard**: the arrow keys move focus and select, in a named radiogroup.
 */
import { expect, test, type Locator, type Page } from "@playwright/test";

const PAGE = "/en/segmented-control/";

/**
 * Scrolls the page's `index`th Preview into view and waits for it to hydrate:
 * its demo mounts `client:visible`, and until then Ark has measured nothing.
 */
async function hydratedPreview(page: Page, index: number): Promise<Locator> {
  const panel = page.locator(".preview-panel--demo").nth(index);
  await panel.scrollIntoViewIfNeeded();
  await panel.locator("astro-island:not([ssr])").first().waitFor({ state: "attached" });
  return panel;
}

/**
 * Whether the indicator shows over the checked segment: every edge within a
 * pixel of it (Ark measures the segment's offset box, in whole pixels).
 */
function indicatorOverChecked(root: Locator) {
  return root.evaluate((root) => {
    const indicator = root.querySelector<HTMLElement>(':scope > [data-part="indicator"]')!;
    const checked = root.querySelector(':scope > [data-part="item"][data-state="checked"]')!;
    const a = indicator.getBoundingClientRect();
    const b = checked.getBoundingClientRect();
    const gaps = [a.left - b.left, a.top - b.top, a.right - b.right, a.bottom - b.bottom];
    return !indicator.hidden && gaps.every((gap) => Math.abs(gap) < 1);
  });
}

test.describe("SegmentedControl", () => {
  test("centres its demo in every Preview", async ({ page }) => {
    await page.goto(PAGE);
    const count = await page.locator(".preview-panel--demo").count();
    expect(count).toBe(9);
    for (let i = 0; i < count; i++) {
      const panel = await hydratedPreview(page, i);
      const offset = await panel.evaluate((panel) => {
        const stage = panel.getBoundingClientRect();
        // The island is display: contents; its children are what the stage centres.
        const boxes = [...panel.querySelectorAll("astro-island > *")].map((el) =>
          el.getBoundingClientRect(),
        );
        const left = Math.min(...boxes.map((r) => r.left));
        const right = Math.max(...boxes.map((r) => r.right));
        const top = Math.min(...boxes.map((r) => r.top));
        const bottom = Math.max(...boxes.map((r) => r.bottom));
        return {
          dx: Math.abs((left + right) / 2 - (stage.left + stage.right) / 2),
          dy: Math.abs((top + bottom) / 2 - (stage.top + stage.bottom) / 2),
        };
      });
      expect(offset.dx, `Preview ${i + 1}: horizontally centred`).toBeLessThan(1);
      expect(offset.dy, `Preview ${i + 1}: vertically centred`).toBeLessThan(1);
    }
  });

  test("slides the indicator onto the segment the user picks", async ({ page }) => {
    await page.goto(PAGE);
    const panel = await hydratedPreview(page, 0);
    const root = panel.locator('[data-scope="segment-group"][data-part="root"]');
    await expect.poll(() => indicatorOverChecked(root)).toBe(true);

    await panel.getByText("Stretch", { exact: true }).click();
    await expect(panel.getByRole("radio", { name: "Stretch" })).toBeChecked();
    // Reduced motion: the pill jumps, so it is already there.
    const indicator = root.locator('[data-part="indicator"]');
    expect(await indicator.evaluate((el) => getComputedStyle(el).transitionDuration)).toBe("0s");
    expect(await indicatorOverChecked(root)).toBe(true);
  });

  test("cuts a long label with an ellipsis and titles it in full on hover", async ({ page }) => {
    await page.goto(PAGE);
    const panel = await hydratedPreview(page, 8);
    const root = panel.locator('[data-scope="segment-group"][data-part="root"]');
    const layout = await root.evaluate((root) => ({
      track: root.getBoundingClientRect().height,
      stage: root.parentElement!.getBoundingClientRect().width,
      width: root.getBoundingClientRect().width,
      texts: [...root.querySelectorAll('[data-part="item-text"]')].map(
        (text) => text.scrollWidth > text.clientWidth,
      ),
    }));
    expect(layout.width).toBeLessThanOrEqual(layout.stage);
    expect(layout.texts).toEqual([true, true, true]);

    const text = panel.getByText("Fill the whole frame");
    await text.hover();
    await expect(text).toHaveAttribute("title", "Fill the whole frame");
    // One line: the track keeps the height of the medium size.
    expect(layout.track).toBe(
      await page.evaluate(() => {
        const probe = document.createElement("div");
        probe.style.height = "var(--spacing-8)";
        document.body.append(probe);
        const height = probe.getBoundingClientRect().height;
        probe.remove();
        return height;
      }),
    );
  });

  test("moves and selects with the arrow keys, inside a named radiogroup", async ({ page }) => {
    await page.goto(PAGE);
    const panel = await hydratedPreview(page, 0);
    await panel.getByRole("radio", { name: "Fit" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(panel.getByRole("radio", { name: "Fill" })).toBeFocused();
    await expect(panel.getByRole("radio", { name: "Fill" })).toBeChecked();
    await expect(panel.getByRole("radiogroup", { name: "Image scale" })).toBeVisible();
  });
});
