import { badgeRecipe } from "@moderno-ui/core";
import type { ComponentDefinition } from "../component-definition.ts";

export default {
  name: "Badge",
  slug: "badge",
  scope: "badge",
  props: { file: "src/badge.tsx", type: "BadgeProps" },
  parts: [{ name: "root" }, { name: "dot", description: "Rendered only with `dot`." }],
  variants: badgeRecipe.variants,
  examples: {
    react: [
      {
        title: "Status badges, one with a dot",
        code: [
          'import { Badge } from "@moderno-ui/react";',
          "",
          "<Badge>Draft</Badge>",
          '<Badge variant="success" dot>Paid</Badge>',
          '<Badge variant="error" size="sm">Overdue</Badge>',
        ].join("\n"),
      },
    ],
    vue: [
      {
        title: "Status badges, one with a dot",
        code: [
          '<script setup lang="ts">',
          'import { Badge } from "@moderno-ui/vue";',
          "</script>",
          "",
          "<template>",
          "  <Badge>Draft</Badge>",
          '  <Badge variant="success" dot>Paid</Badge>',
          '  <Badge variant="error" size="sm">Overdue</Badge>',
          "</template>",
        ].join("\n"),
      },
    ],
    svelte: [
      {
        title: "Status badges, one with a dot",
        code: [
          '<script lang="ts">',
          '  import { Badge } from "@moderno-ui/svelte";',
          "</script>",
          "",
          "<Badge>Draft</Badge>",
          '<Badge variant="success" dot>Paid</Badge>',
          '<Badge variant="error" size="sm">Overdue</Badge>',
        ].join("\n"),
      },
    ],
    solid: [
      {
        title: "Status badges, one with a dot",
        code: [
          'import { Badge } from "@moderno-ui/solid";',
          "",
          "<Badge>Draft</Badge>",
          '<Badge variant="success" dot>Paid</Badge>',
          '<Badge variant="error" size="sm">Overdue</Badge>',
        ].join("\n"),
      },
    ],
  },
} satisfies ComponentDefinition;
