import { describe, expect, it } from "vitest";
import { parsePartial, prop, ruleDecls } from "./stylesheet.ts";

const root = parsePartial("chart");
const SCOPE = `[data-scope="chart"]`;

/*
 * A donut slice holds no colour of its own: it sits in a series group, which
 * maps its index to a --chart-* slot through `color`, and the slice fills with
 * currentColor. So the ring's colours come from --chart-* only.
 */
describe("@moderno-ui/core components.css — DonutChart", () => {
  it("fills a slice with its series colour and draws no outline", () => {
    const slice = ruleDecls(root, `${SCOPE}[data-part="slice"]`);
    expect(prop(slice, "fill")).toBe("currentColor");
    expect(prop(slice, "stroke")).toBe("none");
  });

  it.each([
    ["0", "var(--chart-1)", `${SCOPE}[data-part="series"]`],
    ["1", "var(--chart-2)", `${SCOPE}[data-part="series"][data-series="1"]`],
    ["2", "var(--chart-3)", `${SCOPE}[data-part="series"][data-series="2"]`],
    ["3", "var(--chart-4)", `${SCOPE}[data-part="series"][data-series="3"]`],
    ["4", "var(--chart-5)", `${SCOPE}[data-part="series"][data-series="4"]`],
  ])("paints slice %s from %s", (_index, slot, selector) => {
    expect(prop(ruleDecls(root, selector), "color")).toBe(slot);
  });
});
