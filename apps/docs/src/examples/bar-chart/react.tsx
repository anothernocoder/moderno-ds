/**
 * BarChart — pure SVG over @moderno-ui/charts-core; colour comes from the
 * `--chart-*` token slots via the series index, nothing baked in here.
 */
import { BarChart } from "@moderno-ui/react";

const categories = ["Q1", "Q2", "Q3", "Q4"];
const series = [
  { name: "Revenue", values: [8, 14, 11, 20] },
  { name: "Costs", values: [5, 9, 8, 12] },
];

export function BarChartDemo() {
  return <BarChart width={520} height={260} categories={categories} series={series} yTicks={5} />;
}
