/**
 * Drawer, and the Dialog that presents as a bottom Drawer on a small
 * viewport, checked on the built docs pages. It asserts text and computed
 * styles; no screenshot baseline is committed.
 *
 * Four claims:
 *
 * 1. **Centred**: every Drawer Preview holds its triggers in the middle of the
 *    stage.
 * 2. **Placement**: each placement pins the panel to its own edge of the
 *    viewport — a side drawer the full height, a top or bottom one the full
 *    width — with the 1px `--border` edge on the side facing the page.
 * 3. **The overlay contract**: every part renders under the drawer scope, the
 *    backdrop paints the `--overlay` slot, and Escape closes the drawer and
 *    hands focus back to its trigger.
 * 4. **Dialog → bottom Drawer**: at 375px the first Dialog on its page sits at
 *    the bottom edge, full width, with only its top corners rounded; at
 *    1280px it floats in the middle, as before.
 */
import { expect, test, type Page } from "@playwright/test";

const DRAWER_PAGE = "/en/drawer/";
const DIALOG_PAGE = "/en/dialog/";

/**
 * Scrolls the page's `index`th Preview into view and waits for it to hydrate:
 * its demo mounts `client:visible`, and until then a click on a trigger opens
 * nothing.
 */
async function hydratedPreview(page: Page, index: number) {
  const panel = page.locator(".preview-panel--demo").nth(index);
  await panel.scrollIntoViewIfNeeded();
  await panel.locator("astro-island:not([ssr])").first().waitFor({ state: "attached" });
  return panel;
}

/** The resolved value of a contract slot on the page's root. */
async function slot(page: Page, name: string, prop = "background-color"): Promise<string> {
  return page.evaluate(
    ([name, prop]) => {
      const probe = document.createElement("div");
      probe.style.setProperty(prop, `var(${name})`);
      document.body.append(probe);
      const value = getComputedStyle(probe).getPropertyValue(prop);
      probe.remove();
      return value;
    },
    [name, prop] as const,
  );
}

/** The open drawer's content box and its border widths. */
async function openContent(page: Page) {
  const content = page.locator('[data-scope="drawer"][data-part="content"][data-state="open"]');
  await expect(content).toBeVisible();
  return content.evaluate((el) => {
    const box = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return {
      left: box.left,
      top: box.top,
      right: box.right,
      bottom: box.bottom,
      width: box.width,
      height: box.height,
      borders: {
        top: style.borderTopWidth,
        right: style.borderRightWidth,
        bottom: style.borderBottomWidth,
        left: style.borderLeftWidth,
      },
    };
  });
}

test.describe("Drawer", () => {
  test("centres its triggers in every Preview", async ({ page }) => {
    await page.goto(DRAWER_PAGE);
    const panels = page.locator(".preview-panel--demo");
    const count = await panels.count();
    expect(count).toBe(3);
    for (let i = 0; i < count; i++) {
      const panel = await hydratedPreview(page, i);
      const offset = await panel.evaluate((panel) => {
        const stage = panel.getBoundingClientRect();
        // Each trigger is a Button through asChild: it keeps its own scope and
        // part, and says it opens a dialog.
        const triggers = [...panel.querySelectorAll('[aria-haspopup="dialog"]')].map((el) =>
          el.getBoundingClientRect(),
        );
        const left = Math.min(...triggers.map((r) => r.left));
        const right = Math.max(...triggers.map((r) => r.right));
        const top = Math.min(...triggers.map((r) => r.top));
        const bottom = Math.max(...triggers.map((r) => r.bottom));
        return {
          dx: Math.abs((left + right) / 2 - (stage.left + stage.right) / 2),
          dy: Math.abs((top + bottom) / 2 - (stage.top + stage.bottom) / 2),
        };
      });
      expect(offset.dx, `Preview ${i + 1}: horizontally centred`).toBeLessThan(1);
      expect(offset.dy, `Preview ${i + 1}: vertically centred`).toBeLessThan(1);
    }
  });

  const EDGES = {
    Left: "right",
    Right: "left",
    Top: "bottom",
    Bottom: "top",
  } as const;

  for (const [label, inner] of Object.entries(EDGES)) {
    test(`pins the ${label.toLowerCase()} drawer to its edge`, async ({ page }) => {
      await page.goto(DRAWER_PAGE);
      const viewport = page.viewportSize()!;
      const panel = await hydratedPreview(page, 1);
      await panel.getByRole("button", { name: label, exact: true }).click();
      const box = await openContent(page);
      const placement = label.toLowerCase();
      if (placement === "left" || placement === "right") {
        expect(box.top).toBe(0);
        expect(box.height).toBe(viewport.height);
        if (placement === "left") expect(box.left).toBe(0);
        else expect(box.right).toBe(viewport.width);
      } else {
        expect(box.left).toBe(0);
        expect(box.width).toBe(viewport.width);
        if (placement === "top") expect(box.top).toBe(0);
        else expect(box.bottom).toBe(viewport.height);
      }
      for (const [side, width] of Object.entries(box.borders)) {
        expect(width, `${side} border`).toBe(side === inner ? "1px" : "0px");
      }
    });
  }

  test("renders under its own scope, paints the --overlay scrim, and closes on Escape", async ({
    page,
  }) => {
    await page.goto(DRAWER_PAGE);
    const panel = await hydratedPreview(page, 0);
    const trigger = panel.getByRole("button", { name: "Filters" });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Filters" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("data-scope", "drawer");
    await expect(dialog).toHaveAttribute("data-placement", "right");
    await expect(dialog).toHaveAccessibleDescription("Narrow the list of orders.");
    const backdrop = page.locator('[data-scope="drawer"][data-part="backdrop"][data-state="open"]');
    await expect(backdrop).toHaveCSS("background-color", await slot(page, "--overlay"));
    expect(await page.locator('[data-scope="dialog"]').count()).toBe(0);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});

test.describe("Dialog on a small viewport", () => {
  test("presents as a bottom Drawer at 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(DIALOG_PAGE);
    const panel = await hydratedPreview(page, 0);
    await panel.getByRole("button", { name: "Publish changes" }).click();
    const content = page.getByRole("dialog", { name: "Publish changes?" });
    await expect(content).toBeVisible();
    const box = await content.evaluate((el) => {
      // The docs theme's --radius is 0; a round one shows which corners take it.
      el.style.setProperty("--radius", "12px");
      const r = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return {
        left: r.left,
        width: r.width,
        bottom: r.bottom,
        topRadius: style.borderTopLeftRadius,
        bottomRadius: style.borderBottomLeftRadius,
        borderTop: style.borderTopWidth,
        borderBottom: style.borderBottomWidth,
      };
    });
    expect(box.left).toBe(0);
    expect(box.width).toBe(375);
    expect(box.bottom).toBe(812);
    expect(box.topRadius).toBe("12px");
    expect(box.bottomRadius).toBe("0px");
    expect(box.borderTop).toBe("1px");
    expect(box.borderBottom).toBe("0px");
  });

  test("floats in the middle at 1280px", async ({ page }) => {
    await page.goto(DIALOG_PAGE);
    const panel = await hydratedPreview(page, 0);
    await panel.getByRole("button", { name: "Publish changes" }).click();
    const content = page.getByRole("dialog", { name: "Publish changes?" });
    await expect(content).toBeVisible();
    const viewport = page.viewportSize()!;
    const box = await content.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
    });
    expect(Math.abs(box.left - (viewport.width - box.right))).toBeLessThan(1);
    expect(Math.abs(box.top - (viewport.height - box.bottom))).toBeLessThan(1);
  });
});
