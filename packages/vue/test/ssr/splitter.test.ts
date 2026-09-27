// @vitest-environment node
import { describe, expect, it } from "vitest";
import { partAttrs } from "../../../core/test/ssr-parts.ts";
import SplitterSection from "../../playground/sections/splitter.js";
import { renderSection } from "./render-section.js";

describe("Splitter SSR (Vue)", () => {
  it("server-renders its playground section to a stable HTML string", async () => {
    const html = await renderSection(SplitterSection);
    // Ark's splitter machine. The recipe lands on each root, each panel reaches
    // the server already sized from defaultSize (no jump on hydration), and
    // each trigger is a named separator with its value, bounds and the ids of
    // the two panels it moves.
    expect(partAttrs(html, "splitter", "root", "data-variant")).toEqual(["line", "enclosed"]);
    expect(partAttrs(html, "splitter", "root", "data-orientation")).toEqual([
      "horizontal",
      "vertical",
    ]);
    const panelStyles = partAttrs(html, "splitter", "panel", "style");
    expect(panelStyles.map((style) => style?.match(/flex-grow:\s*([\d.]+)/)?.[1])).toEqual([
      "30.0",
      "70.0",
      "75.0",
      "25.0",
    ]);
    expect(partAttrs(html, "splitter", "resize-trigger", "role")).toEqual([
      "separator",
      "separator",
    ]);
    expect(partAttrs(html, "splitter", "resize-trigger", "aria-label")).toEqual([
      "Resize files and editor",
      "Resize code and console",
    ]);
    expect(partAttrs(html, "splitter", "resize-trigger", "aria-valuenow")).toEqual(["30", "75"]);
    expect(partAttrs(html, "splitter", "resize-trigger", "aria-valuemin")).toEqual(["20", "0"]);
    expect(partAttrs(html, "splitter", "resize-trigger", "aria-valuemax")).toEqual(["70", "80"]);
    const panelIds = partAttrs(html, "splitter", "panel", "id");
    expect(partAttrs(html, "splitter", "resize-trigger", "aria-controls")).toEqual([
      `${panelIds[0]} ${panelIds[1]}`,
      `${panelIds[2]} ${panelIds[3]}`,
    ]);
    expect(partAttrs(html, "splitter", "resize-trigger-indicator", "data-orientation")).toEqual([
      "horizontal",
      "vertical",
    ]);
  });
});
