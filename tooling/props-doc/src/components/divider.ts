import { dividerRecipe } from "@moderno-ui/core";
import type { ComponentDefinition } from "../component-definition.ts";

export default {
  name: "Divider",
  slug: "divider",
  scope: "divider",
  props: { file: "src/divider.tsx", type: "DividerProps" },
  // The rule itself is drawn with the root's ::before/::after, so `label` is
  // the only part `components.css` targets besides the root.
  parts: [{ name: "root" }, { name: "label" }],
  variants: dividerRecipe.variants,
  examples: {
    react: [
      {
        title: "Plain rule and a captioned one",
        code: [
          'import { Divider } from "@moderno-ui/react";',
          "",
          "<Divider />",
          "<Divider>Or continue with</Divider>",
          '<Divider orientation="vertical" />',
          '<Divider orientation="vertical">or</Divider>',
        ].join("\n"),
      },
    ],
    vue: [
      {
        title: "Plain rule and a captioned one",
        code: [
          '<script setup lang="ts">',
          'import { Divider } from "@moderno-ui/vue";',
          "</script>",
          "",
          "<template>",
          "  <Divider />",
          "  <Divider>Or continue with</Divider>",
          '  <Divider orientation="vertical" />',
          '  <Divider orientation="vertical">or</Divider>',
          "</template>",
        ].join("\n"),
      },
    ],
    svelte: [
      {
        title: "Plain rule and a captioned one",
        code: [
          '<script lang="ts">',
          '  import { Divider } from "@moderno-ui/svelte";',
          "</script>",
          "",
          "<Divider />",
          "<Divider>Or continue with</Divider>",
          '<Divider orientation="vertical" />',
          '<Divider orientation="vertical">or</Divider>',
        ].join("\n"),
      },
    ],
    solid: [
      {
        title: "Plain rule and a captioned one",
        code: [
          'import { Divider } from "@moderno-ui/solid";',
          "",
          "<Divider />",
          "<Divider>Or continue with</Divider>",
          '<Divider orientation="vertical" />',
          '<Divider orientation="vertical">or</Divider>',
        ].join("\n"),
      },
    ],
  },
} satisfies ComponentDefinition;
