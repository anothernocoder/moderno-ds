/**
 * @moderno/charts-core — framework-agnostic chart math.
 *
 * Pure functions over d3-scale/d3-shape/d3-array/d3-path. No DOM access, so
 * everything is SSR-safe. d3-selection / d3-transition are forbidden.
 */

export { ticks } from "d3-array";

export {
  createBandScale,
  createLinearScale,
  createPointScale,
  niceLinearDomain,
} from "./scales.js";
export type {
  BandScale,
  BandScaleOptions,
  LinearScale,
  LinearScaleOptions,
  PointScale,
  PointScaleOptions,
} from "./scales.js";

export {
  areaPath,
  curveBasis,
  curveLinear,
  curveMonotoneX,
  curveNatural,
  curveStep,
  linePath,
} from "./shapes.js";
export type { Accessor, AreaOptions, CurveFactory, LineOptions } from "./shapes.js";

// ── Chart builders (Phase 4): pure layout → render model ────────────────────
export { DEFAULT_MARGIN, plotArea, resolveMargin, round } from "./types.js";
export type { AxisTick, ChartDimensions, ChartMargin, PlotArea, XYPoint } from "./types.js";

export { cartesianFrame, collectX, collectY, defaultFormat, domainFromValues } from "./frame.js";
export type { CartesianFrame, CartesianFrameOptions } from "./frame.js";

export { buildLineChart, projectPoints } from "./line.js";
export type {
  CartesianChartOptions,
  CartesianSeries,
  LineChartModel,
  LineChartOptions,
  LineSeriesModel,
  ProjectedPoint,
} from "./line.js";

export { buildAreaChart } from "./area.js";
export type { AreaChartModel, AreaChartOptions, AreaSeriesModel } from "./area.js";

export { buildBarChart } from "./bar.js";
export type { BarChartModel, BarChartOptions, BarRect, BarSeries, BarSeriesModel } from "./bar.js";

export { buildScatterChart } from "./scatter.js";
export type {
  ScatterChartModel,
  ScatterChartOptions,
  ScatterPoint,
  ScatterSeriesModel,
} from "./scatter.js";

// ── Render tree: the complete render description, one walker per framework ──
export {
  areaChartNodes,
  barChartNodes,
  chartNodeToSvg,
  lineChartNodes,
  scatterChartNodes,
} from "./render.js";
export type { ChartNode } from "./render.js";
