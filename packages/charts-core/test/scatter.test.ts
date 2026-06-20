import { describe, expect, it } from "vitest";
import { buildScatterChart } from "../src/index.js";

const base = {
  width: 120,
  height: 120,
  margin: { top: 10, right: 10, bottom: 20, left: 20 },
  xDomain: [0, 10] as const,
  yDomain: [0, 100] as const,
} as const;

describe("buildScatterChart", () => {
  it("positions one marker per point with the default radius", () => {
    const model = buildScatterChart({
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
    expect(model.series[0]!.points).toEqual([
      { value: { x: 0, y: 0 }, cx: 20, cy: 100, r: 4 },
      { value: { x: 10, y: 100 }, cx: 110, cy: 10, r: 4 },
    ]);
  });

  it("honours a custom radius", () => {
    const model = buildScatterChart({
      ...base,
      radius: 7,
      series: [{ points: [{ x: 5, y: 50 }] }],
    });
    expect(model.series[0]!.points[0]!.r).toBe(7);
  });

  it("renders a single point without collapsing the domain", () => {
    const model = buildScatterChart({
      width: 120,
      height: 120,
      margin: { top: 10, right: 10, bottom: 20, left: 20 },
      series: [{ points: [{ x: 5, y: 5 }] }],
    });
    expect(model.series[0]!.points[0]).toEqual({
      value: { x: 5, y: 5 },
      cx: 65,
      cy: 10,
      r: 4,
    });
  });

  it("handles empty data", () => {
    expect(buildScatterChart({ width: 120, height: 120, series: [] }).series).toEqual([]);
    expect(buildScatterChart({ ...base, series: [{ points: [] }] }).series[0]!.points).toEqual([]);
  });
});
