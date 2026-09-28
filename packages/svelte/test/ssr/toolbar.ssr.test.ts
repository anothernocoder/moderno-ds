import { render } from "svelte/server";
import { describe, expect, it } from "vitest";
import { attrOf, partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import ToolbarSection from "../../playground/sections/Toolbar.svelte";

describe("Toolbar SSR (Svelte, server-only island)", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const { html } = render(ToolbarSection, { props: { open: false } });
    // The toolbar machine from core, bound with @zag-js/svelte. The roots carry
    // role, name, orientation and the recipe's size; the items their names,
    // pressed state and disabled flag; the separators turn across the bar.
    expect(partAttrs(html, "toolbar", "root", "role")).toEqual(["toolbar", "toolbar"]);
    expect(partAttrs(html, "toolbar", "root", "aria-label")).toEqual([
      "Canvas tools",
      "Drawing tools",
    ]);
    expect(partAttrs(html, "toolbar", "root", "aria-orientation")).toEqual([
      "horizontal",
      "vertical",
    ]);
    expect(partAttrs(html, "toolbar", "root", "data-size")).toEqual(["md", "sm"]);
    expect(partAttrs(html, "toolbar", "button", "aria-label")).toEqual([
      "Undo",
      "Redo",
      "More",
      undefined,
      undefined,
    ]);
    expect(partAttrs(html, "toolbar", "button", "aria-disabled")).toEqual([
      undefined,
      "true",
      undefined,
      undefined,
      undefined,
    ]);
    expect(partAttrs(html, "toolbar", "toggle", "aria-pressed")).toEqual(["true", "false"]);
    expect(partAttrs(html, "toolbar", "toggle", "data-state")).toEqual(["on", "off"]);
    expect(partAttrs(html, "toolbar", "group", "role")).toEqual(["group"]);
    expect(partAttrs(html, "toolbar", "separator", "aria-orientation")).toEqual([
      "vertical",
      "vertical",
    ]);
    // Before the machine has seen the DOM, every item is a Tab stop.
    const items = [...partTags(html, "toolbar", "button"), ...partTags(html, "toolbar", "toggle")];
    expect(items.map((tag) => attrOf(tag, "tabindex"))).toEqual(items.map(() => "0"));
    // A disabled item stays focusable: no native disabled.
    expect(items.some((tag) => /\sdisabled(?:=""|[\s>])/.test(tag))).toBe(false);
    // The menu trigger is a toolbar button that opens a menu.
    expect(attrOf(partTags(html, "toolbar", "button")[2]!, "aria-haspopup")).toBe("menu");
  });
});
