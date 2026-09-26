import { describe, expect, it } from "vitest";
import { render } from "svelte/server";
import { attrOf, partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import PaginationSection from "../../playground/sections/Pagination.svelte";

describe("Pagination SSR (Svelte, server-only island)", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const { html } = render(PaginationSection, { props: { open: false } });
    // Pagination: Ark's pagination machine. The recipe lands on each root; each
    // root reaches the server as a named <nav> with its page list (an ellipsis
    // on both sides of page 5), the current page marked, and prev already
    // disabled on the first page.
    expect(partAttrs(html, "pagination", "root", "data-size")).toEqual(["md", "sm"]);
    expect(partTags(html, "pagination", "root").map((tag) => tag.slice(0, 4))).toEqual([
      "<nav",
      "<nav",
    ]);
    expect(partAttrs(html, "pagination", "root", "aria-label")).toEqual([
      "pagination",
      "pagination",
    ]);
    expect(partAttrs(html, "pagination", "item", "data-index")).toEqual([
      ...["1", "4", "5", "6", "10"],
      ...["1", "2", "3"],
    ]);
    expect(partTags(html, "pagination", "ellipsis")).toHaveLength(2);
    expect(
      partTags(html, "pagination", "item")
        .filter((tag) => attrOf(tag, "aria-current") === "page")
        .map((tag) => attrOf(tag, "data-index")),
    ).toEqual(["5", "1"]);
    const triggersDisabled = (part: string) =>
      partTags(html, "pagination", part).map((tag) => /\sdisabled(?:=""|[\s>])/.test(tag));
    expect(triggersDisabled("prev-trigger")).toEqual([false, true]);
    expect(triggersDisabled("next-trigger")).toEqual([false, false]);
  });
});
