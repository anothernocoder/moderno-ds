/**
 * Shared chart geometry types. Pure data — no DOM, no framework. A builder
 * turns user input into one of the `*ChartModel`s below; a framework component
 * maps that model straight onto SVG elements with zero further math (F4.2).
 */

/** Pixel insets between the SVG viewport edge and the plotted area. */
export interface ChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Viewport size plus optional margin overrides, shared by every chart. */
export interface ChartDimensions {
  width: number;
  height: number;
  margin?: Partial<ChartMargin>;
}

/** The rectangle the data is drawn into, after margins are removed. */
export interface PlotArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A computed axis tick: its data value, its pixel position, and a label. */
export interface AxisTick {
  value: number;
  position: number;
  label: string;
}

/** A point in data space. */
export interface XYPoint {
  x: number;
  y: number;
}

/** Default margin, large enough for one row of axis labels on each used edge. */
export const DEFAULT_MARGIN: ChartMargin = { top: 16, right: 16, bottom: 28, left: 36 };

/** Merge a partial margin over the default. */
export function resolveMargin(margin?: Partial<ChartMargin>): ChartMargin {
  return { ...DEFAULT_MARGIN, ...margin };
}

/** The inner plot rectangle for a viewport + margin. Clamped to non-negative. */
export function plotArea(width: number, height: number, margin: ChartMargin): PlotArea {
  return {
    x: margin.left,
    y: margin.top,
    width: Math.max(0, width - margin.left - margin.right),
    height: Math.max(0, height - margin.top - margin.bottom),
  };
}

/** Round to a fixed number of decimals — keeps SVG output compact and stable. */
export function round(value: number, decimals = 2): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}
