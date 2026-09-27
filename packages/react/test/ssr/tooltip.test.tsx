import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import TooltipSection from "../../playground/sections/tooltip.js";

describe("Tooltip SSR", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const html = renderToString(<TooltipSection open={false} />);
    // Ark's Root renders no element: the recipe lands on each content, which
    // reaches the server hidden and closed, with the tooltip role.
    expect(partAttrs(html, "tooltip", "content", "data-size")).toEqual(["md", "sm"]);
    expect(partAttrs(html, "tooltip", "content", "data-state")).toEqual(["closed", "closed"]);
    expect(partAttrs(html, "tooltip", "content", "role")).toEqual(["tooltip", "tooltip"]);
    expect(
      partTags(html, "tooltip", "content").every((tag) => /\shidden(?:=""|[\s>])/.test(tag)),
    ).toBe(true);
    expect(partAttrs(html, "tooltip", "trigger", "aria-describedby")).toEqual([
      undefined,
      undefined,
    ]);
    expect(partTags(html, "tooltip", "arrow-tip")).toHaveLength(1);
  });

  it("serialises an open tooltip: shown, and describing its trigger", () => {
    const html = renderToString(<TooltipSection open />);
    const [contentId] = partAttrs(html, "tooltip", "content", "id");
    expect(partAttrs(html, "tooltip", "content", "data-state")).toEqual(["open", "closed"]);
    expect(partAttrs(html, "tooltip", "trigger", "aria-describedby")).toEqual([
      contentId,
      undefined,
    ]);
  });
});
