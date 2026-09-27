import { splitProps } from "solid-js";
import { sparkChartNodes, type SparkChartOptions } from "@moderno-ui/charts-core";
import { Chart, type SvgProps } from "./charts.jsx";

/**
 * A compact line for KPI cards, ported to Solid. The render tree — geometry
 * and `data-part` structure — comes from `@moderno-ui/charts-core`; this
 * component only hands it to the shared chart walker. It holds zero colour:
 * its one series paints from `--chart-1` in `components.css`.
 */
export interface SparkChartProps extends SparkChartOptions, SvgProps {}

export function SparkChart(props: SparkChartProps) {
  const [local, rest] = splitProps(props, [
    "points",
    "width",
    "height",
    "yDomain",
    "curve",
    "area",
    "showLastPoint",
  ]);
  return <Chart node={sparkChartNodes(local)} {...rest} />;
}
