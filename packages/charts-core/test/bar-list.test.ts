import { describe, expect, it } from "vitest";
import { barListNodes, buildBarList, chartNodeToSvg, type ChartNode } from "../src/index.js";

// width 300 − name column 100 − value column 50 → a 150px track, so a value of
// half the max draws a 75px bar.
const base = {
  width: 300,
  labelWidth: 100,
  valueWidth: 50,
  rowHeight: 30,
  barHeight: 10,
} as const;

const pages = [
  { name: "/pricing", value: 50 },
  { name: "/", value: 100 },
  { name: "/blog", value: 25 },
];

function find(node: ChartNode, part: string): ChartNode[] {
  const own = node.attrs["data-part"] === part ? [node] : [];
  return [...own, ...(node.children ?? []).flatMap((c) => find(c, part))];
}

describe("buildBarList", () => {
  it("lays out one row per item with exact geometry", () => {
    const model = buildBarList({ ...base, data: pages, sort: "none" });
    expect(model).toMatchObject({ width: 300, height: 90, radius: 5 });
    expect(model.rows[0]).toEqual({
      name: "/pricing",
      value: 50,
      valueLabel: "50",
      center: 15,
      track: { x: 100, y: 10, width: 150, height: 10 },
      bar: { x: 100, y: 10, width: 75, height: 10 },
    });
    expect(model.rows.map((row) => row.center)).toEqual([15, 45, 75]);
  });

  it("sorts largest first by default", () => {
    const model = buildBarList({ ...base, data: pages });
    expect(model.rows.map((row) => row.name)).toEqual(["/", "/pricing", "/blog"]);
    expect(model.rows[0]!.bar.width).toBe(150); // the largest value fills its track
  });

  it("sorts ascending, or keeps the data order with none", () => {
    const names = (sort: "ascending" | "none") =>
      buildBarList({ ...base, data: pages, sort }).rows.map((row) => row.name);
    expect(names("ascending")).toEqual(["/blog", "/pricing", "/"]);
    expect(names("none")).toEqual(["/pricing", "/", "/blog"]);
  });

  it("keeps tied rows in data order", () => {
    const tied = [
      { name: "a", value: 1 },
      { name: "b", value: 1 },
    ];
    expect(buildBarList({ ...base, data: tied }).rows.map((row) => row.name)).toEqual(["a", "b"]);
  });

  it("measures bars against max, clamped to the track", () => {
    const model = buildBarList({
      ...base,
      max: 200,
      sort: "none",
      data: [
        { name: "half", value: 100 },
        { name: "over", value: 400 },
        { name: "negative", value: -20 },
      ],
    });
    expect(model.rows.map((row) => row.bar.width)).toEqual([75, 150, 0]);
  });

  it("prints each value through format", () => {
    const model = buildBarList({ ...base, data: pages, format: (v) => `${v} visits` });
    expect(model.rows.map((row) => row.valueLabel)).toEqual([
      "100 visits",
      "50 visits",
      "25 visits",
    ]);
  });

  it("draws empty bars when every value is zero", () => {
    const model = buildBarList({ ...base, data: [{ name: "none", value: 0 }] });
    expect(model.rows[0]!.bar.width).toBe(0);
  });

  it("uses the documented defaults", () => {
    const model = buildBarList({ width: 400, data: [{ name: "a", value: 1 }] });
    // name column 120, value column 64, row 32, bar 8.
    expect(model).toMatchObject({ height: 32, radius: 4 });
    expect(model.rows[0]!.track).toEqual({ x: 120, y: 12, width: 216, height: 8 });
  });

  it("never draws a negative track when the columns take the whole width", () => {
    const model = buildBarList({ ...base, width: 120, data: pages });
    expect(model.rows.every((row) => row.track.width === 0 && row.bar.width === 0)).toBe(true);
  });

  it("handles empty data", () => {
    expect(buildBarList({ ...base, data: [] })).toEqual({
      width: 300,
      height: 0,
      radius: 5,
      rows: [],
    });
  });
});

describe("barListNodes — render tree", () => {
  const root = barListNodes({ ...base, data: pages });

  it("emits the root contract with no chart frame", () => {
    expect(root.tag).toBe("svg");
    expect(root.attrs).toMatchObject({
      viewBox: "0 0 300 90",
      role: "img",
      preserveAspectRatio: "xMidYMid meet",
      "data-scope": "chart",
      "data-part": "root",
      "data-chart": "bar-list",
    });
    for (const part of ["grid", "grid-line", "axis-line", "tick-label"]) {
      expect(find(root, part)).toEqual([]);
    }
  });

  it("puts every row in one series, so the list paints from --chart-1", () => {
    const series = find(root, "series");
    expect(series).toHaveLength(1);
    expect(series[0]!.attrs["data-series"]).toBe(0);
    expect(find(root, "row")).toHaveLength(3);
  });

  it("draws each row as name, track, bar and value, in that order", () => {
    const [row] = find(root, "row");
    expect(row!.children!.map((child) => [child.tag, child.attrs["data-part"]])).toEqual([
      ["text", "label"],
      ["rect", "track"],
      ["rect", "bar"],
      ["text", "value"],
    ]);
  });

  it("anchors the name at the left edge and the value at the right edge", () => {
    const [label] = find(root, "label");
    const [value] = find(root, "value");
    expect(label!.attrs).toMatchObject({ x: 0, y: 15 });
    expect(label!.text).toBe("/");
    expect(value!.attrs).toMatchObject({ x: 300, y: 15 });
    expect(value!.text).toBe("100");
  });

  it("rounds the ends of every track and bar", () => {
    const rects = [...find(root, "track"), ...find(root, "bar")];
    expect(rects).toHaveLength(6);
    expect(rects.every((rect) => rect.attrs["rx"] === 5)).toBe(true);
  });

  it("carries data-scope on every part and no colour of its own", () => {
    const walk = (n: ChartNode): ChartNode[] => [n, ...(n.children ?? []).flatMap(walk)];
    for (const n of walk(root)) {
      expect(n.attrs["data-scope"]).toBe("chart");
      expect(n.attrs).not.toHaveProperty("fill");
      expect(n.attrs).not.toHaveProperty("stroke");
      expect(n.attrs).not.toHaveProperty("style");
    }
  });

  it("serializes deterministically and escapes names", () => {
    const svg = chartNodeToSvg(barListNodes({ ...base, data: [{ name: "R&D <core>", value: 1 }] }));
    expect(svg).toContain(">R&amp;D &lt;core&gt;</text>");
    expect(chartNodeToSvg(root)).toBe(chartNodeToSvg(barListNodes({ ...base, data: pages })));
  });
});
