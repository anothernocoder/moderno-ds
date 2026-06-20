import { extent } from "d3-array";
import { createLinearScale, niceLinearDomain, type LinearScale } from "./scales.js";
import {
  type AxisTick,
  type ChartMargin,
  type PlotArea,
  type XYPoint,
  plotArea,
  resolveMargin,
  round,
} from "./types.js";

/**
 * A Cartesian frame: the shared scaffold for every continuous-x chart
 * (line/area/scatter). It owns all the math the charts have in common — plot
 * rectangle, x/y scales, axis ticks, and the baseline pixel of value 0 — so each
 * chart builder only adds its own shape geometry on top.
 */
export interface CartesianFrame {
  margin: ChartMargin;
  plot: PlotArea;
  xScale: LinearScale;
  yScale: LinearScale;
  xAxis: AxisTick[];
  yAxis: AxisTick[];
  /** Pixel y of data value 0, clamped to the plot — the area/bar baseline. */
  baseline: number;
}

export interface CartesianFrameOptions {
  width: number;
  height: number;
  margin?: Partial<ChartMargin>;
  /** All x values across every series. */
  xValues: readonly number[];
  /** All y values across every series. */
  yValues: readonly number[];
  xDomain?: readonly [number, number];
  yDomain?: readonly [number, number];
  xTicks?: number;
  yTicks?: number;
  /** Format a tick value into its label. Defaults to a compact number string. */
  format?: (value: number) => string;
}

/** Default tick label — trims float noise without locale surprises. */
export function defaultFormat(value: number): string {
  return String(round(value, 4));
}

/**
 * Derive a continuous domain from values. Empty → [0, 1]; a single distinct
 * value → centred ±1 so a lone point still sits in a sane viewport instead of
 * collapsing onto the range start.
 */
export function domainFromValues(values: readonly number[]): [number, number] {
  const [min, max] = extent(values);
  if (min === undefined || max === undefined) return [0, 1];
  if (min === max) return [min - 1, max + 1];
  return [min, max];
}

function axisTicks(scale: LinearScale, count: number, format: (v: number) => string): AxisTick[] {
  return scale.ticks(count).map((value) => ({
    value,
    position: round(scale(value)),
    label: format(value),
  }));
}

export function cartesianFrame(options: CartesianFrameOptions): CartesianFrame {
  const margin = resolveMargin(options.margin);
  const plot = plotArea(options.width, options.height, margin);
  const format = options.format ?? defaultFormat;

  const xDomain = options.xDomain ?? domainFromValues(options.xValues);
  // y defaults include 0 and round outward so the baseline and ticks are tidy.
  const yDomain = options.yDomain ?? niceLinearDomain(options.yValues);

  const xScale = createLinearScale({
    domain: xDomain,
    range: [plot.x, plot.x + plot.width],
  });
  const yScale = createLinearScale({
    // SVG y grows downward, so the range is inverted: domain max → plot top.
    domain: yDomain,
    range: [plot.y + plot.height, plot.y],
  });

  const baseline = round(clamp(yScale(0), plot.y, plot.y + plot.height));

  return {
    margin,
    plot,
    xScale,
    yScale,
    xAxis: axisTicks(xScale, options.xTicks ?? 5, format),
    yAxis: axisTicks(yScale, options.yTicks ?? 5, format),
    baseline,
  };
}

function clamp(value: number, lo: number, hi: number): number {
  return Math.min(Math.max(value, lo), hi);
}

/** Flatten every series' x values into one array. */
export function collectX(series: readonly { points: readonly XYPoint[] }[]): number[] {
  return series.flatMap((s) => s.points.map((p) => p.x));
}

/** Flatten every series' y values into one array. */
export function collectY(series: readonly { points: readonly XYPoint[] }[]): number[] {
  return series.flatMap((s) => s.points.map((p) => p.y));
}
