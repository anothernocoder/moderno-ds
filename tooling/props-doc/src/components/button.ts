import { buttonRecipe } from "@moderno-ui/core";
import type { ComponentDefinition } from "../component-definition.ts";

export default {
  name: "Button",
  slug: "button",
  scope: "button",
  props: { file: "src/button.tsx", type: "ButtonProps" },
  parts: [{ name: "root" }],
  variants: buttonRecipe.variants,
  examples: {
    react: [
      {
        title: "Primary and outline",
        code: [
          'import { Button } from "@moderno-ui/react";',
          "",
          '<Button variant="primary">Save</Button>',
          '<Button variant="outline">Cancel</Button>',
        ].join("\n"),
      },
    ],
    vue: [
      {
        title: "Primary and outline",
        code: [
          '<script setup lang="ts">',
          'import { Button } from "@moderno-ui/vue";',
          "</script>",
          "",
          "<template>",
          '  <Button variant="primary">Save</Button>',
          '  <Button variant="outline">Cancel</Button>',
          "</template>",
        ].join("\n"),
      },
    ],
    svelte: [
      {
        title: "Primary and outline",
        code: [
          '<script lang="ts">',
          '  import { Button } from "@moderno-ui/svelte";',
          "</script>",
          "",
          '<Button variant="primary">Save</Button>',
          '<Button variant="outline">Cancel</Button>',
        ].join("\n"),
      },
    ],
    solid: [
      {
        title: "Primary and outline",
        code: [
          'import { Button } from "@moderno-ui/solid";',
          "",
          '<Button variant="primary">Save</Button>',
          '<Button variant="outline">Cancel</Button>',
        ].join("\n"),
      },
    ],
  },
} satisfies ComponentDefinition;
