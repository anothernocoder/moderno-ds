import { splitProps } from "solid-js";
import { barListNodes, type BarListOptions } from "@moderno-ui/charts-core";
import { Chart, type SvgProps } from "./charts.jsx";

/**
 * A ranking, ported to Solid: one row per item, each a name, a track, the bar
 * filling it and a value. The rows, bar lengths and `data-part` structure come
 * from `barListNodes` in `@moderno-ui/charts-core`; this only hands the tree to
 * the shared chart walker. It holds zero colour — the track and bar paint from
 * `--chart-*` through the series colour in `components.css`.
 */
export interface BarListProps extends BarListOptions, SvgProps {}

export function BarList(props: BarListProps) {
  const [local, rest] = splitProps(props, [
    "width",
    "data",
    "max",
    "sort",
    "labelWidth",
    "valueWidth",
    "rowHeight",
    "barHeight",
    "format",
  ]);
  return <Chart node={barListNodes(local)} {...rest} />;
}
