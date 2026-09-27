import { describe, expect, it } from "vitest";
import { buildSparkChart, chartNodeToSvg, sparkChartNodes, type ChartNode } from "../src/index.js";

const points = [
  { x: 0, y: 10 },
  { x: 1, y: 30 },
  { x: 2, y: 20 },
];

function find(node: ChartNode, part: string): ChartNode[] {
  const own = node.attrs["data-part"] === part ? [node] : [];
  return [...own, ...(node.children ?? []).flatMap((c) => find(c, part))];
}

describe("buildSparkChart", () => {
  it("defaults to a 120×32 strip with a 3px inset on every side", () => {
    const model = buildSparkChart({ points });
    expect(model.width).toBe(120);
    expect(model.height).toBe(32);
    expect(model.plot).toEqual({ x: 3, y: 3, width: 114, height: 26 });
  });

  it("fits the y domain to the values, not to 0, so the trend fills the height", () => {
    const model = buildSparkChart({ points });
    // min (10) → plot bottom, max (30) → plot top.
    expect(model.points.map((p) => p.cy)).toEqual([29, 3, 16]);
    expect(model.points.map((p) => p.cx)).toEqual([3, 60, 117]);
  });

  it("honours an explicit y domain, so several sparks share one scale", () => {
    const model = buildSparkChart({ points, yDomain: [0, 40] });
    expect(model.points.map((p) => p.cy)).toEqual([22.5, 9.5, 16]);
  });

  it("draws the line through every point", () => {
    expect(buildSparkChart({ points }).line).toBe("M3,29L60,3L117,16");
  });

  it("fills to the plot bottom only when area is set", () => {
    expect(buildSparkChart({ points }).area).toBeUndefined();
    expect(buildSparkChart({ points, area: true }).area).toBe(
      "M3,29L60,3L117,16L117,29L60,29L3,29Z",
    );
  });

  it("marks the last point only when showLastPoint is set", () => {
    expect(buildSparkChart({ points }).marker).toBeUndefined();
    expect(buildSparkChart({ points, showLastPoint: true }).marker).toEqual({
      cx: 117,
      cy: 16,
      r: 3,
    });
  });

  it("keeps a flat series centred instead of collapsing it onto an edge", () => {
    const model = buildSparkChart({ points: points.map((p) => ({ ...p, y: 5 })) });
    expect(model.points.every((p) => p.cy === 16)).toBe(true);
  });

  it("renders nothing for no points", () => {
    const model = buildSparkChart({ points: [], area: true, showLastPoint: true });
    expect(model.line).toBe("");
    expect(model.area).toBe("");
    expect(model.marker).toBeUndefined();
  });
});

describe("sparkChartNodes", () => {
  it("emits the root contract attributes with data-chart=spark", () => {
    const root = sparkChartNodes({ points });
    expect(root.tag).toBe("svg");
    expect(root.attrs).toMatchObject({
      viewBox: "0 0 120 32",
      role: "img",
      "data-scope": "chart",
      "data-part": "root",
      "data-chart": "spark",
    });
  });

  it("has no frame: no grid, axis lines or tick labels", () => {
    const root = sparkChartNodes({ points });
    for (const part of ["grid", "grid-line", "axis-line", "tick-label"]) {
      expect(find(root, part)).toHaveLength(0);
    }
  });

  it("puts every shape in one series group, so it paints from --chart-1", () => {
    const root = sparkChartNodes({ points, area: true, showLastPoint: true });
    const [series, ...rest] = find(root, "series");
    expect(rest).toHaveLength(0);
    expect(series!.attrs["data-series"]).toBe(0);
    expect(series!.children!.map((n) => n.attrs["data-part"])).toEqual(["area", "line", "point"]);
  });

  it("emits only the line by default", () => {
    const root = sparkChartNodes({ points });
    expect(find(root, "line")).toHaveLength(1);
    expect(find(root, "area")).toHaveLength(0);
    expect(find(root, "point")).toHaveLength(0);
  });

  it("carries data-scope on every node", () => {
    const walk = (n: ChartNode): ChartNode[] => [n, ...(n.children ?? []).flatMap(walk)];
    const nodes = walk(sparkChartNodes({ points, area: true, showLastPoint: true }));
    expect(nodes.every((n) => n.attrs["data-scope"] === "chart")).toBe(true);
  });

  it("serializes to a deterministic reference SVG", () => {
    const svg = chartNodeToSvg(sparkChartNodes({ points, showLastPoint: true }));
    expect(svg).toBe(
      '<svg viewBox="0 0 120 32" role="img" preserveAspectRatio="xMidYMid meet" data-scope="chart" data-part="root" data-chart="spark">' +
        '<g data-scope="chart" data-part="series" data-series="0">' +
        '<path data-scope="chart" data-part="line" d="M3,29L60,3L117,16"></path>' +
        '<circle data-scope="chart" data-part="point" cx="117" cy="16" r="3"></circle>' +
        "</g></svg>",
    );
  });
});
