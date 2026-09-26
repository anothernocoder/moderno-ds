import { describe, expect, it } from "vitest";
import { render } from "svelte/server";
import { attrOf, partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import ToggleGroupSection from "../../playground/sections/ToggleGroup.svelte";

describe("ToggleGroup SSR (Svelte, server-only island)", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const { html } = render(ToggleGroupSection, { props: { open: false } });
    // Ark's toggle-group machine on native buttons. The recipe lands on each root, the pressed
    // state reaches the server string (aria-checked / aria-pressed / data-state), and each group
    // carries its role and orientation.
    expect(partAttrs(html, "toggle-group", "root", "data-variant")).toEqual(["ghost", "outline"]);
    expect(partAttrs(html, "toggle-group", "root", "data-size")).toEqual(["md", "lg"]);
    expect(partAttrs(html, "toggle-group", "root", "data-orientation")).toEqual([
      "horizontal",
      "vertical",
    ]);
    expect(partAttrs(html, "toggle-group", "root", "role")).toEqual(["radiogroup", "group"]);
    expect(partAttrs(html, "toggle-group", "item", "data-state")).toEqual([
      "off",
      "on",
      "off",
      "off",
    ]);
    const groupItems = partTags(html, "toggle-group", "item");
    expect(groupItems.slice(0, 2).map((tag) => attrOf(tag, "aria-checked"))).toEqual([
      "false",
      "true",
    ]);
    expect(groupItems.slice(2).map((tag) => attrOf(tag, "aria-pressed"))).toEqual([
      "false",
      "false",
    ]);
    expect(groupItems.map((tag) => /\sdisabled(?:=""|[\s>])/.test(tag))).toEqual([
      false,
      false,
      true,
      true,
    ]);
  });
});
