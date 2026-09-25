/** @jsxImportSource solid-js */
/**
 * Larger markers: `radius` sets the size of every point in the chart,
 * in pixels — @moderno-ui/solid.
 *
 * See examples/button/solid.tsx for why the pragma above is required.
 */
import { ScatterChart } from "@moderno-ui/solid";

const series = [
  {
    name: "Samples",
    points: [
      { x: 0, y: 12 },
      { x: 1, y: 28 },
      { x: 2, y: 22 },
      { x: 3, y: 40 },
      { x: 4, y: 18 },
      { x: 5, y: 34 },
    ],
  },
];

export function ScatterChartMarkerSizeDemo() {
  return <ScatterChart width={520} height={260} series={series} radius={8} />;
}
