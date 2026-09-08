/** @jsxImportSource solid-js */
/**
 * AreaChart — pure SVG over @moderno-ui/charts-core; colour comes from the
 * `--chart-*` token slots via the series index, nothing baked in here.
 *
 * See examples/button/solid.tsx for why the pragma above is required.
 */
import { AreaChart } from "@moderno-ui/solid";

const series = [
  {
    name: "Revenue",
    points: [
      { x: 0, y: 8 },
      { x: 1, y: 14 },
      { x: 2, y: 11 },
      { x: 3, y: 20 },
      { x: 4, y: 18 },
      { x: 5, y: 26 },
    ],
  },
];

export function AreaChartDemo() {
  return <AreaChart width={520} height={260} series={series} xTicks={6} yTicks={5} />;
}
