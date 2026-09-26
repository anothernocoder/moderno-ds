import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import RadioGroupSection from "../../playground/sections/radio-group.js";

describe("RadioGroup SSR", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const html = renderToString(<RadioGroupSection open={false} />);
    // Ark's radio machine. The recipe and Ark's orientation land on each root,
    // the checked item reaches its parts on the server, the disabled group is
    // marked, and every native radio is already there with its checked /
    // disabled state before hydration.
    expect(partAttrs(html, "radio-group", "root", "data-size")).toEqual(["md", "sm"]);
    expect(partAttrs(html, "radio-group", "root", "data-orientation")).toEqual([
      "vertical",
      "horizontal",
    ]);
    expect(partAttrs(html, "radio-group", "root", "role")).toEqual(["radiogroup", "radiogroup"]);
    expect(partAttrs(html, "radio-group", "item", "data-state")).toEqual([
      "checked",
      "unchecked",
      "unchecked",
      "unchecked",
    ]);
    expect(partAttrs(html, "radio-group", "item-control", "data-state")).toEqual([
      "checked",
      "unchecked",
      "unchecked",
      "unchecked",
    ]);
    expect(partTags(html, "radio-group", "item-description")).toHaveLength(2);
    const disabledGroups = partTags(html, "radio-group", "root").map((tag) =>
      /\sdata-disabled(?:=""|[\s>])/.test(tag),
    );
    expect(disabledGroups).toEqual([false, true]);
    const radios = html.match(/<input[^>]*type="radio"[^>]*>/g) ?? [];
    expect(radios).toHaveLength(4);
    expect(radios[0]).toMatch(/\schecked(?:=""|[\s>/])/);
    expect(radios[1]).not.toMatch(/\schecked(?:=""|[\s>/])/);
    expect(radios[3]).toMatch(/\sdisabled(?:=""|[\s>/])/);
  });
});
