import { CHART_FRAME_PARTS } from "../chart-frame-parts.ts";
import type { ComponentDefinition } from "../component-definition.ts";

export default {
  name: "AreaChart",
  slug: "area-chart",
  scope: "chart",
  props: { file: "src/charts.tsx", type: "AreaChartProps" },
  parts: CHART_FRAME_PARTS.concat({ name: "area" }, { name: "line" }),
  examples: {
    react: [
      {
        title: "Single-series area chart",
        code: [
          'import { AreaChart } from "@moderno-ui/react";',
          "",
          "const series = [",
          '  { name: "Revenue", points: [{ x: 0, y: 8 }, { x: 1, y: 14 }, { x: 2, y: 11 }] },',
          "];",
          "",
          "<AreaChart width={520} height={260} series={series} xTicks={3} yTicks={5} />",
        ].join("\n"),
      },
    ],
    vue: [
      {
        title: "Single-series area chart",
        code: [
          '<script setup lang="ts">',
          'import { AreaChart } from "@moderno-ui/vue";',
          "",
          "const series = [",
          '  { name: "Revenue", points: [{ x: 0, y: 8 }, { x: 1, y: 14 }, { x: 2, y: 11 }] },',
          "];",
          "</script>",
          "",
          "<template>",
          '  <AreaChart :width="520" :height="260" :series="series" :x-ticks="3" :y-ticks="5" />',
          "</template>",
        ].join("\n"),
      },
    ],
    svelte: [
      {
        title: "Single-series area chart",
        code: [
          '<script lang="ts">',
          '  import { AreaChart } from "@moderno-ui/svelte";',
          "",
          "  const series = [",
          '    { name: "Revenue", points: [{ x: 0, y: 8 }, { x: 1, y: 14 }, { x: 2, y: 11 }] },',
          "  ];",
          "</script>",
          "",
          "<AreaChart width={520} height={260} {series} xTicks={3} yTicks={5} />",
        ].join("\n"),
      },
    ],
    solid: [
      {
        title: "Single-series area chart",
        code: [
          'import { AreaChart } from "@moderno-ui/solid";',
          "",
          "const series = [",
          '  { name: "Revenue", points: [{ x: 0, y: 8 }, { x: 1, y: 14 }, { x: 2, y: 11 }] },',
          "];",
          "",
          "function RevenueChart() {",
          "  return <AreaChart width={520} height={260} series={series} xTicks={3} yTicks={5} />;",
          "}",
        ].join("\n"),
      },
    ],
  },
} satisfies ComponentDefinition;
