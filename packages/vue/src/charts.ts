import { defineComponent, h, type PropType, type VNode } from "vue";
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
  type BarSeries,
  type CartesianSeries,
  type ChartMargin,
  type CurveFactory,
  type LineChartModel,
  type LineChartOptions,
  type ScatterChartModel,
  type ScatterChartOptions,
} from "@moderno/charts-core";

/**
 * Reference SVG charts, ported to Vue. Every coordinate is computed in
 * `@moderno/charts-core`; these components are a pure map from the model to
 * `<svg>` elements (F4.2), authored with `h()` to match `button.ts`/`select.ts`
 * (no SFCs). They hold zero colour — series paint from `--chart-*` via the
 * data-series index in `components.css`, axes/grid from semantic slots. Because
 * the model is deterministic and DOM-free, the same SVG serialises on server
 * and client (F4.4), byte-identical to the React reference.
 *
 * The frame (root + grid + axes) is shared; each chart only supplies its series
 * shapes. The four frameworks render this identical structure so the charts
 * look the same everywhere.
 *
 * `inheritAttrs: false` so consumer attributes (class, aria-*, …) spread
 * explicitly *before* the scope/part attrs — the contract attrs land last and
 * can't be clobbered, mirroring the React binding's prop order.
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

/** Render the shared frame (root svg + grid + axes + tick labels) + series. */
function chartFrame(
  type: string,
  model: FrameModel,
  attrs: Record<string, unknown>,
  series: VNode[],
): VNode {
  const { plot, xAxis, yAxis, width, height } = model;
  const right = plot.x + plot.width;
  const bottom = plot.y + plot.height;
  return h(
    "svg",
    {
      viewBox: `0 0 ${width} ${height}`,
      role: "img",
      preserveAspectRatio: "xMidYMid meet",
      ...attrs,
      ...partAttrs("chart", "root"),
      "data-chart": type,
    },
    [
      h(
        "g",
        { "data-part": "grid" },
        yAxis.map((t) =>
          h("line", {
            key: t.value,
            "data-part": "grid-line",
            x1: plot.x,
            y1: t.position,
            x2: right,
            y2: t.position,
          }),
        ),
      ),
      h("line", { "data-part": "axis-line", x1: plot.x, y1: bottom, x2: right, y2: bottom }),
      h("line", { "data-part": "axis-line", x1: plot.x, y1: plot.y, x2: plot.x, y2: bottom }),
      ...xAxis.map((t) =>
        h(
          "text",
          {
            key: t.value,
            "data-part": "tick-label",
            "data-orientation": "x",
            x: t.position,
            y: bottom + LABEL_GAP + 8,
          },
          t.label,
        ),
      ),
      ...yAxis.map((t) =>
        h(
          "text",
          {
            key: t.value,
            "data-part": "tick-label",
            "data-orientation": "y",
            x: plot.x - LABEL_GAP,
            y: t.position + 4,
          },
          t.label,
        ),
      ),
      ...series,
    ],
  );
}

// Shared cartesian props (line/area/scatter). `width`/`height` are numbers here.
const cartesianProps = {
  width: { type: Number, required: true as const },
  height: { type: Number, required: true as const },
  margin: { type: Object as PropType<Partial<ChartMargin>>, default: undefined },
  series: { type: Array as PropType<readonly CartesianSeries[]>, required: true as const },
  xDomain: { type: Array as unknown as PropType<readonly [number, number]>, default: undefined },
  yDomain: { type: Array as unknown as PropType<readonly [number, number]>, default: undefined },
  xTicks: { type: Number, default: undefined },
  yTicks: { type: Number, default: undefined },
  format: { type: Function as PropType<(value: number) => string>, default: undefined },
};

// ── Line ────────────────────────────────────────────────────────────────────
export const LineChart = defineComponent({
  name: "ModernoLineChart",
  inheritAttrs: false,
  props: {
    ...cartesianProps,
    curve: { type: Function as PropType<CurveFactory>, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const model: LineChartModel = buildLineChart(props as LineChartOptions);
      const series = model.series.map((s) =>
        h("g", { key: s.index, "data-part": "series", "data-series": s.index }, [
          h("path", { "data-part": "line", d: s.path }),
        ]),
      );
      return chartFrame("line", model, attrs, series);
    };
  },
});

// ── Area ────────────────────────────────────────────────────────────────────
export const AreaChart = defineComponent({
  name: "ModernoAreaChart",
  inheritAttrs: false,
  props: {
    ...cartesianProps,
    curve: { type: Function as PropType<CurveFactory>, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const model: AreaChartModel = buildAreaChart(props as AreaChartOptions);
      const series = model.series.map((s) =>
        h("g", { key: s.index, "data-part": "series", "data-series": s.index }, [
          h("path", { "data-part": "area", d: s.area }),
          h("path", { "data-part": "line", d: s.line }),
        ]),
      );
      return chartFrame("area", model, attrs, series);
    };
  },
});

// ── Bar ─────────────────────────────────────────────────────────────────────
export const BarChart = defineComponent({
  name: "ModernoBarChart",
  inheritAttrs: false,
  props: {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    margin: { type: Object as PropType<Partial<ChartMargin>>, default: undefined },
    categories: { type: Array as PropType<readonly string[]>, required: true },
    series: { type: Array as PropType<readonly BarSeries[]>, required: true },
    yDomain: { type: Array as unknown as PropType<readonly [number, number]>, default: undefined },
    yTicks: { type: Number, default: undefined },
    padding: { type: Number, default: undefined },
    format: { type: Function as PropType<(value: number) => string>, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const model: BarChartModel = buildBarChart(props as BarChartOptions);
      const series = model.series.map((s) =>
        h(
          "g",
          { key: s.index, "data-part": "series", "data-series": s.index },
          s.bars.map((bar) =>
            h("rect", {
              key: bar.category,
              "data-part": "bar",
              x: bar.x,
              y: bar.y,
              width: bar.width,
              height: bar.height,
            }),
          ),
        ),
      );
      return chartFrame("bar", model, attrs, series);
    };
  },
});

// ── Scatter ──────────────────────────────────────────────────────────────────
export const ScatterChart = defineComponent({
  name: "ModernoScatterChart",
  inheritAttrs: false,
  props: {
    ...cartesianProps,
    radius: { type: Number, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const model: ScatterChartModel = buildScatterChart(props as ScatterChartOptions);
      const series = model.series.map((s) =>
        h(
          "g",
          { key: s.index, "data-part": "series", "data-series": s.index },
          s.points.map((p, i) =>
            h("circle", { key: i, "data-part": "point", cx: p.cx, cy: p.cy, r: p.r }),
          ),
        ),
      );
      return chartFrame("scatter", model, attrs, series);
    };
  },
});

export type {
  LineChartOptions as LineChartProps,
  AreaChartOptions as AreaChartProps,
  BarChartOptions as BarChartProps,
  ScatterChartOptions as ScatterChartProps,
};
