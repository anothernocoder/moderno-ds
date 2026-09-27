import { defineComponent, type PropType } from "vue";
import {
  sparkChartNodes,
  type CurveFactory,
  type SparkChartOptions,
  type XYPoint,
} from "@moderno-ui/charts-core";
import { chartVNode } from "./charts.js";

/**
 * A compact line for KPI cards, ported to Vue. The render tree — geometry and
 * `data-part` structure — comes from `@moderno-ui/charts-core`; this component
 * only hands it to the shared chart walker. It holds zero colour: its one
 * series paints from `--chart-1` in `components.css`.
 *
 * `inheritAttrs: false` so consumer attributes (aria-label, class, …) spread
 * before the contract attrs, which land last and can't be clobbered.
 */
export const SparkChart = defineComponent({
  name: "ModernoSparkChart",
  inheritAttrs: false,
  props: {
    points: { type: Array as PropType<readonly XYPoint[]>, required: true },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    yDomain: { type: Array as unknown as PropType<readonly [number, number]>, default: undefined },
    curve: { type: Function as PropType<CurveFactory>, default: undefined },
    area: { type: Boolean, default: false },
    showLastPoint: { type: Boolean, default: false },
  },
  setup(props, { attrs }) {
    return () => chartVNode(sparkChartNodes(props as SparkChartOptions), attrs);
  },
});

export type { SparkChartOptions as SparkChartProps };
