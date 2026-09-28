import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { attrOf, partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import SortableListSection from "../../playground/sections/sortable-list.js";

/** Whether an open tag carries `name`, written bare or as `name=""`. */
const has = (name: string) => (tag: string) => new RegExp(`\\s${name}(?:=""|[\\s>])`).test(tag);

describe("SortableList SSR", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const html = renderToString(<SortableListSection open={false} />);
    // The sortable-list machine from core on a <ul>. The recipe lands on each
    // root, the first trigger holds the Tab stop, each handle is named after
    // its item, and a disabled item or list reaches the server string.
    expect(partAttrs(html, "sortable-list", "root", "data-size")).toEqual(["md", "sm"]);
    expect(partAttrs(html, "sortable-list", "root", "role")).toEqual(["list", "list"]);
    expect(partTags(html, "sortable-list", "root").map(has("data-disabled"))).toEqual([
      false,
      true,
    ]);
    expect(partTags(html, "sortable-list", "root").map((tag) => tag.slice(0, 3))).toEqual([
      "<ul",
      "<ul",
    ]);
    expect(partAttrs(html, "sortable-list", "item", "data-value")).toEqual([
      "title",
      "logo",
      "colors",
      "a",
      "b",
    ]);
    expect(partTags(html, "sortable-list", "item").map(has("data-disabled"))).toEqual([
      true,
      false,
      false,
      true,
      true,
    ]);
    expect(partAttrs(html, "sortable-list", "item-handle", "aria-label")).toEqual([
      "Reorder Title",
      "Reorder Logo",
      "Reorder Colors",
    ]);
    expect(partTags(html, "sortable-list", "item-handle").map(has("disabled"))).toEqual([
      true,
      false,
      false,
    ]);
    expect(partAttrs(html, "sortable-list", "item-trigger", "tabindex")).toEqual([
      "0",
      "-1",
      "-1",
      "0",
      "-1",
    ]);
    expect(partTags(html, "sortable-list", "item").every((tag) => !attrOf(tag, "style"))).toBe(
      true,
    );
  });
});
