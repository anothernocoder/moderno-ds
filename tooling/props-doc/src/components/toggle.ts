import { toggleRecipe } from "@moderno-ui/core";
import type { ComponentDefinition } from "../component-definition.ts";

export default {
  name: "Toggle",
  slug: "toggle",
  scope: "toggle",
  props: { file: "src/toggle.tsx", type: "ModernoToggleRootProps" },
  parts: [
    { name: "root", description: "A native <button> that stays pressed; aria-pressed." },
    {
      name: "indicator",
      description: "Optional; shows its children while on and its fallback while off.",
    },
  ],
  variants: toggleRecipe.variants,
  examples: {
    react: [
      {
        title: "A button that stays pressed, with an on/off indicator",
        code: [
          'import { Toggle } from "@moderno-ui/react";',
          "",
          "<Toggle.Root defaultPressed onPressedChange={save}>",
          '  <Toggle.Indicator fallback="☆">★</Toggle.Indicator>',
          "  Favorite",
          "</Toggle.Root>",
        ].join("\n"),
      },
    ],
    vue: [
      {
        title: "A button that stays pressed, with an on/off indicator",
        code: [
          '<script setup lang="ts">',
          'import { Toggle } from "@moderno-ui/vue";',
          "</script>",
          "",
          "<template>",
          '  <Toggle.Root default-pressed @pressed-change="save">',
          "    <Toggle.Indicator>",
          "      ★",
          "      <template #fallback>☆</template>",
          "    </Toggle.Indicator>",
          "    Favorite",
          "  </Toggle.Root>",
          "</template>",
        ].join("\n"),
      },
    ],
    svelte: [
      {
        title: "A button that stays pressed, with an on/off indicator",
        code: [
          '<script lang="ts">',
          '  import { Toggle } from "@moderno-ui/svelte";',
          "</script>",
          "",
          "<Toggle.Root defaultPressed onPressedChange={save}>",
          "  <Toggle.Indicator>",
          "    {#snippet fallback()}☆{/snippet}",
          "    ★",
          "  </Toggle.Indicator>",
          "  Favorite",
          "</Toggle.Root>",
        ].join("\n"),
      },
    ],
    solid: [
      {
        title: "A button that stays pressed, with an on/off indicator",
        code: [
          'import { Toggle } from "@moderno-ui/solid";',
          "",
          "<Toggle.Root defaultPressed onPressedChange={save}>",
          '  <Toggle.Indicator fallback="☆">★</Toggle.Indicator>',
          "  Favorite",
          "</Toggle.Root>",
        ].join("\n"),
      },
    ],
  },
} satisfies ComponentDefinition;
