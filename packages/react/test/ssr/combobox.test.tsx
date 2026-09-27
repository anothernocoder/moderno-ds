import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import ComboboxSection from "../../playground/sections/combobox.js";

describe("Combobox SSR", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const html = renderToString(<ComboboxSection open={false} />);
    // Ark's combobox machine. Each input is a combobox named by its label and
    // controlling its listbox, closed; each listbox is hidden and carries no
    // size (it is portalled in real use), the root does.
    expect(partAttrs(html, "combobox", "root", "data-size")).toEqual(["md", "sm", "lg"]);
    const inputIds = partAttrs(html, "combobox", "input", "id");
    expect(partAttrs(html, "combobox", "label", "for")).toEqual(inputIds);
    expect(partAttrs(html, "combobox", "input", "role")).toEqual([
      "combobox",
      "combobox",
      "combobox",
    ]);
    expect(partAttrs(html, "combobox", "input", "aria-expanded")).toEqual([
      "false",
      "false",
      "false",
    ]);
    expect(partAttrs(html, "combobox", "input", "aria-controls")).toEqual(
      partAttrs(html, "combobox", "content", "id"),
    );
    expect(partAttrs(html, "combobox", "content", "role")).toEqual([
      "listbox",
      "listbox",
      "listbox",
    ]);
    // Vue serialises a bare boolean attribute (`hidden`), the others `hidden=""`.
    const has = (part: string, attr: string) =>
      partTags(html, "combobox", part).map((tag) =>
        new RegExp(`\\s${attr}(?:=""|[\\s>])`).test(tag),
      );
    const hidden = (part: string) => has(part, "hidden");
    expect(hidden("content")).toEqual([true, true, true]);
    // The multiple one lists its two chosen items as selected; only it has a
    // value to clear.
    expect(partAttrs(html, "combobox", "content", "aria-multiselectable")).toEqual([
      undefined,
      "true",
      undefined,
    ]);
    expect(partAttrs(html, "combobox", "item", "aria-selected").filter(Boolean)).toEqual([
      "true",
      "true",
    ]);
    expect(
      partTags(html, "combobox", "item")
        .filter((tag) => tag.includes('data-state="checked"'))
        .map((tag) => /data-value="([^"]*)"/.exec(tag)?.[1]),
    ).toEqual(["vue", "solid"]);
    expect(hidden("clear-trigger")).toEqual([true, false, true]);
    // The empty collection shows the empty state, and only it.
    expect(partTags(html, "combobox", "empty")).toHaveLength(1);
    expect(has("content", "data-empty")).toEqual([false, false, true]);
  });

  it("serialises the open state when the combobox starts open", () => {
    const html = renderToString(<ComboboxSection open />);
    expect(partAttrs(html, "combobox", "input", "aria-expanded")).toEqual([
      "true",
      "false",
      "false",
    ]);
    expect(partAttrs(html, "combobox", "content", "data-state")).toEqual([
      "open",
      "closed",
      "closed",
    ]);
  });
});
