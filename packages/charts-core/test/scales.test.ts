import { describe, expect, it } from "vitest";
import {
  createBandScale,
  createLinearScale,
  createPointScale,
  niceLinearDomain,
} from "../src/index.js";

describe("createLinearScale", () => {
  it("maps the domain onto the range linearly (same input → same output)", () => {
    const scale = createLinearScale({ domain: [0, 100], range: [0, 200] });
    expect(scale(0)).toBe(0);
    expect(scale(50)).toBe(100);
    expect(scale(100)).toBe(200);
    // deterministic: a second call yields the identical number
    expect(scale(50)).toBe(scale(50));
  });

  it("inverts pixels back to domain values", () => {
    const scale = createLinearScale({ domain: [0, 100], range: [0, 200] });
    expect(scale.invert(100)).toBe(50);
  });

  it("exposes ticks and the resolved domain/range", () => {
    const scale = createLinearScale({ domain: [0, 10], range: [0, 100] });
    expect(scale.ticks(5)).toEqual([0, 2, 4, 6, 8, 10]);
    expect(scale.domain).toEqual([0, 10]);
    expect(scale.range).toEqual([0, 100]);
  });

  it("rounds the domain outward when nice is requested", () => {
    const scale = createLinearScale({ domain: [0.3, 9.7], range: [0, 100], nice: true });
    expect(scale.domain).toEqual([0, 10]);
  });
});

describe("niceLinearDomain", () => {
  it("derives a rounded [min, max] from data", () => {
    expect(niceLinearDomain([3, 17, 8, 11])).toEqual([0, 18]);
  });

  it("falls back to [0, 1] for empty input", () => {
    expect(niceLinearDomain([])).toEqual([0, 1]);
  });
});

describe("createBandScale", () => {
  it("places categories with a stable bandwidth and step", () => {
    const scale = createBandScale({ domain: ["a", "b", "c"], range: [0, 300], padding: 0 });
    expect(scale.bandwidth).toBe(100);
    expect(scale.step).toBe(100);
    expect(scale("a")).toBe(0);
    expect(scale("b")).toBe(100);
    expect(scale("c")).toBe(200);
    expect(scale("missing")).toBeUndefined();
  });
});

describe("createPointScale", () => {
  it("positions categorical points across the range", () => {
    const scale = createPointScale({ domain: ["a", "b", "c"], range: [0, 200] });
    expect(scale("a")).toBe(0);
    expect(scale("b")).toBe(100);
    expect(scale("c")).toBe(200);
  });
});
