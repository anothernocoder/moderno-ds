import { CHART_FRAME_PARTS } from "../chart-frame-parts.ts";
import type { ComponentDefinition } from "../component-definition.ts";

export default {
  name: "BarChart",
  slug: "bar-chart",
  scope: "chart",
  props: { file: "src/charts.tsx", type: "BarChartProps" },
  parts: CHART_FRAME_PARTS.concat({ name: "bar" }),
  examples: {
    react: [
      {
        title: "Categorical bar chart",
        code: [
          'import { BarChart } from "@moderno-ui/react";',
          "",
          'const categories = ["Q1", "Q2", "Q3"];',
          'const series = [{ name: "Revenue", values: [8, 14, 11] }];',
          "",
          "<BarChart width={520} height={260} categories={categories} series={series} yTicks={5} />",
        ].join("\n"),
      },
    ],
    vue: [
      {
        title: "Categorical bar chart",
        code: [
          '<script setup lang="ts">',
          'import { BarChart } from "@moderno-ui/vue";',
          "",
          'const categories = ["Q1", "Q2", "Q3"];',
          'const series = [{ name: "Revenue", values: [8, 14, 11] }];',
          "</script>",
          "",
          "<template>",
          '  <BarChart :width="520" :height="260" :categories="categories" :series="series" :y-ticks="5" />',
          "</template>",
        ].join("\n"),
      },
    ],
    svelte: [
      {
        title: "Categorical bar chart",
        code: [
          '<script lang="ts">',
          '  import { BarChart } from "@moderno-ui/svelte";',
          "",
          '  const categories = ["Q1", "Q2", "Q3"];',
          '  const series = [{ name: "Revenue", values: [8, 14, 11] }];',
          "</script>",
          "",
          "<BarChart width={520} height={260} {categories} {series} yTicks={5} />",
        ].join("\n"),
      },
    ],
    solid: [
      {
        title: "Categorical bar chart",
        code: [
          'import { BarChart } from "@moderno-ui/solid";',
          "",
          'const categories = ["Q1", "Q2", "Q3"];',
          'const series = [{ name: "Revenue", values: [8, 14, 11] }];',
          "",
          "function RevenueByQuarter() {",
          "  return (",
          "    <BarChart width={520} height={260} categories={categories} series={series} yTicks={5} />",
          "  );",
          "}",
        ].join("\n"),
      },
    ],
  },
} satisfies ComponentDefinition;
