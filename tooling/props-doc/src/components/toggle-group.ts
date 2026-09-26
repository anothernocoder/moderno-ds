import { toggleGroupRecipe } from "@moderno-ui/core";
import type { ComponentDefinition } from "../component-definition.ts";

export default {
  name: "ToggleGroup",
  slug: "toggle-group",
  scope: "toggle-group",
  props: { file: "src/toggle-group.tsx", type: "ModernoToggleGroupRootProps" },
  parts: [
    { name: "root", description: "Carries variant and size for every item." },
    { name: "item", description: "One native <button>; on or off." },
  ],
  variants: toggleGroupRecipe.variants,
  examples: {
    react: [
      {
        title: "One pressed item, or several with multiple",
        code: [
          'import { ToggleGroup } from "@moderno-ui/react";',
          "",
          '<ToggleGroup.Root defaultValue={["left"]} onValueChange={save} aria-label="Text alignment">',
          '  <ToggleGroup.Item value="left">Left</ToggleGroup.Item>',
          '  <ToggleGroup.Item value="center">Center</ToggleGroup.Item>',
          '  <ToggleGroup.Item value="right">Right</ToggleGroup.Item>',
          "</ToggleGroup.Root>",
          "",
          '<ToggleGroup.Root multiple variant="outline" aria-label="Text style">',
          '  <ToggleGroup.Item value="bold">Bold</ToggleGroup.Item>',
          '  <ToggleGroup.Item value="italic">Italic</ToggleGroup.Item>',
          "</ToggleGroup.Root>",
        ].join("\n"),
      },
    ],
    vue: [
      {
        title: "One pressed item, or several with multiple",
        code: [
          '<script setup lang="ts">',
          'import { ToggleGroup } from "@moderno-ui/vue";',
          "</script>",
          "",
          "<template>",
          '  <ToggleGroup.Root :default-value="[\'left\']" @value-change="save" aria-label="Text alignment">',
          '    <ToggleGroup.Item value="left">Left</ToggleGroup.Item>',
          '    <ToggleGroup.Item value="center">Center</ToggleGroup.Item>',
          '    <ToggleGroup.Item value="right">Right</ToggleGroup.Item>',
          "  </ToggleGroup.Root>",
          "",
          '  <ToggleGroup.Root multiple variant="outline" aria-label="Text style">',
          '    <ToggleGroup.Item value="bold">Bold</ToggleGroup.Item>',
          '    <ToggleGroup.Item value="italic">Italic</ToggleGroup.Item>',
          "  </ToggleGroup.Root>",
          "</template>",
        ].join("\n"),
      },
    ],
    svelte: [
      {
        title: "One pressed item, or several with multiple",
        code: [
          '<script lang="ts">',
          '  import { ToggleGroup } from "@moderno-ui/svelte";',
          "</script>",
          "",
          '<ToggleGroup.Root defaultValue={["left"]} onValueChange={save} aria-label="Text alignment">',
          '  <ToggleGroup.Item value="left">Left</ToggleGroup.Item>',
          '  <ToggleGroup.Item value="center">Center</ToggleGroup.Item>',
          '  <ToggleGroup.Item value="right">Right</ToggleGroup.Item>',
          "</ToggleGroup.Root>",
          "",
          '<ToggleGroup.Root multiple variant="outline" aria-label="Text style">',
          '  <ToggleGroup.Item value="bold">Bold</ToggleGroup.Item>',
          '  <ToggleGroup.Item value="italic">Italic</ToggleGroup.Item>',
          "</ToggleGroup.Root>",
        ].join("\n"),
      },
    ],
    solid: [
      {
        title: "One pressed item, or several with multiple",
        code: [
          'import { ToggleGroup } from "@moderno-ui/solid";',
          "",
          '<ToggleGroup.Root defaultValue={["left"]} onValueChange={save} aria-label="Text alignment">',
          '  <ToggleGroup.Item value="left">Left</ToggleGroup.Item>',
          '  <ToggleGroup.Item value="center">Center</ToggleGroup.Item>',
          '  <ToggleGroup.Item value="right">Right</ToggleGroup.Item>',
          "</ToggleGroup.Root>",
          "",
          '<ToggleGroup.Root multiple variant="outline" aria-label="Text style">',
          '  <ToggleGroup.Item value="bold">Bold</ToggleGroup.Item>',
          '  <ToggleGroup.Item value="italic">Italic</ToggleGroup.Item>',
          "</ToggleGroup.Root>",
        ].join("\n"),
      },
    ],
  },
} satisfies ComponentDefinition;
