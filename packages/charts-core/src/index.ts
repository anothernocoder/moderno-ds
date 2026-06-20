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
