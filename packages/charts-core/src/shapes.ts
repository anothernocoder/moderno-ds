import { area, line } from "d3-shape";

export { curveBasis, curveLinear, curveMonotoneX, curveNatural, curveStep } from "d3-shape";
export type { CurveFactory } from "d3-shape";

import type { CurveFactory } from "d3-shape";

/** Pull a number out of a datum at a given index. */
export type Accessor<T> = (datum: T, index: number) => number;

export interface LineOptions<T> {
  x: Accessor<T>;
  y: Accessor<T>;
  curve?: CurveFactory;
}

/**
 * Build an SVG path `d` string for a line. Pure: with no DOM context the d3
 * generator returns a string, so this is SSR-safe.
 */
export function linePath<T>(data: readonly T[], options: LineOptions<T>): string {
  const generator = line<T>().x(options.x).y(options.y);
  if (options.curve) generator.curve(options.curve);
  return generator([...data]) ?? "";
}

export interface AreaOptions<T> {
  x: Accessor<T>;
  y0: Accessor<T>;
  y1: Accessor<T>;
  curve?: CurveFactory;
}

/** Build an SVG path `d` string for a filled area between y0 and y1. */
export function areaPath<T>(data: readonly T[], options: AreaOptions<T>): string {
  const generator = area<T>().x(options.x).y0(options.y0).y1(options.y1);
  if (options.curve) generator.curve(options.curve);
  return generator([...data]) ?? "";
}
