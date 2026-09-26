import { calloutRecipe } from "@moderno-ui/core";
import type { ComponentDefinition } from "../component-definition.ts";

export default {
  name: "Callout",
  slug: "callout",
  scope: "callout",
  props: { file: "src/callout.tsx", type: "CalloutRootProps" },
  parts: [
    { name: "root", description: 'The note. `role="note"`; carries `data-variant`.' },
    { name: "icon", description: "Optional glyph slot; `aria-hidden`." },
    { name: "content" },
    { name: "title" },
    { name: "description" },
  ],
  variants: calloutRecipe.variants,
  examples: {
    react: [
      {
        title: "A warning note in the content",
        code: [
          'import { Callout } from "@moderno-ui/react";',
          "",
          '<Callout.Root variant="warning">',
          "  <Callout.Content>",
          "    <Callout.Title>Renaming breaks old links</Callout.Title>",
          "    <Callout.Description>Share the new address with your team.</Callout.Description>",
          "  </Callout.Content>",
          "</Callout.Root>",
        ].join("\n"),
      },
    ],
    vue: [
      {
        title: "A warning note in the content",
        code: [
          '<script setup lang="ts">',
          'import { Callout } from "@moderno-ui/vue";',
          "</script>",
          "",
          "<template>",
          '  <Callout.Root variant="warning">',
          "    <Callout.Content>",
          "      <Callout.Title>Renaming breaks old links</Callout.Title>",
          "      <Callout.Description>Share the new address with your team.</Callout.Description>",
          "    </Callout.Content>",
          "  </Callout.Root>",
          "</template>",
        ].join("\n"),
      },
    ],
    svelte: [
      {
        title: "A warning note in the content",
        code: [
          '<script lang="ts">',
          '  import { Callout } from "@moderno-ui/svelte";',
          "</script>",
          "",
          '<Callout.Root variant="warning">',
          "  <Callout.Content>",
          "    <Callout.Title>Renaming breaks old links</Callout.Title>",
          "    <Callout.Description>Share the new address with your team.</Callout.Description>",
          "  </Callout.Content>",
          "</Callout.Root>",
        ].join("\n"),
      },
    ],
    solid: [
      {
        title: "A warning note in the content",
        code: [
          'import { Callout } from "@moderno-ui/solid";',
          "",
          '<Callout.Root variant="warning">',
          "  <Callout.Content>",
          "    <Callout.Title>Renaming breaks old links</Callout.Title>",
          "    <Callout.Description>Share the new address with your team.</Callout.Description>",
          "  </Callout.Content>",
          "</Callout.Root>",
        ].join("\n"),
      },
    ],
  },
} satisfies ComponentDefinition;
