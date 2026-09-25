/**
 * A `format` function turns each value-axis tick into a label with its
 * unit — @moderno-ui/react.
 */
import { BarChart } from "@moderno-ui/react";

const categories = ["Q1", "Q2", "Q3", "Q4"];
const series = [{ name: "Revenue", values: [8, 14, 11, 20] }];
const format = (value: number) => `$${value}k`;

export function BarChartTickFormatDemo() {
  return (
    <BarChart
      width={520}
      height={260}
      categories={categories}
      series={series}
      yTicks={5}
      format={format}
    />
  );
}
