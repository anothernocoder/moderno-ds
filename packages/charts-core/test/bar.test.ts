import { describe, expect, it } from "vitest";
import { buildBarChart } from "../src/index.js";

// padding 0 + one series → bands fill the plot exactly, so pixels are clean:
// plot x20 w90 over 2 categories → bandwidth 45, x = 20 and 65.
const base = {
  width: 120,
  height: 120,
  margin: { top: 10, right: 10, bottom: 20, left: 20 },
  yDomain: [0, 100] as const,
  padding: 0,
} as const;

describe("buildBarChart", () => {
  it("lays out bars from the baseline with exact geometry", () => {
    const model = buildBarChart({
      ...base,
      categories: ["a", "b"],
      series: [{ values: [50, 100] }],
    });
    expect(model.baseline).toBe(100);
    expect(model.series[0]!.bars).toEqual([
      { category: "a", value: 50, x: 20, y: 55, width: 45, height: 45 },
      { category: "b", value: 100, x: 65, y: 10, width: 45, height: 90 },
    ]);
  });

  it("positions category labels at each group's centre", () => {
    const model = buildBarChart({
      ...base,
      categories: ["a", "b"],
      series: [{ values: [50, 100] }],
    });
    expect(model.xAxis).toEqual([
      { value: 0, position: 42.5, label: "a" },
      { value: 1, position: 87.5, label: "b" },
    ]);
  });

  it("draws negative bars downward from the baseline", () => {
    const model = buildBarChart({
      ...base,
      categories: ["a"],
      yDomain: [-100, 100],
      series: [{ values: [-100] }],
    });
    expect(model.baseline).toBe(55);
    const bar = model.series[0]!.bars[0]!;
    expect(bar.y).toBe(55); // top edge sits on the baseline…
    expect(bar.height).toBe(45); // …and the body extends below it
  });

  it("splits a category's slot across grouped series without overlap", () => {
    const model = buildBarChart({
      ...base,
      categories: ["a"],
      series: [{ values: [40] }, { values: [80] }],
    });
    const a = model.series[0]!.bars[0]!;
    const b = model.series[1]!.bars[0]!;
    expect(model.series).toHaveLength(2);
    expect(a.x + a.width).toBeLessThanOrEqual(b.x + 0.01); // a is left of b
    expect(a.width).toBeGreaterThan(0);
  });

  it("renders a single category/value as one full-width bar", () => {
    const model = buildBarChart({
      ...base,
      categories: ["a"],
      series: [{ values: [50] }],
    });
    // One category, padding 0 → the band fills the whole plot width.
    expect(model.series[0]!.bars).toEqual([
      { category: "a", value: 50, x: 20, y: 55, width: 90, height: 45 },
    ]);
    expect(model.xAxis).toEqual([{ value: 0, position: 65, label: "a" }]);
  });

  it("handles empty categories and series", () => {
    expect(buildBarChart({ width: 120, height: 120, categories: [], series: [] }).series).toEqual(
      [],
    );
    const noCats = buildBarChart({ ...base, categories: [], series: [{ values: [] }] });
    expect(noCats.series[0]!.bars).toEqual([]);
  });
});
