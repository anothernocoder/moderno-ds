import type { ComponentDefinition } from "../component-definition.ts";

/**
 * BarList shares the chart scope and root, but has no frame: no grid, axes or
 * tick labels. One series holds a row per item: its name, its track, the bar
 * filling it and its value (`barListNodes` in `@moderno-ui/charts-core`).
 */
export default {
  name: "BarList",
  slug: "bar-list",
  scope: "chart",
  props: { file: "src/bar-list.tsx", type: "BarListProps" },
  parts: [
    { name: "root" },
    { name: "series" },
    { name: "row" },
    { name: "label" },
    { name: "track" },
    { name: "bar" },
    { name: "value" },
  ],
  examples: {
    react: [
      {
        title: "Ranking",
        code: [
          'import { BarList } from "@moderno-ui/react";',
          "",
          "const pages = [",
          '  { name: "/", value: 1240 },',
          '  { name: "/pricing", value: 860 },',
          '  { name: "/docs", value: 540 },',
          "];",
          "",
          '<BarList width={420} data={pages} aria-label="Visits by page" />',
        ].join("\n"),
      },
    ],
    vue: [
      {
        title: "Ranking",
        code: [
          '<script setup lang="ts">',
          'import { BarList } from "@moderno-ui/vue";',
          "",
          "const pages = [",
          '  { name: "/", value: 1240 },',
          '  { name: "/pricing", value: 860 },',
          '  { name: "/docs", value: 540 },',
          "];",
          "</script>",
          "",
          "<template>",
          '  <BarList :width="420" :data="pages" aria-label="Visits by page" />',
          "</template>",
        ].join("\n"),
      },
    ],
    svelte: [
      {
        title: "Ranking",
        code: [
          '<script lang="ts">',
          '  import { BarList } from "@moderno-ui/svelte";',
          "",
          "  const pages = [",
          '    { name: "/", value: 1240 },',
          '    { name: "/pricing", value: 860 },',
          '    { name: "/docs", value: 540 },',
          "  ];",
          "</script>",
          "",
          '<BarList width={420} data={pages} aria-label="Visits by page" />',
        ].join("\n"),
      },
    ],
    solid: [
      {
        title: "Ranking",
        code: [
          'import { BarList } from "@moderno-ui/solid";',
          "",
          "const pages = [",
          '  { name: "/", value: 1240 },',
          '  { name: "/pricing", value: 860 },',
          '  { name: "/docs", value: 540 },',
          "];",
          "",
          "function TopPages() {",
          '  return <BarList width={420} data={pages} aria-label="Visits by page" />;',
          "}",
        ].join("\n"),
      },
    ],
  },
} satisfies ComponentDefinition;
