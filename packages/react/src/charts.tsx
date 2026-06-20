import type { ComponentPropsWithRef, ReactNode } from "react";
import { partAttrs } from "@moderno/core";
import {
  buildAreaChart,
  buildBarChart,
  buildLineChart,
  buildScatterChart,
  type AreaChartModel,
  type AreaChartOptions,
  type BarChartModel,
  type BarChartOptions,
  type LineChartModel,
  type LineChartOptions,
  type ScatterChartModel,
  type ScatterChartOptions,
} from "@moderno/charts-core";

/**
 * Reference SVG charts. Every coordinate is computed in `@moderno/charts-core`;
 * these components are a pure map from the model to `<svg>` elements (F4.2).
 * They hold zero colour — series paint from `--chart-*` via the data-series
 * index in `components.css`, axes/grid from semantic slots. Because the model is
 * deterministic and DOM-free, the same SVG serialises on server and client (F4.4).
 *
 * The frame (root + grid + axes) is shared; each chart only supplies its series
 * shapes. The four frameworks render this identical structure so the charts look
 * the same everywhere.
 */

const LABEL_GAP = 8;

/** The frame fields every chart model shares. */
interface FrameModel {
  width: number;
  height: number;
  plot: { x: number; y: number; width: number; height: number };
  xAxis: { value: number; position: number; label: string }[];
  yAxis: { value: number; position: number; label: string }[];
}

// `width`/`height` are numeric chart dimensions and `format` is the chart's
// tick formatter — both collide with native SVG attributes, so drop them here.
type SvgProps = Omit<ComponentPropsWithRef<"svg">, "width" | "height" | "format" | "radius">;

function ChartFrame({
  type,
  model,
  children,
  ...rest
}: { type: string; model: FrameModel; children: ReactNode } & SvgProps) {
  const { plot, xAxis, yAxis, width, height } = model;
  const right = plot.x + plot.width;
  const bottom = plot.y + plot.height;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      preserveAspectRatio="xMidYMid meet"
      {...rest}
      {...partAttrs("chart", "root")}
      data-chart={type}
    >
      <g data-part="grid">
        {yAxis.map((t) => (
          <line
            key={t.value}
            data-part="grid-line"
            x1={plot.x}
            y1={t.position}
            x2={right}
            y2={t.position}
          />
        ))}
      </g>
      <line data-part="axis-line" x1={plot.x} y1={bottom} x2={right} y2={bottom} />
      <line data-part="axis-line" x1={plot.x} y1={plot.y} x2={plot.x} y2={bottom} />
      {xAxis.map((t) => (
        <text
          key={t.value}
          data-part="tick-label"
          data-orientation="x"
          x={t.position}
          y={bottom + LABEL_GAP + 8}
        >
          {t.label}
        </text>
      ))}
      {yAxis.map((t) => (
        <text
          key={t.value}
          data-part="tick-label"
          data-orientation="y"
          x={plot.x - LABEL_GAP}
          y={t.position + 4}
        >
          {t.label}
        </text>
      ))}
      {children}
    </svg>
  );
}

// ── Line ────────────────────────────────────────────────────────────────────
export interface LineChartProps extends LineChartOptions, SvgProps {}

export function LineChart({
  width,
  height,
  margin,
  series,
  xDomain,
  yDomain,
  xTicks,
  yTicks,
  format,
  curve,
  ...rest
}: LineChartProps) {
  const model: LineChartModel = buildLineChart({
    width,
    height,
    margin,
    series,
    xDomain,
    yDomain,
    xTicks,
    yTicks,
    format,
    curve,
  });
  return (
    <ChartFrame type="line" model={model} {...rest}>
      {model.series.map((s) => (
        <g key={s.index} data-part="series" data-series={s.index}>
          <path data-part="line" d={s.path} />
        </g>
      ))}
    </ChartFrame>
  );
}

// ── Area ────────────────────────────────────────────────────────────────────
export interface AreaChartProps extends AreaChartOptions, SvgProps {}

export function AreaChart({
  width,
  height,
  margin,
  series,
  xDomain,
  yDomain,
  xTicks,
  yTicks,
  format,
  curve,
  ...rest
}: AreaChartProps) {
  const model: AreaChartModel = buildAreaChart({
    width,
    height,
    margin,
    series,
    xDomain,
    yDomain,
    xTicks,
    yTicks,
    format,
    curve,
  });
  return (
    <ChartFrame type="area" model={model} {...rest}>
      {model.series.map((s) => (
        <g key={s.index} data-part="series" data-series={s.index}>
          <path data-part="area" d={s.area} />
          <path data-part="line" d={s.line} />
        </g>
      ))}
    </ChartFrame>
  );
}

// ── Bar ─────────────────────────────────────────────────────────────────────
export interface BarChartProps extends BarChartOptions, SvgProps {}

export function BarChart({
  width,
  height,
  margin,
  categories,
  series,
  yDomain,
  yTicks,
  padding,
  format,
  ...rest
}: BarChartProps) {
  const model: BarChartModel = buildBarChart({
    width,
    height,
    margin,
    categories,
    series,
    yDomain,
    yTicks,
    padding,
    format,
  });
  return (
    <ChartFrame type="bar" model={model} {...rest}>
      {model.series.map((s) => (
        <g key={s.index} data-part="series" data-series={s.index}>
          {s.bars.map((bar) => (
            <rect
              key={bar.category}
              data-part="bar"
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
            />
          ))}
        </g>
      ))}
    </ChartFrame>
  );
}

// ── Scatter ──────────────────────────────────────────────────────────────────
export interface ScatterChartProps extends ScatterChartOptions, SvgProps {}

export function ScatterChart({
  width,
  height,
  margin,
  series,
  xDomain,
  yDomain,
  xTicks,
  yTicks,
  format,
  radius,
  ...rest
}: ScatterChartProps) {
  const model: ScatterChartModel = buildScatterChart({
    width,
    height,
    margin,
    series,
    xDomain,
    yDomain,
    xTicks,
    yTicks,
    format,
    radius,
  });
  return (
    <ChartFrame type="scatter" model={model} {...rest}>
      {model.series.map((s) => (
        <g key={s.index} data-part="series" data-series={s.index}>
          {s.points.map((p, i) => (
            <circle key={i} data-part="point" cx={p.cx} cy={p.cy} r={p.r} />
          ))}
        </g>
      ))}
    </ChartFrame>
  );
}
