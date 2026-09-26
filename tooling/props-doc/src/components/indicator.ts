import { indicatorRecipe } from "@moderno-ui/core";
import type { ComponentDefinition } from "../component-definition.ts";

export default {
  name: "Indicator",
  slug: "indicator",
  scope: "indicator",
  props: { file: "src/indicator.tsx", type: "IndicatorProps" },
  // `pulse` is a boolean prop, not a recipe variant: it lands as a bare
  // `data-pulse` on the root, so it is absent from `variants`.
  parts: [{ name: "root" }, { name: "dot" }, { name: "label" }],
  variants: indicatorRecipe.variants,
  examples: {
    react: [
      {
        title: "A live status with a label, and a bare dot",
        code: [
          'import { Indicator } from "@moderno-ui/react";',
          "",
          '<Indicator variant="success" pulse>Online</Indicator>',
          '<Indicator variant="error" aria-label="Offline" />',
        ].join("\n"),
      },
    ],
    vue: [
      {
        title: "A live status with a label, and a bare dot",
        code: [
          '<script setup lang="ts">',
          'import { Indicator } from "@moderno-ui/vue";',
          "</script>",
          "",
          "<template>",
          '  <Indicator variant="success" pulse>Online</Indicator>',
          '  <Indicator variant="error" aria-label="Offline" />',
          "</template>",
        ].join("\n"),
      },
    ],
    svelte: [
      {
        title: "A live status with a label, and a bare dot",
        code: [
          '<script lang="ts">',
          '  import { Indicator } from "@moderno-ui/svelte";',
          "</script>",
          "",
          '<Indicator variant="success" pulse>Online</Indicator>',
          '<Indicator variant="error" aria-label="Offline" />',
        ].join("\n"),
      },
    ],
    solid: [
      {
        title: "A live status with a label, and a bare dot",
        code: [
          'import { Indicator } from "@moderno-ui/solid";',
          "",
          '<Indicator variant="success" pulse>Online</Indicator>',
          '<Indicator variant="error" aria-label="Offline" />',
        ].join("\n"),
      },
    ],
  },
} satisfies ComponentDefinition;
