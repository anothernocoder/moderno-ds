import { skeletonRecipe } from "@moderno-ui/core";
import type { ComponentDefinition } from "../component-definition.ts";

export default {
  name: "Skeleton",
  slug: "skeleton",
  scope: "skeleton",
  props: { file: "src/skeleton.tsx", type: "SkeletonProps" },
  parts: [{ name: "root" }],
  variants: skeletonRecipe.variants,
  examples: {
    react: [
      {
        title: "A profile row while it loads",
        code: [
          'import { Skeleton } from "@moderno-ui/react";',
          "",
          '<div aria-busy="true">',
          '  <Skeleton shape="circle" />',
          "  <Skeleton />",
          '  <Skeleton style={{ width: "60%" }} />',
          "</div>",
        ].join("\n"),
      },
    ],
    vue: [
      {
        title: "A profile row while it loads",
        code: [
          '<script setup lang="ts">',
          'import { Skeleton } from "@moderno-ui/vue";',
          "</script>",
          "",
          "<template>",
          '  <div aria-busy="true">',
          '    <Skeleton shape="circle" />',
          "    <Skeleton />",
          '    <Skeleton style="width: 60%" />',
          "  </div>",
          "</template>",
        ].join("\n"),
      },
    ],
    svelte: [
      {
        title: "A profile row while it loads",
        code: [
          '<script lang="ts">',
          '  import { Skeleton } from "@moderno-ui/svelte";',
          "</script>",
          "",
          '<div aria-busy="true">',
          '  <Skeleton shape="circle" />',
          "  <Skeleton />",
          '  <Skeleton style="width: 60%" />',
          "</div>",
        ].join("\n"),
      },
    ],
    solid: [
      {
        title: "A profile row while it loads",
        code: [
          'import { Skeleton } from "@moderno-ui/solid";',
          "",
          '<div aria-busy="true">',
          '  <Skeleton shape="circle" />',
          "  <Skeleton />",
          '  <Skeleton style={{ width: "60%" }} />',
          "</div>",
        ].join("\n"),
      },
    ],
  },
} satisfies ComponentDefinition;
