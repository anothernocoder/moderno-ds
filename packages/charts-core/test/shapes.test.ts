import { describe, expect, it } from "vitest";
import { areaPath, curveLinear, linePath } from "../src/index.js";

interface Point {
  x: number;
  y: number;
}

const data: Point[] = [
  { x: 0, y: 0 },
  { x: 10, y: 20 },
];

describe("linePath", () => {
  it("emits a deterministic SVG path string from accessors", () => {
    const d = linePath(data, { x: (p) => p.x, y: (p) => p.y });
    expect(d).toBe("M0,0L10,20");
  });

  it("is a pure function — same input yields byte-identical output", () => {
    const opts = { x: (p: Point) => p.x, y: (p: Point) => p.y, curve: curveLinear };
    expect(linePath(data, opts)).toBe(linePath(data, opts));
  });

  it("returns an empty string for empty data", () => {
    expect(linePath([], { x: (p: Point) => p.x, y: (p: Point) => p.y })).toBe("");
  });
});

describe("areaPath", () => {
  it("emits a closed area path between y0 and y1", () => {
    const d = areaPath(data, { x: (p) => p.x, y0: () => 0, y1: (p) => p.y });
    expect(d.startsWith("M")).toBe(true);
    expect(d.endsWith("Z")).toBe(true);
    expect(d).toContain("10,20");
  });
});
