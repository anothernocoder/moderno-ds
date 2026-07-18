import { defineComponent, h, type PropType, type VNode } from "vue";
import {
  areaChartNodes,
  barChartNodes,
  lineChartNodes,
  scatterChartNodes,
  type AreaChartOptions,
  type BarChartOptions,
  type BarSeries,
  type CartesianSeries,
  type ChartMargin,
  type ChartNode,
  type CurveFactory,
  type LineChartOptions,
  type ScatterChartOptions,
} from "@moderno/charts-core";

/**
 * Reference SVG charts, ported to Vue. The complete render description —
 * geometry, label anchors, and the `data-part` structure — is computed in
 * `@moderno/charts-core`; these components only walk the node tree (F4.2),
 * authored with `h()` to match `button.ts`/`select.ts` (no SFCs). They hold
 * zero colour — series paint from `--chart-*` via the data-series index in
 * `components.css`, axes/grid from semantic slots. Because the tree is
 * deterministic and DOM-free, the same SVG serialises on server and client
 * (F4.4) — parity with the core's reference serialization is tested.
 *
 * `inheritAttrs: false` so consumer attributes (class, aria-*, …) spread
 * explicitly *before* the scope/part attrs — the contract attrs land last and
 * can't be clobbered, mirroring the React binding's prop order.
 */

function walk(node: ChartNode): VNode {
  return h(node.tag, { ...node.attrs }, node.text ?? (node.children ?? []).map(walk));
}

function chartVNode(node: ChartNode, attrs: Record<string, unknown>): VNode {
  return h("svg", { ...attrs, ...node.attrs }, (node.children ?? []).map(walk));
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
    return () => chartVNode(lineChartNodes(props as LineChartOptions), attrs);
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
    return () => chartVNode(areaChartNodes(props as AreaChartOptions), attrs);
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
    return () => chartVNode(barChartNodes(props as BarChartOptions), attrs);
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
    return () => chartVNode(scatterChartNodes(props as ScatterChartOptions), attrs);
  },
});

export type {
  LineChartOptions as LineChartProps,
  AreaChartOptions as AreaChartProps,
  BarChartOptions as BarChartProps,
  ScatterChartOptions as ScatterChartProps,
};
