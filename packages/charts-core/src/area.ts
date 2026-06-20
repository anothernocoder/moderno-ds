import type { CurveFactory } from "d3-shape";
import { cartesianFrame, collectX, collectY } from "./frame.js";
import { projectPoints, type CartesianChartOptions, type ProjectedPoint } from "./line.js";
import { areaPath, linePath } from "./shapes.js";
import type { AxisTick, ChartMargin, PlotArea } from "./types.js";

export interface AreaChartOptions extends CartesianChartOptions {
  curve?: CurveFactory;
}

export interface AreaSeriesModel {
  name?: string;
  index: number;
  /** Filled path between the baseline and the value line. */
  area: string;
  /** The top edge as a stroked line (so the area can carry a crisp outline). */
  line: string;
  points: ProjectedPoint[];
}

export interface AreaChartModel {
  width: number;
  height: number;
  margin: ChartMargin;
  plot: PlotArea;
  xAxis: AxisTick[];
  yAxis: AxisTick[];
  baseline: number;
  series: AreaSeriesModel[];
}

/**
 * Build an area chart model. Each series fills from the value-0 baseline up to
 * its value line, so negatives fill downward from the baseline automatically.
 */
export function buildAreaChart(options: AreaChartOptions): AreaChartModel {
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

  const series = options.series.map((s, index): AreaSeriesModel => {
    const points = projectPoints(frame, s.points);
    return {
      name: s.name,
      index,
      area: areaPath(points, {
        x: (p) => p.cx,
        y0: () => frame.baseline,
        y1: (p) => p.cy,
        curve: options.curve,
      }),
      line: linePath(points, { x: (p) => p.cx, y: (p) => p.cy, curve: options.curve }),
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
