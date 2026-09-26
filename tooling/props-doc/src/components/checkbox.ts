import { checkboxRecipe } from "@moderno-ui/core";
import type { ComponentDefinition } from "../component-definition.ts";

export default {
  name: "Checkbox",
  slug: "checkbox",
  scope: "checkbox",
  props: { file: "src/checkbox.tsx", type: "ModernoCheckboxRootProps" },
  parts: [{ name: "root" }, { name: "control" }, { name: "indicator" }, { name: "label" }],
  variants: checkboxRecipe.variants,
  examples: {
    react: [
      {
        title: "Labelled checkbox with an indeterminate state",
        code: [
          'import { Checkbox } from "@moderno-ui/react";',
          "",
          '<Checkbox.Root size="md" defaultChecked="indeterminate">',
          "  <Checkbox.Control>",
          "    <Checkbox.Indicator>✓</Checkbox.Indicator>",
          "    <Checkbox.Indicator indeterminate>–</Checkbox.Indicator>",
          "  </Checkbox.Control>",
          "  <Checkbox.Label>Email me updates</Checkbox.Label>",
          "  <Checkbox.HiddenInput />",
          "</Checkbox.Root>",
        ].join("\n"),
      },
    ],
    vue: [
      {
        title: "Labelled checkbox with an indeterminate state",
        code: [
          '<script setup lang="ts">',
          'import { Checkbox } from "@moderno-ui/vue";',
          "</script>",
          "",
          "<template>",
          '  <Checkbox.Root size="md" default-checked="indeterminate">',
          "    <Checkbox.Control>",
          "      <Checkbox.Indicator>✓</Checkbox.Indicator>",
          "      <Checkbox.Indicator indeterminate>–</Checkbox.Indicator>",
          "    </Checkbox.Control>",
          "    <Checkbox.Label>Email me updates</Checkbox.Label>",
          "    <Checkbox.HiddenInput />",
          "  </Checkbox.Root>",
          "</template>",
        ].join("\n"),
      },
    ],
    svelte: [
      {
        title: "Labelled checkbox with an indeterminate state",
        code: [
          '<script lang="ts">',
          '  import { Checkbox } from "@moderno-ui/svelte";',
          "</script>",
          "",
          '<Checkbox.Root size="md" defaultChecked="indeterminate">',
          "  <Checkbox.Control>",
          "    <Checkbox.Indicator>✓</Checkbox.Indicator>",
          "    <Checkbox.Indicator indeterminate>–</Checkbox.Indicator>",
          "  </Checkbox.Control>",
          "  <Checkbox.Label>Email me updates</Checkbox.Label>",
          "  <Checkbox.HiddenInput />",
          "</Checkbox.Root>",
        ].join("\n"),
      },
    ],
    solid: [
      {
        title: "Labelled checkbox with an indeterminate state",
        code: [
          'import { Checkbox } from "@moderno-ui/solid";',
          "",
          "function SubscribeCheckbox() {",
          "  return (",
          '    <Checkbox.Root size="md" defaultChecked="indeterminate">',
          "      <Checkbox.Control>",
          "        <Checkbox.Indicator>✓</Checkbox.Indicator>",
          "        <Checkbox.Indicator indeterminate>–</Checkbox.Indicator>",
          "      </Checkbox.Control>",
          "      <Checkbox.Label>Email me updates</Checkbox.Label>",
          "      <Checkbox.HiddenInput />",
          "    </Checkbox.Root>",
          "  );",
          "}",
        ].join("\n"),
      },
    ],
  },
} satisfies ComponentDefinition;
