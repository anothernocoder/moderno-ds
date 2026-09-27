import { describe, expect, it } from "vitest";
import { buildDonutChart, chartNodeToSvg, donutChartNodes, type ChartNode } from "../src/index.js";

const traffic = {
  width: 100,
  height: 80,
  data: [
    { name: "Direct", value: 1 },
    { name: "Search", value: 3 },
  ],
};

function walk(node: ChartNode): ChartNode[] {
  return [node, ...(node.children ?? []).flatMap(walk)];
}

describe("buildDonutChart", () => {
  it("centres the ring in the viewport and sizes it to the shorter side", () => {
    const model = buildDonutChart(traffic);
    expect(model.center).toEqual({ x: 50, y: 40 });
    expect(model.outerRadius).toBe(40);
    expect(model.innerRadius).toBe(24); // default hole: 0.6 of the outer radius
  });

  it("sizes each slice by its share, clockwise from 12 o'clock in input order", () => {
    const [direct, search] = buildDonutChart(traffic).slices;
    expect(direct).toMatchObject({ name: "Direct", value: 1, index: 0, startAngle: 0 });
    expect(direct!.endAngle).toBeCloseTo(Math.PI / 2, 3);
    expect(search).toMatchObject({ name: "Search", value: 3, index: 1 });
    expect(search!.startAngle).toBeCloseTo(Math.PI / 2, 3);
    expect(search!.endAngle).toBeCloseTo(2 * Math.PI, 3);
  });

  it("never re-sorts: a larger later value still comes second", () => {
    const names = buildDonutChart(traffic).slices.map((s) => s.name);
    expect(names).toEqual(["Direct", "Search"]);
  });

  it("draws absolute paths — the ring needs no transform", () => {
    const [direct] = buildDonutChart(traffic).slices;
    // Starts at the top of the outer circle (50, 0), sweeps to the right edge
    // (90, 40), steps in to the hole and sweeps back.
    expect(direct!.path).toBe("M50,0A40,40,0,0,1,90,40L74,40A24,24,0,0,0,50,16Z");
  });

  it("skips a datum with no positive value but keeps every other slice's index", () => {
    const model = buildDonutChart({
      width: 100,
      height: 100,
      data: [{ value: 2 }, { value: 0 }, { value: -4 }, { value: Number.NaN }, { value: 2 }],
    });
    expect(model.slices.map((s) => s.index)).toEqual([0, 4]);
    expect(model.slices[1]!.startAngle).toBeCloseTo(Math.PI, 3);
  });

  it("draws a pie when innerRadius is 0, and clamps the ratio to 0–1", () => {
    expect(buildDonutChart({ ...traffic, innerRadius: 0 }).innerRadius).toBe(0);
    expect(buildDonutChart({ ...traffic, innerRadius: -1 }).innerRadius).toBe(0);
    expect(buildDonutChart({ ...traffic, innerRadius: 2 }).innerRadius).toBe(40);
    expect(buildDonutChart({ ...traffic, innerRadius: 0.5 }).innerRadius).toBe(20);
  });

  it("opens a gap between slices with padAngle", () => {
    const [plain] = buildDonutChart(traffic).slices;
    const padded = buildDonutChart({ ...traffic, padAngle: 0.1 }).slices;
    expect(padded[0]!.path).not.toBe(plain!.path);
    // The slices still cover the whole circle; the gap is carved out of each one.
    expect(padded[0]!.startAngle).toBe(0);
    expect(padded[1]!.endAngle).toBeCloseTo(2 * Math.PI, 3);
  });

  it("draws one full ring for a single slice", () => {
    const [only] = buildDonutChart({ width: 100, height: 100, data: [{ value: 5 }] }).slices;
    expect(only!.startAngle).toBe(0);
    expect(only!.endAngle).toBeCloseTo(2 * Math.PI, 3);
    // Outer circle, then the hole as its own subpath.
    expect(only!.path.match(/M/g)).toHaveLength(2);
  });

  it("handles empty and all-zero data", () => {
    expect(buildDonutChart({ width: 100, height: 100, data: [] }).slices).toEqual([]);
    expect(buildDonutChart({ width: 100, height: 100, data: [{ value: 0 }] }).slices).toEqual([]);
  });
});

describe("donutChartNodes", () => {
  const root = donutChartNodes(traffic);

  it("emits the root contract attributes with data-chart=donut", () => {
    expect(root.tag).toBe("svg");
    expect(root.attrs).toEqual({
      viewBox: "0 0 100 80",
      role: "img",
      preserveAspectRatio: "xMidYMid meet",
      "data-scope": "chart",
      "data-part": "root",
      "data-chart": "donut",
    });
  });

  it("has no frame: no grid, axis lines or tick labels", () => {
    const parts = walk(root).map((n) => n.attrs["data-part"]);
    expect(parts).toEqual(["root", "series", "slice", "series", "slice"]);
  });

  it("puts each slice in a series group keyed by its data index", () => {
    const series = root.children!;
    expect(series.map((g) => g.attrs["data-series"])).toEqual([0, 1]);
    const model = buildDonutChart(traffic);
    expect(series.map((g) => g.children![0]!.attrs["d"])).toEqual(model.slices.map((s) => s.path));
  });

  it("carries data-scope on every node and no colour of its own", () => {
    for (const n of walk(root)) {
      expect(n.attrs["data-scope"]).toBe("chart");
      expect(n.attrs).not.toHaveProperty("fill");
      expect(n.attrs).not.toHaveProperty("stroke");
      expect(n.attrs).not.toHaveProperty("style");
    }
  });

  it("serialises to the reference SVG the bindings are tested against", () => {
    expect(chartNodeToSvg(donutChartNodes({ width: 10, height: 10, data: [{ value: 1 }] }))).toBe(
      '<svg viewBox="0 0 10 10" role="img" preserveAspectRatio="xMidYMid meet" data-scope="chart" data-part="root" data-chart="donut">' +
        '<g data-scope="chart" data-part="series" data-series="0">' +
        '<path data-scope="chart" data-part="slice" d="M5,0A5,5,0,1,1,5,10A5,5,0,1,1,5,0M5,2A3,3,0,1,0,5,8A3,3,0,1,0,5,2Z"></path>' +
        "</g></svg>",
    );
  });
});
