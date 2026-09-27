import { splitProps } from "solid-js";
import { donutChartNodes, type DonutChartOptions } from "@moderno-ui/charts-core";
import { Chart, type SvgProps } from "./charts.jsx";

/**
 * A ring split into one slice per datum, ported to Solid. The slice geometry
 * and the `data-part` structure come from `@moderno-ui/charts-core`; this
 * component only walks the node tree. Each slice paints from `--chart-*` by its
 * index in `data`, via `components.css`.
 */
export interface DonutChartProps extends DonutChartOptions, SvgProps {}

export function DonutChart(props: DonutChartProps) {
  const [local, rest] = splitProps(props, ["width", "height", "data", "innerRadius", "padAngle"]);
  return <Chart node={donutChartNodes(local)} {...rest} />;
}
