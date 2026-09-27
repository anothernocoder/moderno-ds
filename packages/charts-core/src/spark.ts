import type { CurveFactory } from "d3-shape";
import { cartesianFrame, domainFromValues } from "./frame.js";
import { projectPoints, type ProjectedPoint } from "./line.js";
import { areaPath, linePath } from "./shapes.js";
import type { PlotArea, XYPoint } from "./types.js";

export interface SparkChartOptions {
  /** The values to plot, in x order. */
  points: readonly XYPoint[];
  /** Viewport width in pixels. Default 120. */
  width?: number;
  /** Viewport height in pixels. Default 32. */
  height?: number;
  /**
   * The y range to plot against. Defaults to the extent of the values, so the
   * trend fills the height; pass one domain to several sparks to compare them.
   */
  yDomain?: readonly [number, number];
  /** How to join the points, e.g. `curveMonotoneX`. Default straight segments. */
  curve?: CurveFactory;
  /** Fill the space under the line. Default false. */
  area?: boolean;
  /** Mark the last point, to call out the current value. Default false. */
  showLastPoint?: boolean;
}

/** The last-point marker: a circle in pixel space. */
export interface SparkMarker {
  cx: number;
  cy: number;
  r: number;
}

export interface SparkChartModel {
  width: number;
  height: number;
  plot: PlotArea;
  /** SVG path `d` for the line. Empty string when there are no points. */
  line: string;
  /** Filled path from the plot bottom up to the line. Only when `area` is set. */
  area?: string;
  /** The last point's marker. Only when `showLastPoint` is set and there is a point. */
  marker?: SparkMarker;
  points: ProjectedPoint[];
}

/** Default viewport: a thin strip that fits a KPI card. */
const SPARK_SIZE = { width: 120, height: 32 } as const;

/** Radius of the last-point marker, in pixels. */
const MARKER_RADIUS = 3;

/**
 * A spark has no axes, so its only inset keeps the stroke and the last-point
 * marker from being clipped at the viewport edge.
 */
const INSET = MARKER_RADIUS;

/**
 * Build a sparkline model: one line edge to edge, with no axes, grid or labels.
 * Unlike the line chart, the y domain does not include 0 by default, so small
 * changes stay visible in a small space.
 */
export function buildSparkChart(options: SparkChartOptions): SparkChartModel {
  const width = options.width ?? SPARK_SIZE.width;
  const height = options.height ?? SPARK_SIZE.height;
  const yValues = options.points.map((p) => p.y);
  const frame = cartesianFrame({
    width,
    height,
    margin: { top: INSET, right: INSET, bottom: INSET, left: INSET },
    xValues: options.points.map((p) => p.x),
    yValues,
    yDomain: options.yDomain ?? domainFromValues(yValues),
  });

  const points = projectPoints(frame, options.points);
  const plotBottom = frame.plot.y + frame.plot.height;
  const last = points.at(-1);

  return {
    width,
    height,
    plot: frame.plot,
    line: linePath(points, { x: (p) => p.cx, y: (p) => p.cy, curve: options.curve }),
    ...(options.area && {
      area: areaPath(points, {
        x: (p) => p.cx,
        y0: () => plotBottom,
        y1: (p) => p.cy,
        curve: options.curve,
      }),
    }),
    ...(options.showLastPoint &&
      last && { marker: { cx: last.cx, cy: last.cy, r: MARKER_RADIUS } }),
    points,
  };
}
