/**
 * The sidebar filter (`BaseLayout.astro` + `sidebar-filter.ts`).
 *
 * Two facts worth a live browser rather than a static-HTML grep: typing a
 * query must actually hide the rows and collapse the groups it disqualifies —
 * only a live DOM mutation shows that — and the `/` and Escape keyboard
 * shortcuts need real key events. Everything here runs against the `en`
 * locale; the matching logic itself is locale-agnostic (it normalizes
 * whatever text the sidebar already rendered).
 */
import { expect, test, type Page } from "@playwright/test";

const PAGE = "/en/button/";

/** Titles of every currently-visible (non-hidden) sidebar row, in document order. */
function visibleTitles(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLLIElement>('.sidebar [data-sidebar-item]')]
      .filter((li) => !li.hidden)
      .map((li) => li.querySelector("a")?.textContent?.trim() ?? ""),
  );
}

/** Group headings (`<h2>`) of every currently-visible (non-collapsed) sidebar group. */
function visibleGroups(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>(".sidebar [data-sidebar-group]")]
      .filter((section) => !section.hidden)
      .map((section) => section.querySelector("h2")?.textContent?.trim() ?? ""),
  );
}

test.describe("sidebar filter", () => {
  test("narrows to matching rows and collapses groups with no match", async ({ page }) => {
    await page.goto(PAGE, { waitUntil: "networkidle" });

    const fullTitles = await visibleTitles(page);
    const fullGroups = await visibleGroups(page);
    expect(fullTitles.length).toBeGreaterThan(10);
    expect(fullGroups.length).toBeGreaterThan(1);

    // "chart" matches exactly the four chart pages, all filed under
    // "Components" — every other group has zero matches and collapses.
    await page.fill("[data-sidebar-filter]", "chart");

    await expect
      .poll(() => visibleTitles(page))
      .toEqual(["Line Chart", "Area Chart", "Bar Chart", "Scatter Chart"]);
    await expect.poll(() => visibleGroups(page)).toEqual(["Components"]);

    const noMatches = page.locator('[data-sidebar-empty]');
    await expect(noMatches).toBeHidden();

    // Clearing restores the full, unfiltered navigation.
    await page.fill("[data-sidebar-filter]", "");
    await expect.poll(() => visibleTitles(page)).toEqual(fullTitles);
    await expect.poll(() => visibleGroups(page)).toEqual(fullGroups);
  });

  test("matching ignores case", async ({ page }) => {
    await page.goto(PAGE, { waitUntil: "networkidle" });

    // "AREA" (upper-case) must still find "Area Chart".
    await page.fill("[data-sidebar-filter]", "AREA");
    await expect.poll(() => visibleTitles(page)).toEqual(["Area Chart"]);
  });

  test("matching ignores diacritics, in the es locale", async ({ page }) => {
    await page.goto("/es/button/", { waitUntil: "networkidle" });

    // "boton" (no diacritic) must find "Botón"; "grafico" must find every
    // "Gráfico …" page even though the query has no accent on its "i".
    await page.fill("[data-sidebar-filter]", "boton");
    await expect.poll(() => visibleTitles(page)).toEqual(["Botón"]);

    await page.fill("[data-sidebar-filter]", "grafico");
    await expect
      .poll(() => visibleTitles(page))
      .toEqual(["Gráfico de líneas", "Gráfico de área", "Gráfico de barras", "Gráfico de dispersión"]);
  });

  test("shows a 'no matches' row when nothing matches", async ({ page }) => {
    await page.goto(PAGE, { waitUntil: "networkidle" });

    await page.fill("[data-sidebar-filter]", "zzz-nothing-matches-zzz");
    await expect.poll(() => visibleTitles(page)).toEqual([]);
    await expect.poll(() => visibleGroups(page)).toEqual([]);
    await expect(page.locator('[data-sidebar-empty]')).toBeVisible();
  });

  test("`/` focuses the filter and Escape clears it", async ({ page }) => {
    await page.goto(PAGE, { waitUntil: "networkidle" });

    const filter = page.locator("[data-sidebar-filter]");
    await expect(filter).not.toBeFocused();

    await page.locator("body").click();
    await page.keyboard.press("/");
    await expect(filter).toBeFocused();

    const fullTitles = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLLIElement>('.sidebar [data-sidebar-item]')].map(
        (li) => li.querySelector("a")?.textContent?.trim() ?? "",
      ),
    );

    await filter.fill("chart");
    await expect.poll(() => visibleTitles(page)).toEqual(["Line Chart", "Area Chart", "Bar Chart", "Scatter Chart"]);

    await page.keyboard.press("Escape");

    await expect(filter).toHaveValue("");
    await expect.poll(() => visibleTitles(page)).toEqual(fullTitles);
  });
});
