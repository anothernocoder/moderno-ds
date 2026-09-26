import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { attrOf, partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import TabsSection from "../../playground/sections/tabs.js";

describe("Tabs SSR", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const html = renderToString(<TabsSection open={false} />);
    // Ark's tabs machine. The recipe lands on each root, the list is a
    // tablist, the selected tab reaches the server string (aria-selected +
    // data-selected), every panel is labelled by its own tab's id, the panels of
    // unselected tabs are hidden, and a disabled tab is a disabled button.
    expect(partAttrs(html, "tabs", "root", "data-variant")).toEqual(["line", "enclosed"]);
    expect(partAttrs(html, "tabs", "root", "data-size")).toEqual(["md", "sm"]);
    expect(partAttrs(html, "tabs", "root", "data-orientation")).toEqual(["horizontal", "vertical"]);
    expect(partAttrs(html, "tabs", "list", "role")).toEqual(["tablist", "tablist"]);
    expect(partTags(html, "tabs", "indicator")).toHaveLength(2);
    const tabTriggers = partTags(html, "tabs", "trigger");
    expect(tabTriggers.map((tag) => attrOf(tag, "aria-selected"))).toEqual([
      "true",
      "false",
      "false",
      "true",
    ]);
    expect(tabTriggers.map((tag) => /\sdata-selected(?:=""|[\s>])/.test(tag))).toEqual([
      true,
      false,
      false,
      true,
    ]);
    expect(tabTriggers.map((tag) => /\sdisabled(?:=""|[\s>])/.test(tag))).toEqual([
      false,
      false,
      true,
      false,
    ]);
    const tabPanels = partTags(html, "tabs", "content");
    expect(tabPanels.map((tag) => attrOf(tag, "role"))).toEqual([
      "tabpanel",
      "tabpanel",
      "tabpanel",
      "tabpanel",
    ]);
    expect(tabPanels.map((tag) => attrOf(tag, "aria-labelledby"))).toEqual(
      tabTriggers.map((tag) => attrOf(tag, "id")),
    );
    expect(tabPanels.map((tag) => /\shidden(?:=""|[\s>])/.test(tag))).toEqual([
      false,
      true,
      true,
      false,
    ]);
    expect(html).toContain("Account panel");
    expect(html).toContain("Team panel");
  });
});
