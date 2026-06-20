import { For, splitProps, type JSX } from "solid-js";
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
 * Reference SVG charts, ported to Solid. Every coordinate is computed in
 * `@moderno/charts-core`; these components are a pure map from the model to
 * `<svg>` elements (F4.2). They hold zero colour — series paint from
 * `--chart-*` via the data-series index in `components.css`, axes/grid from
 * semantic slots. Because the model is deterministic and DOM-free, the same SVG
 * serialises on server and client (F4.4).
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
type SvgProps = Omit<JSX.SvgSVGAttributes<SVGSVGElement>, "width" | "height" | "format">;

function ChartFrame(props: { type: string; model: FrameModel; children: JSX.Element } & SvgProps) {
  const [local, rest] = splitProps(props, ["type", "model", "children"]);
  const model = local.model;
  const plot = model.plot;
  const right = plot.x + plot.width;
  const bottom = plot.y + plot.height;
  return (
    <svg
      viewBox={`0 0 ${model.width} ${model.height}`}
      role="img"
      preserveAspectRatio="xMidYMid meet"
      {...rest}
      {...partAttrs("chart", "root")}
      data-chart={local.type}
    >
      <g data-part="grid">
        <For each={model.yAxis}>
          {(t) => (
            <line data-part="grid-line" x1={plot.x} y1={t.position} x2={right} y2={t.position} />
          )}
        </For>
      </g>
      <line data-part="axis-line" x1={plot.x} y1={bottom} x2={right} y2={bottom} />
      <line data-part="axis-line" x1={plot.x} y1={plot.y} x2={plot.x} y2={bottom} />
      <For each={model.xAxis}>
        {(t) => (
          <text
            data-part="tick-label"
            data-orientation="x"
            x={t.position}
            y={bottom + LABEL_GAP + 8}
          >
            {t.label}
          </text>
        )}
      </For>
      <For each={model.yAxis}>
        {(t) => (
          <text
            data-part="tick-label"
            data-orientation="y"
            x={plot.x - LABEL_GAP}
            y={t.position + 4}
          >
            {t.label}
          </text>
        )}
      </For>
      {local.children}
    </svg>
  );
}

// ── Line ────────────────────────────────────────────────────────────────────
export interface LineChartProps extends LineChartOptions, SvgProps {}

export function LineChart(props: LineChartProps) {
  const [local, rest] = splitProps(props, [
    "width",
    "height",
    "margin",
    "series",
    "xDomain",
    "yDomain",
    "xTicks",
    "yTicks",
    "format",
    "curve",
  ]);
  const model: LineChartModel = buildLineChart(local);
  return (
    <ChartFrame type="line" model={model} {...rest}>
      <For each={model.series}>
        {(s) => (
          <g data-part="series" data-series={s.index}>
            <path data-part="line" d={s.path} />
          </g>
        )}
      </For>
    </ChartFrame>
  );
}

// ── Area ────────────────────────────────────────────────────────────────────
export interface AreaChartProps extends AreaChartOptions, SvgProps {}

export function AreaChart(props: AreaChartProps) {
  const [local, rest] = splitProps(props, [
    "width",
    "height",
    "margin",
    "series",
    "xDomain",
    "yDomain",
    "xTicks",
    "yTicks",
    "format",
    "curve",
  ]);
  const model: AreaChartModel = buildAreaChart(local);
  return (
    <ChartFrame type="area" model={model} {...rest}>
      <For each={model.series}>
        {(s) => (
          <g data-part="series" data-series={s.index}>
            <path data-part="area" d={s.area} />
            <path data-part="line" d={s.line} />
          </g>
        )}
      </For>
    </ChartFrame>
  );
}

// ── Bar ─────────────────────────────────────────────────────────────────────
export interface BarChartProps extends BarChartOptions, SvgProps {}

export function BarChart(props: BarChartProps) {
  const [local, rest] = splitProps(props, [
    "width",
    "height",
    "margin",
    "categories",
    "series",
    "yDomain",
    "yTicks",
    "padding",
    "format",
  ]);
  const model: BarChartModel = buildBarChart(local);
  return (
    <ChartFrame type="bar" model={model} {...rest}>
      <For each={model.series}>
        {(s) => (
          <g data-part="series" data-series={s.index}>
            <For each={s.bars}>
              {(b) => <rect data-part="bar" x={b.x} y={b.y} width={b.width} height={b.height} />}
            </For>
          </g>
        )}
      </For>
    </ChartFrame>
  );
}

// ── Scatter ──────────────────────────────────────────────────────────────────
export interface ScatterChartProps extends ScatterChartOptions, SvgProps {}

export function ScatterChart(props: ScatterChartProps) {
  const [local, rest] = splitProps(props, [
    "width",
    "height",
    "margin",
    "series",
    "xDomain",
    "yDomain",
    "xTicks",
    "yTicks",
    "format",
    "radius",
  ]);
  const model: ScatterChartModel = buildScatterChart(local);
  return (
    <ChartFrame type="scatter" model={model} {...rest}>
      <For each={model.series}>
        {(s) => (
          <g data-part="series" data-series={s.index}>
            <For each={s.points}>
              {(p) => <circle data-part="point" cx={p.cx} cy={p.cy} r={p.r} />}
            </For>
          </g>
        )}
      </For>
    </ChartFrame>
  );
}
