import { describe, expect, it } from "vitest";
import {
  areaChartNodes,
  barChartNodes,
  buildLineChart,
  chartNodeToSvg,
  lineChartNodes,
  scatterChartNodes,
  type ChartNode,
} from "../src/index.js";

const cartesian = {
  width: 200,
  height: 120,
  xDomain: [0, 10] as const,
  yDomain: [0, 100] as const,
  series: [
    {
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 100 },
      ],
    },
    {
      points: [
        { x: 0, y: 50 },
        { x: 10, y: 25 },
      ],
    },
  ],
};

function find(node: ChartNode, part: string): ChartNode[] {
  const own = node.attrs["data-part"] === part ? [node] : [];
  return [...own, ...(node.children ?? []).flatMap((c) => find(c, part))];
}

describe("chart render tree — shared frame", () => {
  const root = lineChartNodes(cartesian);
  const model = buildLineChart(cartesian);

  it("emits the complete root contract attributes", () => {
    expect(root.tag).toBe("svg");
    expect(root.attrs).toMatchObject({
      viewBox: "0 0 200 120",
      role: "img",
      preserveAspectRatio: "xMidYMid meet",
      "data-scope": "chart",
      "data-part": "root",
      "data-chart": "line",
    });
  });

  it("emits one grid line per y tick inside a grid group", () => {
    const grid = find(root, "grid");
    expect(grid).toHaveLength(1);
    expect(find(root, "grid-line")).toHaveLength(model.yAxis.length);
  });

  it("anchors tick labels — the math lives here, not in the bindings", () => {
    const bottom = model.plot.y + model.plot.height;
    const [xLabel] = find(root, "tick-label").filter((n) => n.attrs["data-orientation"] === "x");
    expect(xLabel!.attrs["y"]).toBe(bottom + 16); // LABEL_GAP + font offset
    const [yLabel] = find(root, "tick-label").filter((n) => n.attrs["data-orientation"] === "y");
    expect(yLabel!.attrs["x"]).toBe(model.plot.x - 8);
    expect(yLabel!.attrs["y"]).toBe(model.yAxis[0]!.position + 4);
    expect(yLabel!.text).toBe(model.yAxis[0]!.label);
  });

  it("emits both axis lines", () => {
    expect(find(root, "axis-line")).toHaveLength(2);
  });

  it("carries data-scope on every part — components.css compounds scope+part", () => {
    const walk = (n: ChartNode): ChartNode[] => [n, ...(n.children ?? []).flatMap(walk)];
    for (const n of walk(root)) {
      expect(n.attrs["data-scope"], `<${n.tag} data-part="${n.attrs["data-part"]}">`).toBe(
        "chart",
      );
    }
  });
});

describe("chart render tree — per-chart shapes", () => {
  it("line: one series group with one path each", () => {
    const root = lineChartNodes(cartesian);
    const series = find(root, "series");
    expect(series).toHaveLength(2);
    expect(series.map((s) => s.attrs["data-series"])).toEqual([0, 1]);
    expect(find(root, "line").every((n) => String(n.attrs["d"]).startsWith("M"))).toBe(true);
  });

  it("area: a filled area plus its top line per series", () => {
    const root = areaChartNodes(cartesian);
    expect(find(root, "area")).toHaveLength(2);
    expect(find(root, "line")).toHaveLength(2);
  });

  it("bar: one rect per category per series", () => {
    const root = barChartNodes({
      width: 200,
      height: 120,
      categories: ["a", "b", "c"],
      series: [{ values: [10, 20, 30] }],
    });
    expect(root.attrs["data-chart"]).toBe("bar");
    expect(find(root, "bar")).toHaveLength(3);
  });

  it("scatter: one circle per point with the requested radius", () => {
    const root = scatterChartNodes({ ...cartesian, radius: 5 });
    const points = find(root, "point");
    expect(points).toHaveLength(4);
    expect(points[0]!.attrs["r"]).toBe(5);
  });
});

describe("chartNodeToSvg — reference serialization", () => {
  it("serializes the tree deterministically with explicit closing tags", () => {
    const svg = chartNodeToSvg(lineChartNodes(cartesian));
    expect(svg.startsWith('<svg viewBox="0 0 200 120" role="img"')).toBe(true);
    expect(svg).toContain('<g data-scope="chart" data-part="grid">');
    expect(svg).toContain("</svg>");
    expect(svg).not.toContain("/>");
    expect(chartNodeToSvg(lineChartNodes(cartesian))).toBe(svg);
  });

  it("escapes text and attribute values", () => {
    const svg = chartNodeToSvg({
      tag: "text",
      attrs: { "data-part": 'a"b' },
      text: "1 < 2 & 3",
    });
    expect(svg).toBe('<text data-part="a&quot;b">1 &lt; 2 &amp; 3</text>');
  });
});
