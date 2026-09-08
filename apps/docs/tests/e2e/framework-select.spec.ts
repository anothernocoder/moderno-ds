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
  test("switches the Preview source panel and the Install command together, on a page with one Preview", async ({
    page,
  }) => {
    await page.goto("/en/button/", { waitUntil: "networkidle" });

    // Default: React, per CONTEXT.md ("Framework selector"), before any click.
    await expect(page.getByRole("radio", { name: "React" })).toBeChecked();
    await expect(page.locator(".preview-source[data-fw='react']")).toBeVisible();
    await expect(page.locator(".preview-source[data-fw='vue']")).toBeHidden();
    const bunReact = page.locator(".install-panel--bun [data-fw='react']");
    await expect(bunReact).toBeVisible();
    await expect(bunReact).toContainText("@moderno-ui/react");

    await pickFramework(page, "Vue");

    // The Preview source panel switched...
    await expect(page.locator(".preview-source[data-fw='vue']")).toBeVisible();
    await expect(page.locator(".preview-source[data-fw='react']")).toBeHidden();
    await expect(page.locator(".preview-source[data-fw='vue']")).toContainText("@moderno-ui/vue");

    // ...and so did the Install command, without touching the bun/pnpm/npm tab.
    const bunVue = page.locator(".install-panel--bun [data-fw='vue']");
    await expect(bunVue).toBeVisible();
    await expect(bunVue).toContainText("@moderno-ui/vue");
    await expect(bunReact).toBeHidden();

    await expect.poll(() => page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY)).toBe("vue");
  });

  test("applies to every Preview on a page with more than one, and survives navigation", async ({
    page,
  }) => {
    await page.goto("/en/button/", { waitUntil: "networkidle" });
    await pickFramework(page, "Solid");
    await expect(page.locator(".preview-source[data-fw='solid']")).toBeVisible();

    // A fresh navigation, not a client-side transition — the persisted choice
    // has to come from localStorage via BaseLayout's inline script, not from
    // in-memory state carried by a router.
    await page.goto("/en/blocks/", { waitUntil: "networkidle" });

    await expect(page.getByRole("radio", { name: "Solid" })).toBeChecked();

    const solidPanels = page.locator(".preview-source[data-fw='solid']");
    const reactPanels = page.locator(".preview-source[data-fw='react']");
    // Three block previews on this page (login form, pricing, empty state) —
    // every one of them switched, not just the first.
    await expect(solidPanels).toHaveCount(3);
    for (const panel of await solidPanels.all()) {
      await expect(panel).toBeVisible();
    }
    for (const panel of await reactPanels.all()) {
      await expect(panel).toBeHidden();
    }
  });

  test("es locale renders the same control with the same values", async ({ page }) => {
    await page.goto("/es/button/", { waitUntil: "networkidle" });
    await expect(page.getByRole("radio", { name: "React" })).toBeChecked();
    await pickFramework(page, "Svelte");
    await expect(page.locator(".preview-source[data-fw='svelte']")).toBeVisible();
  });
});
