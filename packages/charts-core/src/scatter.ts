import { cartesianFrame, collectX, collectY } from "./frame.js";
import { projectPoints, type CartesianChartOptions, type ProjectedPoint } from "./line.js";
import type { AxisTick, ChartMargin, PlotArea } from "./types.js";

export interface ScatterChartOptions extends CartesianChartOptions {
  /** Marker radius in pixels. Default 4. */
  radius?: number;
}

export interface ScatterPoint extends ProjectedPoint {
  r: number;
}

export interface ScatterSeriesModel {
  name?: string;
  index: number;
  points: ScatterPoint[];
}

export interface ScatterChartModel {
  width: number;
  height: number;
  margin: ChartMargin;
  plot: PlotArea;
  xAxis: AxisTick[];
  yAxis: AxisTick[];
  baseline: number;
  series: ScatterSeriesModel[];
}

/**
 * Build a scatter chart model: each series becomes a set of positioned markers.
 * No path is generated — the component renders one `<circle>` per point.
 */
export function buildScatterChart(options: ScatterChartOptions): ScatterChartModel {
  const radius = options.radius ?? 4;
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

  const series = options.series.map(
    (s, index): ScatterSeriesModel => ({
      name: s.name,
      index,
      points: projectPoints(frame, s.points).map((p) => ({ ...p, r: radius })),
    }),
  );

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
