import { createBandScale, createLinearScale, niceLinearDomain } from "./scales.js";
import { defaultFormat } from "./frame.js";
import {
  type AxisTick,
  type ChartMargin,
  type PlotArea,
  plotArea,
  resolveMargin,
  round,
} from "./types.js";

/** One series of bar values, aligned 1:1 with the chart's categories. */
export interface BarSeries {
  name?: string;
  values: readonly number[];
}

export interface BarChartOptions {
  width: number;
  height: number;
  margin?: Partial<ChartMargin>;
  categories: readonly string[];
  series: readonly BarSeries[];
  yDomain?: readonly [number, number];
  yTicks?: number;
  /** Outer band padding as a fraction of the step (0–1). Default 0.2. */
  padding?: number;
  format?: (value: number) => string;
}

/** A single bar rectangle in pixel space. */
export interface BarRect {
  category: string;
  value: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BarSeriesModel {
  name?: string;
  index: number;
  bars: BarRect[];
}

export interface BarChartModel {
  width: number;
  height: number;
  margin: ChartMargin;
  plot: PlotArea;
  /** Category labels positioned at each group's centre. */
  xAxis: AxisTick[];
  yAxis: AxisTick[];
  baseline: number;
  series: BarSeriesModel[];
}

/**
 * Build a grouped bar chart model. An outer band scale lays out the categories;
 * an inner band splits each category's slot across the series. Bars grow from
 * the value-0 baseline, so negative values draw downward without special-casing.
 */
export function buildBarChart(options: BarChartOptions): BarChartModel {
  const margin = resolveMargin(options.margin);
  const plot = plotArea(options.width, options.height, margin);
  const format = options.format ?? defaultFormat;
  const categories = options.categories;
  const seriesCount = options.series.length;

  const yValues = options.series.flatMap((s) => [...s.values]);
  const yDomain = options.yDomain ?? niceLinearDomain(yValues);
  const yScale = createLinearScale({
    domain: yDomain,
    range: [plot.y + plot.height, plot.y],
  });
  const baseline = round(clamp(yScale(0), plot.y, plot.y + plot.height));

  const outer = createBandScale({
    domain: categories,
    range: [plot.x, plot.x + plot.width],
    padding: options.padding ?? 0.2,
  });
  // Inner band positions the per-series bars inside one category's bandwidth.
  const inner = createBandScale({
    domain: options.series.map((_, i) => String(i)),
    range: [0, outer.bandwidth],
    padding: seriesCount > 1 ? 0.1 : 0,
  });

  const series = options.series.map((s, index): BarSeriesModel => {
    const offset = inner(String(index)) ?? 0;
    const bars = categories.map((category, ci): BarRect => {
      const value = s.values[ci] ?? 0;
      const groupX = outer(category) ?? plot.x;
      const valuePix = yScale(value);
      const top = Math.min(valuePix, baseline);
      return {
        category,
        value,
        x: round(groupX + offset),
        y: round(top),
        width: round(inner.bandwidth),
        height: round(Math.abs(valuePix - baseline)),
      };
    });
    return { name: s.name, index, bars };
  });

  const xAxis: AxisTick[] = categories.map((category, i) => ({
    value: i,
    position: round((outer(category) ?? plot.x) + outer.bandwidth / 2),
    label: category,
  }));

  const yAxis: AxisTick[] = yScale.ticks(options.yTicks ?? 5).map((value) => ({
    value,
    position: round(yScale(value)),
    label: format(value),
  }));

  return {
    width: options.width,
    height: options.height,
    margin,
    plot,
    xAxis,
    yAxis,
    baseline,
    series,
  };
}

function clamp(value: number, lo: number, hi: number): number {
  return Math.min(Math.max(value, lo), hi);
}
