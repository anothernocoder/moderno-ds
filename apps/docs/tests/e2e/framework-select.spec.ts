/**
 * The page-wide framework selector (`FrameworkSelect.astro` +
 * `scripts/framework-select.ts`): one choice that switches every `<Preview>`'s
 * source panel and the `<Install>` command at once (CONTEXT.md "Framework
 * selector"), remembered across pages via `localStorage` and the
 * `data-framework` attribute BaseLayout's inline script sets on `<html>`
 * before paint.
 *
 * Runs against the built docs, like the rest of the e2e seam: no client
 * script here asserts anything about itself, only the DOM state it produces.
 */
import { expect, test } from "@playwright/test";

const STORAGE_KEY = "moderno-framework";

/** Click the labeled option inside the page's one <FrameworkSelect>. */
async function pickFramework(page: import("@playwright/test").Page, label: string) {
  await page.locator("[data-framework-select] .framework-option", { hasText: label }).click();
}

test.describe("framework selector", () => {
  test("switches the main Preview's source panel and the Install command together", async ({
    page,
  }) => {
    await page.goto("/en/button/", { waitUntil: "networkidle" });

    // The page's main Preview, above Installation (CONTEXT.md "Docs page
    // anatomy"); the Examples under it are the next test's business.
    const main = page.locator(".preview").first();

    // Default: React, per CONTEXT.md ("Framework selector"), before any click.
    await expect(page.getByRole("radio", { name: "React" })).toBeChecked();
    await expect(main.locator(".preview-source[data-fw='react']")).toBeVisible();
    await expect(main.locator(".preview-source[data-fw='vue']")).toBeHidden();
    const bunReact = page.locator(".install-panel--bun [data-fw='react']");
    await expect(bunReact).toBeVisible();
    await expect(bunReact).toContainText("@moderno-ui/react");

    await pickFramework(page, "Vue");

    // The Preview source panel switched...
    await expect(main.locator(".preview-source[data-fw='vue']")).toBeVisible();
    await expect(main.locator(".preview-source[data-fw='react']")).toBeHidden();
    await expect(main.locator(".preview-source[data-fw='vue']")).toContainText("@moderno-ui/vue");

    // ...and so did the Install command, without touching the bun/pnpm/npm tab.
    const bunVue = page.locator(".install-panel--bun [data-fw='vue']");
    await expect(bunVue).toBeVisible();
    await expect(bunVue).toContainText("@moderno-ui/vue");
    await expect(bunReact).toBeHidden();

    await expect.poll(() => page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY)).toBe("vue");
  });

  test("applies to every Preview on the page, and survives navigation", async ({ page }) => {
    /** Every Preview on the page shows `fw`'s source, and no other framework's. */
    async function everyPreviewShows(fw: string) {
      const previews = page.locator(".preview");
      // A component page carries its main Preview plus one per Example, so
      // "every" has to mean more than the first one.
      expect(await previews.count()).toBeGreaterThan(1);
      for (const preview of await previews.all()) {
        await expect(preview.locator(`.preview-source[data-fw='${fw}']`)).toBeVisible();
        for (const hidden of await preview.locator(`.preview-source:not([data-fw='${fw}'])`).all()) {
          await expect(hidden).toBeHidden();
        }
      }
    }

    await page.goto("/en/button/", { waitUntil: "networkidle" });
    await pickFramework(page, "Solid");
    await everyPreviewShows("solid");

    // A fresh navigation, not a client-side transition — the persisted choice
    // has to come from localStorage via BaseLayout's inline script, not from
    // in-memory state carried by a router. A block page, so the sources are
    // registry items rather than component examples.
    await page.goto("/en/alert-list/", { waitUntil: "networkidle" });

    await expect(page.getByRole("radio", { name: "Solid" })).toBeChecked();
    await everyPreviewShows("solid");
  });

  test("es locale renders the same control with the same values", async ({ page }) => {
    await page.goto("/es/button/", { waitUntil: "networkidle" });
    await expect(page.getByRole("radio", { name: "React" })).toBeChecked();
    await pickFramework(page, "Svelte");
    await expect(page.locator(".preview").first().locator(".preview-source[data-fw='svelte']")).toBeVisible();
  });
});
