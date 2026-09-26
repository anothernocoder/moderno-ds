// @vitest-environment node
import { describe, expect, it } from "vitest";
import { attrOf, partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import ToggleGroupSection from "../../playground/sections/toggle-group.js";
import { renderSection } from "./render-section.js";

describe("ToggleGroup SSR (Vue)", () => {
  it("server-renders its playground section to a stable HTML string", async () => {
    const html = await renderSection(ToggleGroupSection);
    // The recipe lands on each root, each group carries its role and
    // orientation, and the pressed state reaches the server string
    // (aria-checked / aria-pressed / data-state).
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
