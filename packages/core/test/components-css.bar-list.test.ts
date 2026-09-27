import { describe, expect, it } from "vitest";
import { parsePartial, prop, ruleDecls } from "./stylesheet.ts";

const root = parsePartial("bar-list");

const part = (name: string) => `[data-chart="bar-list"] [data-scope="chart"][data-part="${name}"]`;

/*
 * A bar list's only colour is its series colour: the bar paints currentColor
 * (chart.css) and the track the same colour, faint, so --chart-* re-colours
 * the whole list. Its names and values are text, and read the neutral
 * foreground slots like a chart's tick labels.
 */
describe("@moderno-ui/core components.css — Bar list", () => {
  it("paints the track from the series colour, never a colour of its own", () => {
    const track = ruleDecls(root, part("track"));
    expect(prop(track, "fill")).toBe("currentColor");
    expect(prop(track, "fill-opacity")).toBe("0.15");
  });

  it("leaves the bar to chart.css, so it keeps the series colour", () => {
    expect(ruleDecls(root, part("bar"))).toEqual([]);
    expect(ruleDecls(root, `[data-scope="chart"][data-part="bar"]`)).toEqual([]);
  });

  it("scopes every rule to the bar list, so other charts' parts stay unpainted", () => {
    root.walkRules((rule) => {
      for (const selector of rule.selectors) {
        expect(selector.startsWith(`[data-chart="bar-list"] `)).toBe(true);
      }
    });
  });

  it("anchors the name to the left edge and the value to the right edge", () => {
    expect(prop(ruleDecls(root, part("label")), "text-anchor")).toBe("start");
    expect(prop(ruleDecls(root, part("value")), "text-anchor")).toBe("end");
  });

  it("centres both texts on the row line, sized from the type scale", () => {
    for (const name of ["label", "value"]) {
      const decls = ruleDecls(root, part(name));
      expect(prop(decls, "dominant-baseline")).toBe("central");
      expect(prop(decls, "font-size")).toBe("var(--text-ui-sm)");
    }
  });

  it("reads the text colours from the neutral foreground slots", () => {
    expect(prop(ruleDecls(root, part("label")), "fill")).toBe("var(--foreground)");
    expect(prop(ruleDecls(root, part("value")), "fill")).toBe("var(--muted-foreground)");
  });
});
