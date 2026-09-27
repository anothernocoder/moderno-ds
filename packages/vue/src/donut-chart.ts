import { defineComponent, type PropType } from "vue";
import { donutChartNodes, type DonutChartOptions, type DonutDatum } from "@moderno-ui/charts-core";
import { chartVNode } from "./charts.js";

/**
 * A ring split into one slice per datum, ported to Vue. The slice geometry and
 * the `data-part` structure come from `@moderno-ui/charts-core`; this component
 * only walks the node tree. Each slice paints from `--chart-*` by its index in
 * `data`, via `components.css`. `inheritAttrs: false` so consumer attributes
 * land before the contract attributes, which can't be clobbered.
 */
export const DonutChart = defineComponent({
  name: "ModernoDonutChart",
  inheritAttrs: false,
  props: {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    data: { type: Array as PropType<readonly DonutDatum[]>, required: true },
    innerRadius: { type: Number, default: undefined },
    padAngle: { type: Number, default: undefined },
  },
  setup(props, { attrs }) {
    return () => chartVNode(donutChartNodes(props as DonutChartOptions), attrs);
  },
});

export type { DonutChartOptions as DonutChartProps };
