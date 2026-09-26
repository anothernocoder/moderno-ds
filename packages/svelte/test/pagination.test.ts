import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { Pagination } from "../src/index.js";
import Demo from "./fixtures/PaginationFixture.svelte";

afterEach(cleanup);

describe("Pagination surface (Svelte)", () => {
  it("exposes every Ark part, not a hand-maintained subset", async () => {
    const { Pagination: ArkPagination } = await import("@ark-ui/svelte");
    for (const part of Object.keys(ArkPagination)) {
      if (part === "Root") continue; // wrapped below
      expect(
        Pagination[part as keyof typeof Pagination],
        `Pagination.${part} missing`,
      ).toBeDefined();
    }
  });
});

const part = (name: string) =>
  document.querySelector<HTMLElement>(`[data-scope="pagination"][data-part="${name}"]`)!;
const parts = (name: string) => [
  ...document.querySelectorAll<HTMLElement>(`[data-scope="pagination"][data-part="${name}"]`),
];
/** The row as a reader sees it: page numbers, with "…" for each ellipsis. */
const row = () =>
  [
    ...document.querySelectorAll<HTMLElement>(
      `[data-scope="pagination"]:is([data-part="item"], [data-part="ellipsis"])`,
    ),
  ].map((el) => el.textContent?.trim());
const current = () => document.querySelector<HTMLElement>('[aria-current="page"]');

describe("Pagination", () => {
  it("applies the recipe to the root part, defaulting to md", () => {
    render(Demo, { props: { size: "sm" as const } });
    expect(part("root").getAttribute("data-size")).toBe("sm");

    cleanup();
    render(Demo);
    expect(part("root").getAttribute("data-size")).toBe("md");
  });

  it("forwards native attributes to Ark's root", () => {
    render(Demo);
    expect(part("root").className).toBe("pages");
  });

  it("is a named navigation landmark", () => {
    render(Demo);
    expect(screen.getByRole("navigation", { name: "pagination" })).toBe(part("root"));
  });

  it("lists the pages near the current one and skips the rest behind an ellipsis", () => {
    render(Demo, { props: { defaultPage: 5 } });
    expect(row()).toEqual(["1", "…", "4", "5", "6", "…", "10"]);
    expect(parts("ellipsis")).toHaveLength(2);
  });

  it("marks the current page and names every page for a screen reader", () => {
    render(Demo, { props: { defaultPage: 5 } });
    expect(current()?.textContent?.trim()).toBe("5");
    expect(current()?.hasAttribute("data-selected")).toBe(true);
    expect(parts("item").filter((el) => el.hasAttribute("data-selected"))).toHaveLength(1);
    expect(current()?.getAttribute("aria-label")).toBe("page 5");
    expect(parts("item").at(-1)?.getAttribute("aria-label")).toBe("last page, page 10");
  });

  it("goes to a clicked page and reports it", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(Demo, { props: { onPageChange } });
    await user.click(screen.getByRole("button", { name: "last page, page 10" }));
    await waitFor(() => expect(current()?.textContent?.trim()).toBe("10"));
    expect(onPageChange).toHaveBeenLastCalledWith({ page: 10, pageSize: 10 });
    // Ark keeps the row the same length: at an end it fills in more pages.
    expect(row()).toEqual(["1", "…", "6", "7", "8", "9", "10"]);
  });

  it("steps with prev and next, and jumps with first and last", async () => {
    const user = userEvent.setup();
    render(Demo, { props: { defaultPage: 5 } });
    await user.click(part("next-trigger"));
    await waitFor(() => expect(current()?.textContent?.trim()).toBe("6"));
    await user.click(part("prev-trigger"));
    await user.click(part("prev-trigger"));
    await waitFor(() => expect(current()?.textContent?.trim()).toBe("4"));
    await user.click(part("last-trigger"));
    await waitFor(() => expect(current()?.textContent?.trim()).toBe("10"));
    await user.click(part("first-trigger"));
    await waitFor(() => expect(current()?.textContent?.trim()).toBe("1"));
  });

  it("disables prev and first on the first page, next and last on the last", async () => {
    const user = userEvent.setup();
    render(Demo);
    for (const name of ["first-trigger", "prev-trigger"]) {
      expect(part(name), name).toHaveProperty("disabled", true);
      expect(part(name).hasAttribute("data-disabled"), name).toBe(true);
    }
    for (const name of ["next-trigger", "last-trigger"]) {
      expect(part(name), name).toHaveProperty("disabled", false);
    }
    await user.click(part("last-trigger"));
    await waitFor(() => expect(part("next-trigger")).toHaveProperty("disabled", true));
    expect(part("last-trigger")).toHaveProperty("disabled", true);
    expect(part("prev-trigger")).toHaveProperty("disabled", false);
  });

  it("names the triggers for a screen reader", () => {
    render(Demo);
    expect(part("first-trigger").getAttribute("aria-label")).toBe("first page");
    expect(part("prev-trigger").getAttribute("aria-label")).toBe("previous page");
    expect(part("next-trigger").getAttribute("aria-label")).toBe("next page");
    expect(part("last-trigger").getAttribute("aria-label")).toBe("last page");
  });

  it("counts pages from count and pageSize", () => {
    render(Demo, { props: { count: 45, pageSize: 20 } });
    expect(row()).toEqual(["1", "2", "3"]);
  });

  it("shows more pages beside the current one with siblingCount", () => {
    render(Demo, { props: { defaultPage: 10, count: 200, siblingCount: 2 } });
    expect(row()).toEqual(["1", "…", "8", "9", "10", "11", "12", "…", "20"]);
  });

  it("shows more pages at each end with boundaryCount", () => {
    render(Demo, { props: { defaultPage: 10, count: 200, boundaryCount: 2 } });
    expect(row()).toEqual(["1", "2", "…", "9", "10", "11", "…", "19", "20"]);
  });

  it("follows a controlled page", async () => {
    const { rerender } = render(Demo, { props: { page: 2 } });
    expect(current()?.textContent?.trim()).toBe("2");
    await rerender({ page: 7 });
    await waitFor(() => expect(current()?.textContent?.trim()).toBe("7"));
  });
});
