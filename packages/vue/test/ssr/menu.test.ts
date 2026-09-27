// @vitest-environment node
import { describe, expect, it } from "vitest";
import { attrOf, partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import MenuSection from "../../playground/sections/menu.js";
import { renderSection } from "./render-section.js";

describe("Menu SSR (Vue)", () => {
  it("server-renders its playground section to a stable HTML string", async () => {
    const html = await renderSection(MenuSection);
    // Ark's menu machine. The recipe lands on the trigger and on both
    // contents (the submenu takes its parent's size); the trigger names the
    // content it controls, and the content is a hidden menu labelled by it.
    const trigger = partTags(html, "menu", "trigger")[0]!;
    expect(attrOf(trigger, "data-size")).toBe("sm");
    expect(attrOf(trigger, "aria-haspopup")).toBe("menu");
    expect(attrOf(trigger, "aria-expanded")).toBe("false");
    expect(partAttrs(html, "menu", "content", "data-size")).toEqual(["sm", "sm"]);
    expect(partAttrs(html, "menu", "content", "role")).toEqual(["menu", "menu"]);
    const content = partTags(html, "menu", "content")[0]!;
    expect(content).toMatch(/\shidden(?:=""|[\s>])/);
    expect(attrOf(content, "aria-labelledby")).toBe(attrOf(trigger, "id"));
    expect(attrOf(trigger, "aria-controls")).toBe(attrOf(content, "id"));
    // Items keep their roles and states.
    expect(partAttrs(html, "menu", "item", "role")).toEqual([
      "menuitem",
      "menuitem",
      "menuitemcheckbox",
      "menuitem",
    ]);
    expect(partAttrs(html, "menu", "item", "aria-disabled")).toEqual([
      undefined,
      "true",
      undefined,
      undefined,
    ]);
    expect(partAttrs(html, "menu", "item", "aria-checked")[2]).toBe("true");
    expect(partAttrs(html, "menu", "separator", "role")).toEqual(["separator"]);
  });
});
