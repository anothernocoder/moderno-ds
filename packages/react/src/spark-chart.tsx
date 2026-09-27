import { sparkChartNodes, type SparkChartOptions } from "@moderno-ui/charts-core";
import { Chart, type SvgProps } from "./charts.js";

/**
 * A compact line for KPI cards. The render tree — geometry and `data-part`
 * structure — comes from `@moderno-ui/charts-core`; this component only hands
 * it to the shared chart walker. It holds zero colour: its one series paints
 * from `--chart-1` in `components.css`.
 */

// `points` is the data here, not the SVG polyline attribute.
export interface SparkChartProps extends SparkChartOptions, Omit<SvgProps, "points"> {}

export function SparkChart({
  points,
  width,
  height,
  yDomain,
  curve,
  area,
  showLastPoint,
  ...rest
}: SparkChartProps) {
  const node = sparkChartNodes({ points, width, height, yDomain, curve, area, showLastPoint });
  return <Chart node={node} {...rest} />;
}
