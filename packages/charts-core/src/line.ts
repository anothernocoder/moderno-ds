import type { CurveFactory } from "d3-shape";
import { cartesianFrame, collectX, collectY, type CartesianFrame } from "./frame.js";
import { linePath } from "./shapes.js";
import { type AxisTick, type ChartMargin, type PlotArea, type XYPoint, round } from "./types.js";

/** One input series of (x, y) points. */
export interface CartesianSeries {
  name?: string;
  points: readonly XYPoint[];
}

export interface CartesianChartOptions {
  width: number;
  height: number;
  margin?: Partial<ChartMargin>;
  series: readonly CartesianSeries[];
  xDomain?: readonly [number, number];
  yDomain?: readonly [number, number];
  xTicks?: number;
  yTicks?: number;
  format?: (value: number) => string;
}

export interface LineChartOptions extends CartesianChartOptions {
  curve?: CurveFactory;
}

/** A point projected into pixel space, keeping its original data value. */
export interface ProjectedPoint {
  value: XYPoint;
  cx: number;
  cy: number;
}

export interface LineSeriesModel {
  name?: string;
  index: number;
  /** SVG path `d` for the polyline. Empty string for an empty series. */
  path: string;
  points: ProjectedPoint[];
}

export interface LineChartModel {
  width: number;
  height: number;
  margin: ChartMargin;
  plot: PlotArea;
  xAxis: AxisTick[];
  yAxis: AxisTick[];
  baseline: number;
  series: LineSeriesModel[];
}

/** Project a series' points into pixel space using the frame's scales. */
export function projectPoints(frame: CartesianFrame, points: readonly XYPoint[]): ProjectedPoint[] {
  return points.map((value) => ({
    value,
    cx: round(frame.xScale(value.x)),
    cy: round(frame.yScale(value.y)),
  }));
}

/**
 * Build a fully-computed line chart model. All scales, paths and ticks are
 * resolved here so the framework component is a pure map to `<svg>` (F4.2).
 */
export function buildLineChart(options: LineChartOptions): LineChartModel {
  const frame = cartesianFrame({
    width: options.width,
    height: options.height,
    margin: options.margin,
    xValues: collectX(options.series),
    yValues: collectY(options.series),
    xDomain: options.xDomain,
    yDomain: options.yDomain,
    xTicks: options.xTicks,
    yTicks: options.yTicks,
    format: options.format,
  });

  const series = options.series.map((s, index): LineSeriesModel => {
    const points = projectPoints(frame, s.points);
    return {
      name: s.name,
      index,
      path: linePath(points, { x: (p) => p.cx, y: (p) => p.cy, curve: options.curve }),
      points,
    };
  });

  return {
    width: options.width,
    height: options.height,
    margin: frame.margin,
    plot: frame.plot,
    xAxis: frame.xAxis,
    yAxis: frame.yAxis,
    baseline: frame.baseline,
    series,
  };
}
