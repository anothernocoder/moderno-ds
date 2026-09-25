/** @jsxImportSource solid-js */
/**
 * Wider band padding: half of each category's step is gap, so the
 * bars read as slimmer columns — @moderno-ui/solid.
 *
 * See examples/button/solid.tsx for why the pragma above is required.
 */
import { BarChart } from "@moderno-ui/solid";

const categories = ["Q1", "Q2", "Q3", "Q4"];
const series = [{ name: "Revenue", values: [8, 14, 11, 20] }];

export function BarChartPaddingDemo() {
  return (
    <BarChart
      width={520}
      height={260}
      categories={categories}
      series={series}
      yTicks={5}
      padding={0.5}
    />
  );
}
