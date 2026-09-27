import { donutChartNodes, type DonutChartOptions } from "@moderno-ui/charts-core";
import { Chart, type SvgProps } from "./charts.js";

/**
 * A ring split into one slice per datum. The slice geometry and the
 * `data-part` structure come from `@moderno-ui/charts-core`; this component
 * only walks the node tree. Each slice paints from `--chart-*` by its index in
 * `data`, via `components.css`.
 */
export interface DonutChartProps extends DonutChartOptions, SvgProps {}

export function DonutChart({
  width,
  height,
  data,
  innerRadius,
  padAngle,
  ...rest
}: DonutChartProps) {
  const node = donutChartNodes({ width, height, data, innerRadius, padAngle });
  return <Chart node={node} {...rest} />;
}
