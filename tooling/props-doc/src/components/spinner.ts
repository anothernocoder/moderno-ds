import { spinnerRecipe } from "@moderno-ui/core";
import type { ComponentDefinition } from "../component-definition.ts";

export default {
  name: "Spinner",
  slug: "spinner",
  scope: "spinner",
  props: { file: "src/spinner.tsx", type: "SpinnerProps" },
  parts: [
    { name: "root" },
    { name: "circle", description: "The spinning ring; `aria-hidden`." },
    { name: "label", description: "Visually hidden text read by screen readers." },
  ],
  variants: spinnerRecipe.variants,
  examples: {
    react: [
      {
        title: "A spinner that says what is loading",
        code: [
          'import { Spinner } from "@moderno-ui/react";',
          "",
          "<Spinner />",
          '<Spinner size="lg" label="Loading invoices" />',
        ].join("\n"),
      },
    ],
    vue: [
      {
        title: "A spinner that says what is loading",
        code: [
          '<script setup lang="ts">',
          'import { Spinner } from "@moderno-ui/vue";',
          "</script>",
          "",
          "<template>",
          "  <Spinner />",
          '  <Spinner size="lg" label="Loading invoices" />',
          "</template>",
        ].join("\n"),
      },
    ],
    svelte: [
      {
        title: "A spinner that says what is loading",
        code: [
          '<script lang="ts">',
          '  import { Spinner } from "@moderno-ui/svelte";',
          "</script>",
          "",
          "<Spinner />",
          '<Spinner size="lg" label="Loading invoices" />',
        ].join("\n"),
      },
    ],
    solid: [
      {
        title: "A spinner that says what is loading",
        code: [
          'import { Spinner } from "@moderno-ui/solid";',
          "",
          "<Spinner />",
          '<Spinner size="lg" label="Loading invoices" />',
        ].join("\n"),
      },
    ],
  },
} satisfies ComponentDefinition;
