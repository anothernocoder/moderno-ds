import { chipRecipe } from "@moderno-ui/core";
import type { ComponentDefinition } from "../component-definition.ts";

export default {
  name: "Chip",
  slug: "chip",
  scope: "chip",
  props: { file: "src/chip.tsx", type: "ChipProps" },
  parts: [
    { name: "root" },
    { name: "label" },
    { name: "remove-trigger", description: "Rendered only with `removable`." },
  ],
  variants: chipRecipe.variants,
  examples: {
    react: [
      {
        title: "A removable chip that leaves the list",
        code: [
          'import { Chip } from "@moderno-ui/react";',
          "",
          "{tags.map((tag) => (",
          "  <Chip key={tag} removable removeLabel={`Remove ${tag}`} onRemove={() => remove(tag)}>",
          "    {tag}",
          "  </Chip>",
          "))}",
        ].join("\n"),
      },
    ],
    vue: [
      {
        title: "A removable chip that leaves the list",
        code: [
          '<script setup lang="ts">',
          'import { Chip } from "@moderno-ui/vue";',
          "</script>",
          "",
          "<template>",
          "  <Chip",
          '    v-for="tag in tags"',
          '    :key="tag"',
          "    removable",
          '    :remove-label="`Remove ${tag}`"',
          '    @remove="remove(tag)"',
          "  >",
          "    {{ tag }}",
          "  </Chip>",
          "</template>",
        ].join("\n"),
      },
    ],
    svelte: [
      {
        title: "A removable chip that leaves the list",
        code: [
          '<script lang="ts">',
          '  import { Chip } from "@moderno-ui/svelte";',
          "</script>",
          "",
          "{#each tags as tag (tag)}",
          "  <Chip removable removeLabel={`Remove ${tag}`} onRemove={() => remove(tag)}>{tag}</Chip>",
          "{/each}",
        ].join("\n"),
      },
    ],
    solid: [
      {
        title: "A removable chip that leaves the list",
        code: [
          'import { For } from "solid-js";',
          'import { Chip } from "@moderno-ui/solid";',
          "",
          "<For each={tags()}>",
          "  {(tag) => (",
          "    <Chip removable removeLabel={`Remove ${tag}`} onRemove={() => remove(tag)}>",
          "      {tag}",
          "    </Chip>",
          "  )}",
          "</For>",
        ].join("\n"),
      },
    ],
  },
} satisfies ComponentDefinition;
