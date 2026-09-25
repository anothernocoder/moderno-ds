/** @jsxImportSource solid-js */
import { BarChart } from "@moderno-ui/solid";

const categories = ["Q1", "Q2", "Q3", "Q4"];
const series = [{ name: "Revenue", values: [8, 14, 11, 20] }];

export function BarChartDemo() {
  return <BarChart width={520} height={260} categories={categories} series={series} yTicks={5} />;
}
