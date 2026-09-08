/**
 * The ⌘K search dialog (`Search.astro` + `search.ts`), over Pagefind's own
 * `pagefind.search()` — never `PagefindUI`.
 *
 * Everything here needs a live DOM and a real Pagefind bundle: the dialog
 * opening on a keyboard shortcut, a debounced query actually reaching the
 * built index, results grouped by page with keyboard navigation between
 * them, and Enter following the highlighted one. Runs against the `en`
 * locale; `checkbox` is a known component page indexed by every build.
 */
import { expect, test } from "@playwright/test";

const PAGE = "/en/button/";

test.describe("search dialog", () => {
  test("click opens the dialog focused and empty; Esc closes it and returns focus", async ({ page }) => {
    await page.goto(PAGE, { waitUntil: "networkidle" });

    const trigger = page.locator("[data-search-trigger]");
    const dialog = page.locator("[data-search-dialog]");

    await trigger.click();
    await expect(dialog).toBeVisible();
    await expect(page.locator("[data-search-input]")).toBeFocused();
    await expect(page.locator("[data-search-empty]")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("Ctrl+K opens the dialog from anywhere on the page", async ({ page }) => {
    await page.goto(PAGE, { waitUntil: "networkidle" });

    await page.locator("h1").click();
    await page.keyboard.press("Control+k");

    await expect(page.locator("[data-search-dialog]")).toBeVisible();
    await expect(page.locator("[data-search-input]")).toBeFocused();
  });

  test("backdrop click closes the dialog", async ({ page }) => {
    await page.goto(PAGE, { waitUntil: "networkidle" });

    await page.locator("[data-search-trigger]").click();
    const dialog = page.locator("[data-search-dialog]");
    await expect(dialog).toBeVisible();

    // The dialog's own box is sized to its content and sits near the top of
    // the viewport (see docs.css) — a click in the bottom corner always lands
    // on the backdrop, never on the dialog itself.
    await page.mouse.click(5, 595);
    await expect(dialog).toBeHidden();
  });

  test("searching a known component groups results by page; arrow keys move; Enter navigates", async ({
    page,
  }) => {
    await page.goto(PAGE, { waitUntil: "networkidle" });

    await page.locator("[data-search-trigger]").click();
    await page.locator("[data-search-input]").fill("Checkbox");

    const results = page.locator("[data-search-result]");
    await expect.poll(() => results.count()).toBeGreaterThan(0);
    await expect(page.locator("[data-search-empty]")).toBeHidden();
    await expect(page.locator("[data-search-no-results]")).toBeHidden();

    // Grouped by page: the Checkbox page's own group heading is present.
    await expect(page.locator(".search-group-title").first()).toHaveText("Checkbox");

    const first = results.first();
    await expect(first).toHaveAttribute("aria-selected", "true");
    await expect(first).toHaveAttribute("href", /\/en\/checkbox\/?$/);

    // Move off the first result, then back onto it, exercising both directions.
    await page.keyboard.press("ArrowDown");
    await expect(first).not.toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowUp");
    await expect(first).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("Enter");
    await page.waitForURL(/\/en\/checkbox\/?$/);
    await expect(page.locator("h1")).toHaveText("Checkbox");
  });

  test("shows an explicit no-results state for a query that matches nothing", async ({ page }) => {
    await page.goto(PAGE, { waitUntil: "networkidle" });

    await page.locator("[data-search-trigger]").click();
    await page.locator("[data-search-input]").fill("zzz-nothing-matches-zzz");

    await expect(page.locator("[data-search-no-results]")).toBeVisible();
    await expect(page.locator("[data-search-results]")).toBeHidden();
    await expect(page.locator("[data-search-result]")).toHaveCount(0);
  });

  test("es locale opens the same dialog with its own strings and bundle", async ({ page }) => {
    await page.goto("/es/button/", { waitUntil: "networkidle" });

    await page.locator("[data-search-trigger]").click();
    await expect(page.locator("[data-search-input]")).toHaveAttribute("placeholder", "Buscar en la documentación…");

    await page.locator("[data-search-input]").fill("Checkbox");
    const results = page.locator("[data-search-result]");
    await expect.poll(() => results.count()).toBeGreaterThan(0);
    await expect(results.first()).toHaveAttribute("href", /\/es\/checkbox\/?$/);
  });
});
