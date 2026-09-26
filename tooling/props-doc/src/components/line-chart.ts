import { CHART_FRAME_PARTS } from "../chart-frame-parts.ts";
import type { ComponentDefinition } from "../component-definition.ts";

export default {
  name: "LineChart",
  slug: "line-chart",
  scope: "chart",
  props: { file: "src/charts.tsx", type: "LineChartProps" },
  parts: CHART_FRAME_PARTS.concat({ name: "line" }),
  examples: {
    react: [
      {
        title: "Two-series line chart",
        code: [
          'import { LineChart } from "@moderno-ui/react";',
          "",
          "const series = [",
          '  { name: "Sessions", points: [{ x: 0, y: 12 }, { x: 1, y: 28 }, { x: 2, y: 22 }] },',
          "];",
          "",
          "<LineChart width={520} height={260} series={series} xTicks={3} yTicks={5} />",
        ].join("\n"),
      },
    ],
    vue: [
      {
        title: "Two-series line chart",
        code: [
          '<script setup lang="ts">',
          'import { LineChart } from "@moderno-ui/vue";',
          "",
          "const series = [",
          '  { name: "Sessions", points: [{ x: 0, y: 12 }, { x: 1, y: 28 }, { x: 2, y: 22 }] },',
          "];",
          "</script>",
          "",
          "<template>",
          '  <LineChart :width="520" :height="260" :series="series" :x-ticks="3" :y-ticks="5" />',
          "</template>",
        ].join("\n"),
      },
    ],
    svelte: [
      {
        title: "Two-series line chart",
        code: [
          '<script lang="ts">',
          '  import { LineChart } from "@moderno-ui/svelte";',
          "",
          "  const series = [",
          '    { name: "Sessions", points: [{ x: 0, y: 12 }, { x: 1, y: 28 }, { x: 2, y: 22 }] },',
          "  ];",
          "</script>",
          "",
          "<LineChart width={520} height={260} {series} xTicks={3} yTicks={5} />",
        ].join("\n"),
      },
    ],
    solid: [
      {
        title: "Two-series line chart",
        code: [
          'import { LineChart } from "@moderno-ui/solid";',
          "",
          "const series = [",
          '  { name: "Sessions", points: [{ x: 0, y: 12 }, { x: 1, y: 28 }, { x: 2, y: 22 }] },',
          "];",
          "",
          "function SessionsChart() {",
          "  return <LineChart width={520} height={260} series={series} xTicks={3} yTicks={5} />;",
          "}",
        ].join("\n"),
      },
    ],
  },
} satisfies ComponentDefinition;
