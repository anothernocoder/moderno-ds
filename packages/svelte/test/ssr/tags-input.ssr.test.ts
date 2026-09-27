import { describe, expect, it } from "vitest";
import { render } from "svelte/server";
import { partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import TagsInputSection from "../../playground/sections/TagsInput.svelte";

describe("TagsInput SSR (Svelte, server-only island)", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const { html } = render(TagsInputSection, { props: { open: false } });
    // TagsInput: Ark's tags-input machine. The recipe lands on each root,
    // every tag reaches the server with its value and a named delete trigger,
    // the label points at the input, and a disabled root is already marked.
    expect(partAttrs(html, "tags-input", "root", "data-size")).toEqual(["md", "sm"]);
    expect(partAttrs(html, "tags-input", "item", "data-value")).toEqual(["React", "Vue", "Design"]);
    expect(partAttrs(html, "tags-input", "item-delete-trigger", "aria-label")).toEqual([
      "Delete tag React",
      "Delete tag Vue",
      "Delete tag Design",
    ]);
    expect(partAttrs(html, "tags-input", "label", "for")).toEqual(
      partAttrs(html, "tags-input", "input", "id"),
    );
    const disabledRoots = partTags(html, "tags-input", "root").map((tag) =>
      /\sdata-disabled(?:=""|[\s>])/.test(tag),
    );
    expect(disabledRoots).toEqual([false, true]);
    // The hidden input carries the tags to a form, in one string.
    const hiddenInputs = html.match(/<input[^>]*name="tags"[^>]*>/g) ?? [];
    expect(hiddenInputs.map((tag) => /\svalue="([^"]*)"/.exec(tag)?.[1])).toEqual([
      "React, Vue",
      "Design",
    ]);
  });
});
