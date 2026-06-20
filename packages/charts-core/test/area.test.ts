import { describe, expect, it } from "vitest";
import { buildAreaChart } from "../src/index.js";

const base = {
  width: 120,
  height: 120,
  margin: { top: 10, right: 10, bottom: 20, left: 20 },
  xDomain: [0, 10] as const,
  yDomain: [0, 100] as const,
} as const;

describe("buildAreaChart", () => {
  it("emits a closed area from the baseline and a top line", () => {
    const model = buildAreaChart({
      ...base,
      series: [
        {
          points: [
            { x: 0, y: 0 },
            { x: 10, y: 100 },
          ],
        },
      ],
    });
    const s = model.series[0]!;
    expect(model.baseline).toBe(100);
    expect(s.area.startsWith("M")).toBe(true);
    expect(s.area.endsWith("Z")).toBe(true);
    // Top edge of the fill is the same polyline the line chart would draw.
    expect(s.line).toBe("M20,100L110,10");
  });

  it("fills downward from the baseline for negative values", () => {
    const model = buildAreaChart({
      ...base,
      yDomain: [-100, 100],
      series: [
        {
          points: [
            { x: 0, y: -100 },
            { x: 10, y: -50 },
          ],
        },
      ],
    });
    // baseline at value 0 → pixel 55; both points sit below it (cy > 55).
    expect(model.baseline).toBe(55);
    expect(model.series[0]!.points.every((p) => p.cy > 55)).toBe(true);
  });

  it("handles empty data and an empty series", () => {
    expect(buildAreaChart({ width: 120, height: 120, series: [] }).series).toEqual([]);
    const empty = buildAreaChart({ ...base, series: [{ points: [] }] });
    expect(empty.series[0]!.area).toBe("");
    expect(empty.series[0]!.line).toBe("");
  });
});
