/** @jsxImportSource solid-js */
/**
 * The same series drawn through a monotone curve instead of straight
 * segments; the curve factory comes from charts-core — @moderno-ui/solid.
 *
 * See examples/button/solid.tsx for why the pragma above is required.
 */
import { LineChart } from "@moderno-ui/solid";
import { curveMonotoneX } from "@moderno-ui/charts-core";

const series = [
  {
    name: "Sessions",
    points: [
      { x: 0, y: 12 },
      { x: 1, y: 28 },
      { x: 2, y: 22 },
      { x: 3, y: 40 },
      { x: 4, y: 36 },
      { x: 5, y: 54 },
    ],
  },
];

export function LineChartCurveDemo() {
  return (
    <LineChart
      width={520}
      height={260}
      series={series}
      xTicks={6}
      yTicks={5}
      curve={curveMonotoneX}
    />
  );
}
