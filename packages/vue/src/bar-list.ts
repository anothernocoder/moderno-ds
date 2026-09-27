import { defineComponent, type PropType } from "vue";
import {
  barListNodes,
  type BarListItem,
  type BarListOptions,
  type BarListSort,
} from "@moderno-ui/charts-core";
import { chartVNode } from "./charts.js";

/**
 * A ranking, ported to Vue: one row per item, each a name, a track, the bar
 * filling it and a value. The rows, bar lengths and `data-part` structure come
 * from `barListNodes` in `@moderno-ui/charts-core`; this only hands the tree to
 * the shared chart walker. It holds zero colour — the track and bar paint from
 * `--chart-*` through the series colour in `components.css`.
 *
 * `inheritAttrs: false` so consumer attributes spread before the contract
 * attributes, which land last and can't be clobbered.
 */
export const BarList = defineComponent({
  name: "ModernoBarList",
  inheritAttrs: false,
  props: {
    width: { type: Number, required: true },
    data: { type: Array as PropType<readonly BarListItem[]>, required: true },
    max: { type: Number, default: undefined },
    sort: { type: String as PropType<BarListSort>, default: undefined },
    labelWidth: { type: Number, default: undefined },
    valueWidth: { type: Number, default: undefined },
    rowHeight: { type: Number, default: undefined },
    barHeight: { type: Number, default: undefined },
    format: { type: Function as PropType<(value: number) => string>, default: undefined },
  },
  setup(props, { attrs }) {
    return () => chartVNode(barListNodes(props as BarListOptions), attrs);
  },
});

export type { BarListOptions as BarListProps };
