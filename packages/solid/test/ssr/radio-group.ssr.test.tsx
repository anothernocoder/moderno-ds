import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";
import { partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import RadioGroupSection from "../../playground/sections/radio-group.jsx";

describe("RadioGroup SSR (Solid)", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const html = renderToString(() => <RadioGroupSection open={false} />);
    // Ark's radio machine. The recipe and Ark's orientation land on each root,
    // the checked item reaches its parts on the server, the disabled group is
    // marked, and every native radio is already there with its checked /
    // disabled state before hydration.
    expect(partAttrs(html, "radio-group", "root", "data-size")).toEqual(["md", "sm", "md", "md"]);
    expect(partAttrs(html, "radio-group", "root", "data-orientation")).toEqual([
      "vertical",
      "horizontal",
      "vertical",
      "vertical",
    ]);
    expect(partAttrs(html, "radio-group", "root", "role")).toEqual([
      "radiogroup",
      "radiogroup",
      "radiogroup",
      "radiogroup",
    ]);
    expect(partAttrs(html, "radio-group", "item", "data-state")).toEqual([
      "checked",
      "unchecked",
      "unchecked",
      "unchecked",
      "checked",
      "unchecked",
      "checked",
      "unchecked",
    ]);
    expect(partAttrs(html, "radio-group", "item-control", "data-state")).toEqual([
      "checked",
      "unchecked",
      "unchecked",
      "unchecked",
      "checked",
      "unchecked",
      "checked",
      "unchecked",
    ]);
    expect(partTags(html, "radio-group", "item-description")).toHaveLength(3);
    const disabledGroups = partTags(html, "radio-group", "root").map((tag) =>
      /\sdata-disabled(?:=""|[\s>])/.test(tag),
    );
    expect(disabledGroups).toEqual([false, true, false, false]);
    // The tile variant: its grid and media shape reach the root, each item
    // holds its media, a single disabled tile is marked on its own, and an
    // invalid group marks every tile.
    expect(partAttrs(html, "radio-group", "root", "data-variant")).toEqual([
      "list",
      "list",
      "tile",
      "tile",
    ]);
    expect(partAttrs(html, "radio-group", "root", "data-columns")).toEqual([
      undefined,
      undefined,
      "2",
      "2",
    ]);
    expect(partAttrs(html, "radio-group", "root", "data-aspect-ratio")).toEqual([
      undefined,
      undefined,
      "4:3",
      "4:3",
    ]);
    expect(partTags(html, "radio-group", "item-media")).toHaveLength(4);
    const disabledItems = partTags(html, "radio-group", "item").map((tag) =>
      /\sdata-disabled(?:=""|[\s>])/.test(tag),
    );
    expect(disabledItems).toEqual([false, false, true, true, false, true, false, false]);
    const invalidItems = partTags(html, "radio-group", "item").map((tag) =>
      /\sdata-invalid(?:=""|[\s>])/.test(tag),
    );
    expect(invalidItems).toEqual([false, false, false, false, false, false, true, true]);
    const radios = html.match(/<input[^>]*type="radio"[^>]*>/g) ?? [];
    expect(radios).toHaveLength(8);
    expect(radios[0]).toMatch(/\schecked(?:=""|[\s>/])/);
    expect(radios[1]).not.toMatch(/\schecked(?:=""|[\s>/])/);
    expect(radios[3]).toMatch(/\sdisabled(?:=""|[\s>/])/);
    expect(radios[4]).toMatch(/\schecked(?:=""|[\s>/])/);
    expect(radios[5]).toMatch(/\sdisabled(?:=""|[\s>/])/);
    expect(radios[6]).toMatch(/\schecked(?:=""|[\s>/])/);
  });
});
