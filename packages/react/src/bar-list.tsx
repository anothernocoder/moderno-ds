import { barListNodes, type BarListOptions } from "@moderno-ui/charts-core";
import { Chart, type SvgProps } from "./charts.js";

/**
 * A ranking: one row per item, each a name, a track, the bar filling it and a
 * value. The rows, bar lengths and `data-part` structure come from
 * `barListNodes` in `@moderno-ui/charts-core`; this only hands the tree to the
 * shared chart walker. It holds zero colour — the track and bar paint from
 * `--chart-*` through the series colour in `components.css`.
 */

// `max` is the value a full track stands for, not SVG's animation attribute.
export interface BarListProps extends BarListOptions, Omit<SvgProps, "max"> {}

export function BarList({
  width,
  data,
  max,
  sort,
  labelWidth,
  valueWidth,
  rowHeight,
  barHeight,
  format,
  ...rest
}: BarListProps) {
  const node = barListNodes({
    width,
    data,
    max,
    sort,
    labelWidth,
    valueWidth,
    rowHeight,
    barHeight,
    format,
  });
  return <Chart node={node} {...rest} />;
}
