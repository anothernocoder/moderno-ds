import { segmentedControlRecipe } from "@moderno-ui/core";
import type { ComponentDefinition } from "../component-definition.ts";

export default {
  name: "SegmentedControl",
  slug: "segmented-control",
  scope: "segment-group",
  props: { file: "src/segmented-control.tsx", type: "ModernoSegmentedControlRootProps" },
  // `fullWidth` is a boolean prop, not a recipe variant: it lands as a bare
  // `data-full-width` on the root, so it is absent from `variants`.
  parts: [
    { name: "root", description: "The track; role radiogroup. Carries size and full width." },
    { name: "indicator", description: "The pill that slides behind the selected segment." },
    { name: "item", description: "One segment: a <label> around its radio." },
    { name: "item-text", description: "The segment's label; names its radio." },
  ],
  variants: segmentedControlRecipe.variants,
  examples: {
    react: [
      {
        title: "One value from a few options, with the sliding pill",
        code: [
          'import { SegmentedControl } from "@moderno-ui/react";',
          "",
          '<SegmentedControl.Root defaultValue="fit" onValueChange={save} aria-label="Scale">',
          "  <SegmentedControl.Indicator />",
          '  <SegmentedControl.Item value="fit">',
          "    <SegmentedControl.ItemText>Fit</SegmentedControl.ItemText>",
          "    <SegmentedControl.ItemHiddenInput />",
          "  </SegmentedControl.Item>",
          '  <SegmentedControl.Item value="fill">',
          "    <SegmentedControl.ItemText>Fill</SegmentedControl.ItemText>",
          "    <SegmentedControl.ItemHiddenInput />",
          "  </SegmentedControl.Item>",
          "</SegmentedControl.Root>",
        ].join("\n"),
      },
    ],
    vue: [
      {
        title: "One value from a few options, with the sliding pill",
        code: [
          '<script setup lang="ts">',
          'import { SegmentedControl } from "@moderno-ui/vue";',
          "</script>",
          "",
          "<template>",
          '  <SegmentedControl.Root v-model="scale" aria-label="Scale">',
          "    <SegmentedControl.Indicator />",
          '    <SegmentedControl.Item value="fit">',
          "      <SegmentedControl.ItemText>Fit</SegmentedControl.ItemText>",
          "      <SegmentedControl.ItemHiddenInput />",
          "    </SegmentedControl.Item>",
          '    <SegmentedControl.Item value="fill">',
          "      <SegmentedControl.ItemText>Fill</SegmentedControl.ItemText>",
          "      <SegmentedControl.ItemHiddenInput />",
          "    </SegmentedControl.Item>",
          "  </SegmentedControl.Root>",
          "</template>",
        ].join("\n"),
      },
    ],
    svelte: [
      {
        title: "One value from a few options, with the sliding pill",
        code: [
          '<script lang="ts">',
          '  import { SegmentedControl } from "@moderno-ui/svelte";',
          "</script>",
          "",
          '<SegmentedControl.Root bind:value={scale} aria-label="Scale">',
          "  <SegmentedControl.Indicator />",
          '  <SegmentedControl.Item value="fit">',
          "    <SegmentedControl.ItemText>Fit</SegmentedControl.ItemText>",
          "    <SegmentedControl.ItemHiddenInput />",
          "  </SegmentedControl.Item>",
          '  <SegmentedControl.Item value="fill">',
          "    <SegmentedControl.ItemText>Fill</SegmentedControl.ItemText>",
          "    <SegmentedControl.ItemHiddenInput />",
          "  </SegmentedControl.Item>",
          "</SegmentedControl.Root>",
        ].join("\n"),
      },
    ],
    solid: [
      {
        title: "One value from a few options, with the sliding pill",
        code: [
          'import { SegmentedControl } from "@moderno-ui/solid";',
          "",
          '<SegmentedControl.Root defaultValue="fit" onValueChange={save} aria-label="Scale">',
          "  <SegmentedControl.Indicator />",
          '  <SegmentedControl.Item value="fit">',
          "    <SegmentedControl.ItemText>Fit</SegmentedControl.ItemText>",
          "    <SegmentedControl.ItemHiddenInput />",
          "  </SegmentedControl.Item>",
          '  <SegmentedControl.Item value="fill">',
          "    <SegmentedControl.ItemText>Fill</SegmentedControl.ItemText>",
          "    <SegmentedControl.ItemHiddenInput />",
          "  </SegmentedControl.Item>",
          "</SegmentedControl.Root>",
        ].join("\n"),
      },
    ],
  },
} satisfies ComponentDefinition;
