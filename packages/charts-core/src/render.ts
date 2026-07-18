/**
 * Chart render tree — the complete render description of a chart, as data.
 *
 * The builders below turn chart options into a serializable tree of SVG nodes:
 * the frame (root + grid + axis lines + tick-label anchors) and the per-chart
 * `data-part` structure all live here, in one place. A framework binding is a
 * ~15-line walker that maps nodes onto its own element calls — it holds no
 * geometry, no label math, and no part names, so the four bindings cannot
 * drift. `chartNodeToSvg` is the reference serialization the bindings' SSR
 * output is parity-tested against.
 */
import { buildAreaChart, type AreaChartOptions } from "./area.js";
import { buildBarChart, type BarChartOptions } from "./bar.js";
import { buildLineChart, type LineChartOptions } from "./line.js";
import { buildScatterChart, type ScatterChartOptions } from "./scatter.js";
import type { AxisTick, PlotArea } from "./types.js";

/** One SVG element in the render description. Pure data — no DOM, no framework. */
export interface ChartNode {
  tag: string;
  attrs: Record<string, string | number>;
  children?: ChartNode[];
  /** Text content (tick labels). Mutually exclusive with `children`. */
  text?: string;
}

/** Gap between the plot edge and a tick label's anchor, in pixels. */
const LABEL_GAP = 8;
/** Baseline offset that vertically settles a label against its anchor. */
const FONT_OFFSET = 8;

/** The frame fields every chart model shares. */
interface FrameModel {
  width: number;
  height: number;
  plot: PlotArea;
  xAxis: AxisTick[];
  yAxis: AxisTick[];
}

/** Grid, axis lines and tick labels — identical for every chart type. */
function frameNodes(model: FrameModel): ChartNode[] {
  const { plot, xAxis, yAxis } = model;
  const right = plot.x + plot.width;
  const bottom = plot.y + plot.height;
  return [
    {
      tag: "g",
      attrs: { "data-part": "grid" },
      children: yAxis.map((t) => ({
        tag: "line",
        attrs: { "data-part": "grid-line", x1: plot.x, y1: t.position, x2: right, y2: t.position },
      })),
    },
    { tag: "line", attrs: { "data-part": "axis-line", x1: plot.x, y1: bottom, x2: right, y2: bottom } },
    { tag: "line", attrs: { "data-part": "axis-line", x1: plot.x, y1: plot.y, x2: plot.x, y2: bottom } },
    ...xAxis.map((t) => ({
      tag: "text",
      attrs: {
        "data-part": "tick-label",
        "data-orientation": "x",
        x: t.position,
        y: bottom + LABEL_GAP + FONT_OFFSET,
      },
      text: t.label,
    })),
    ...yAxis.map((t) => ({
      tag: "text",
      attrs: {
        "data-part": "tick-label",
        "data-orientation": "y",
        x: plot.x - LABEL_GAP,
        y: t.position + 4,
      },
      text: t.label,
    })),
  ];
}

function chartRoot(type: string, model: FrameModel, series: ChartNode[]): ChartNode {
  return {
    tag: "svg",
    attrs: {
      viewBox: `0 0 ${model.width} ${model.height}`,
      role: "img",
      preserveAspectRatio: "xMidYMid meet",
      "data-scope": "chart",
      "data-part": "root",
      "data-chart": type,
    },
    children: [...frameNodes(model), ...series],
  };
}

function seriesGroup(index: number, children: ChartNode[]): ChartNode {
  return { tag: "g", attrs: { "data-part": "series", "data-series": index }, children };
}

/** The full line chart as a render tree: frame + one path per series. */
export function lineChartNodes(options: LineChartOptions): ChartNode {
  const model = buildLineChart(options);
  return chartRoot(
    "line",
    model,
    model.series.map((s) =>
      seriesGroup(s.index, [{ tag: "path", attrs: { "data-part": "line", d: s.path } }]),
    ),
  );
}

/** The full area chart: frame + a filled area and its top line per series. */
export function areaChartNodes(options: AreaChartOptions): ChartNode {
  const model = buildAreaChart(options);
  return chartRoot(
    "area",
    model,
    model.series.map((s) =>
      seriesGroup(s.index, [
        { tag: "path", attrs: { "data-part": "area", d: s.area } },
        { tag: "path", attrs: { "data-part": "line", d: s.line } },
      ]),
    ),
  );
}

/** The full bar chart: frame + one rect per category per series. */
export function barChartNodes(options: BarChartOptions): ChartNode {
  const model = buildBarChart(options);
  return chartRoot(
    "bar",
    model,
    model.series.map((s) =>
      seriesGroup(
        s.index,
        s.bars.map((bar) => ({
          tag: "rect",
          attrs: { "data-part": "bar", x: bar.x, y: bar.y, width: bar.width, height: bar.height },
        })),
      ),
    ),
  );
}

/** The full scatter chart: frame + one circle per point. */
export function scatterChartNodes(options: ScatterChartOptions): ChartNode {
  const model = buildScatterChart(options);
  return chartRoot(
    "scatter",
    model,
    model.series.map((s) =>
      seriesGroup(
        s.index,
        s.points.map((p) => ({
          tag: "circle",
          attrs: { "data-part": "point", cx: p.cx, cy: p.cy, r: p.r },
        })),
      ),
    ),
  );
}

function escape(value: string): string {
  return value.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}

/**
 * Reference serialization of a render tree. This is the golden SVG every
 * framework binding must match (modulo self-closing/comment noise) — the
 * parity tests normalise SSR output against it.
 */
export function chartNodeToSvg(node: ChartNode): string {
  const attrs = Object.entries(node.attrs)
    .map(([name, value]) => ` ${name}="${escape(String(value))}"`)
    .join("");
  const children = node.text !== undefined
    ? escape(node.text)
    : (node.children ?? []).map(chartNodeToSvg).join("");
  return `<${node.tag}${attrs}>${children}</${node.tag}>`;
}
