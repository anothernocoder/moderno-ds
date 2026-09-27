import { describe, expect, it } from "vitest";
import { render } from "svelte/server";
import { partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import PopoverSection from "../../playground/sections/Popover.svelte";

describe("Popover SSR (Svelte, server-only island)", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const { html } = render(PopoverSection, { props: { open: false } });
    // Ark's popover machine. Each trigger announces a dialog it controls,
    // closed; each content is that dialog, hidden, labelled by its own title
    // and description, and carries the size its Root picked.
    const contentIds = partAttrs(html, "popover", "content", "id");
    expect(contentIds).toHaveLength(2);
    expect(partAttrs(html, "popover", "trigger", "aria-haspopup")).toEqual(["dialog", "dialog"]);
    expect(partAttrs(html, "popover", "trigger", "aria-expanded")).toEqual(["false", "false"]);
    expect(partAttrs(html, "popover", "trigger", "aria-controls")).toEqual(contentIds);
    expect(partAttrs(html, "popover", "content", "role")).toEqual(["dialog", "dialog"]);
    // Vue serialises a bare `hidden`, the others `hidden=""`.
    const hidden = partTags(html, "popover", "content").map((tag) =>
      /\shidden(?:=""|[\s>])/.test(tag),
    );
    expect(hidden).toEqual([true, true]);
    expect(partAttrs(html, "popover", "content", "data-size")).toEqual(["md", "lg"]);
    expect(partAttrs(html, "popover", "content", "aria-labelledby")).toEqual(
      partAttrs(html, "popover", "title", "id"),
    );
    expect(partAttrs(html, "popover", "content", "aria-describedby")).toEqual(
      partAttrs(html, "popover", "description", "id"),
    );
    expect(partAttrs(html, "popover", "close-trigger", "aria-label")).toEqual(["Close"]);
    expect(partAttrs(html, "popover", "arrow-tip", "data-part")).toEqual(["arrow-tip"]);
    expect(partAttrs(html, "popover", "indicator", "data-state")).toEqual(["closed"]);
  });

  it("serialises the open state when the popover starts open", () => {
    const { html } = render(PopoverSection, { props: { open: true } });
    expect(partAttrs(html, "popover", "trigger", "aria-expanded")).toEqual(["true", "false"]);
    expect(partAttrs(html, "popover", "content", "data-state")).toEqual(["open", "closed"]);
  });
});
