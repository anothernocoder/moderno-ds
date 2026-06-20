import { describe, expect, it } from "vitest";
import { buildLineChart } from "../src/index.js";

// A deliberately round viewport so every projected pixel is exact:
// plot = x20 y10 w90 h90  →  xScale [0,10]→[20,110], yScale [0,100]→[100,10].
const base = {
  width: 120,
  height: 120,
  margin: { top: 10, right: 10, bottom: 20, left: 20 },
  xDomain: [0, 10] as const,
  yDomain: [0, 100] as const,
} as const;

describe("buildLineChart", () => {
  it("projects points and emits an exact polyline path", () => {
    const model = buildLineChart({
      ...base,
      series: [
        {
          name: "a",
          points: [
            { x: 0, y: 0 },
            { x: 10, y: 100 },
          ],
        },
      ],
    });

    expect(model.plot).toEqual({ x: 20, y: 10, width: 90, height: 90 });
    expect(model.baseline).toBe(100);
    expect(model.series[0]!.points).toEqual([
      { value: { x: 0, y: 0 }, cx: 20, cy: 100 },
      { value: { x: 10, y: 100 }, cx: 110, cy: 10 },
    ]);
    expect(model.series[0]!.path).toBe("M20,100L110,10");
    expect(model.series[0]!.index).toBe(0);
  });

  it("computes axis ticks at exact pixel positions", () => {
    const model = buildLineChart({
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
    expect(model.xAxis.map((t) => t.value)).toEqual([0, 2, 4, 6, 8, 10]);
    expect(model.xAxis.map((t) => t.position)).toEqual([20, 38, 56, 74, 92, 110]);
    expect(model.yAxis.map((t) => t.value)).toEqual([0, 20, 40, 60, 80, 100]);
    expect(model.yAxis.map((t) => t.position)).toEqual([100, 82, 64, 46, 28, 10]);
  });

  it("indexes multiple series for per-series theming", () => {
    const model = buildLineChart({
      ...base,
      series: [
        { points: [{ x: 0, y: 10 }] },
        { points: [{ x: 0, y: 20 }] },
        { points: [{ x: 0, y: 30 }] },
      ],
    });
    expect(model.series.map((s) => s.index)).toEqual([0, 1, 2]);
  });

  // ── Edge cases the DoD names ──────────────────────────────────────────────
  it("handles an empty dataset without throwing", () => {
    const model = buildLineChart({ width: 120, height: 120, series: [] });
    expect(model.series).toEqual([]);
    // Falls back to a [0,1] x-domain so axes still render.
    expect(model.xAxis.length).toBeGreaterThan(0);
  });

  it("handles a series with no points (empty path)", () => {
    const model = buildLineChart({ ...base, series: [{ points: [] }] });
    expect(model.series[0]!.path).toBe("");
    expect(model.series[0]!.points).toEqual([]);
  });

  it("centres a single point instead of collapsing the domain", () => {
    const model = buildLineChart({
      width: 120,
      height: 120,
      margin: { top: 10, right: 10, bottom: 20, left: 20 },
      series: [{ points: [{ x: 5, y: 5 }] }],
    });
    const [p] = model.series[0]!.points;
    // x-domain centres to [4,6] → pixel 65; y nices to [0,5] → top of plot.
    expect(p).toEqual({ value: { x: 5, y: 5 }, cx: 65, cy: 10 });
    // d3 closes a one-point path with Z (matches ssr-safety.test).
    expect(model.series[0]!.path).toBe("M65,10Z");
  });

  it("places negative values below the baseline", () => {
    const model = buildLineChart({
      ...base,
      yDomain: [-100, 100],
      series: [
        {
          points: [
            { x: 0, y: -100 },
            { x: 10, y: 100 },
          ],
        },
      ],
    });
    // yScale [-100,100] → [100,10]: 0 sits at the midpoint pixel 55.
    expect(model.baseline).toBe(55);
    expect(model.series[0]!.points[0]!.cy).toBe(100); // -100 at plot bottom
    expect(model.series[0]!.points[1]!.cy).toBe(10); // +100 at plot top
  });
});
