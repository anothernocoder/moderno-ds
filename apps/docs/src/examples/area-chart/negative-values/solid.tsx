/** @jsxImportSource solid-js */
import { AreaChart } from "@moderno-ui/solid";

const series = [
  {
    name: "Net cash flow",
    points: [
      { x: 0, y: 6 },
      { x: 1, y: 2 },
      { x: 2, y: -4 },
      { x: 3, y: -1 },
      { x: 4, y: 5 },
      { x: 5, y: 9 },
    ],
  },
];

export function AreaChartNegativeValuesDemo() {
  return <AreaChart width={520} height={260} series={series} xTicks={6} yTicks={5} />;
}
