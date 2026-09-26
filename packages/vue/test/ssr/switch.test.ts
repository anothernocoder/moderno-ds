// @vitest-environment node
import { describe, expect, it } from "vitest";
import { partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import SwitchSection from "../../playground/sections/switch.js";
import { renderSection } from "./render-section.js";

describe("Switch SSR (Vue)", () => {
  it("server-renders its playground section to a stable HTML string", async () => {
    const html = await renderSection(SwitchSection);
    // The on/off state reaches every part on the server, the recipe lands on
    // each root, and the hidden input already carries the switch role (and its
    // checked state) before hydration.
    expect(partAttrs(html, "switch", "root", "data-size")).toEqual(["md", "sm"]);
    expect(partAttrs(html, "switch", "control", "data-state")).toEqual(["checked", "unchecked"]);
    expect(partAttrs(html, "switch", "thumb", "data-state")).toEqual(["checked", "unchecked"]);
    // Vue serialises a bare `data-disabled`, the others `data-disabled=""`.
    const disabledRoots = partTags(html, "switch", "root").map((tag) =>
      /\sdata-disabled(?:=""|[\s>])/.test(tag),
    );
    expect(disabledRoots).toEqual([false, true]);
    const switchInputs = html.match(/<input[^>]*role="switch"[^>]*>/g) ?? [];
    expect(switchInputs).toHaveLength(2);
    expect(switchInputs[0]).toMatch(/\schecked(?:=""|[\s>/])/);
    expect(switchInputs[1]).toMatch(/\sdisabled(?:=""|[\s>/])/);
  });
});
