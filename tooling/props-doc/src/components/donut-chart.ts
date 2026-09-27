import type { ComponentDefinition } from "../component-definition.ts";

export default {
  name: "DonutChart",
  slug: "donut-chart",
  scope: "chart",
  props: { file: "src/donut-chart.tsx", type: "DonutChartProps" },
  // A ring has no axes: `donutChartNodes` emits the root and one series group
  // per slice, with none of the Cartesian frame.
  parts: [{ name: "root" }, { name: "series" }, { name: "slice" }],
  examples: {
    react: [
      {
        title: "Donut chart",
        code: [
          'import { DonutChart } from "@moderno-ui/react";',
          "",
          "const data = [",
          '  { name: "Direct", value: 456 },',
          '  { name: "Search", value: 351 },',
          '  { name: "Referral", value: 271 },',
          "];",
          "",
          '<DonutChart width={240} height={240} data={data} aria-label="Traffic by source" />',
        ].join("\n"),
      },
    ],
    vue: [
      {
        title: "Donut chart",
        code: [
          '<script setup lang="ts">',
          'import { DonutChart } from "@moderno-ui/vue";',
          "",
          "const data = [",
          '  { name: "Direct", value: 456 },',
          '  { name: "Search", value: 351 },',
          '  { name: "Referral", value: 271 },',
          "];",
          "</script>",
          "",
          "<template>",
          '  <DonutChart :width="240" :height="240" :data="data" aria-label="Traffic by source" />',
          "</template>",
        ].join("\n"),
      },
    ],
    svelte: [
      {
        title: "Donut chart",
        code: [
          '<script lang="ts">',
          '  import { DonutChart } from "@moderno-ui/svelte";',
          "",
          "  const data = [",
          '    { name: "Direct", value: 456 },',
          '    { name: "Search", value: 351 },',
          '    { name: "Referral", value: 271 },',
          "  ];",
          "</script>",
          "",
          '<DonutChart width={240} height={240} {data} aria-label="Traffic by source" />',
        ].join("\n"),
      },
    ],
    solid: [
      {
        title: "Donut chart",
        code: [
          'import { DonutChart } from "@moderno-ui/solid";',
          "",
          "const data = [",
          '  { name: "Direct", value: 456 },',
          '  { name: "Search", value: 351 },',
          '  { name: "Referral", value: 271 },',
          "];",
          "",
          "function TrafficChart() {",
          '  return <DonutChart width={240} height={240} data={data} aria-label="Traffic by source" />;',
          "}",
        ].join("\n"),
      },
    ],
  },
} satisfies ComponentDefinition;
