import { switchRecipe } from "@moderno-ui/core";
import type { ComponentDefinition } from "../component-definition.ts";

export default {
  name: "Switch",
  slug: "switch",
  scope: "switch",
  props: { file: "src/switch.tsx", type: "ModernoSwitchRootProps" },
  parts: [
    { name: "root" },
    { name: "control", description: "The track." },
    { name: "thumb", description: "The knob; slides to the far end when on." },
    { name: "label" },
  ],
  variants: switchRecipe.variants,
  examples: {
    react: [
      {
        title: "An on/off setting that applies at once",
        code: [
          'import { Switch } from "@moderno-ui/react";',
          "",
          "<Switch.Root defaultChecked onCheckedChange={save}>",
          "  <Switch.Control>",
          "    <Switch.Thumb />",
          "  </Switch.Control>",
          "  <Switch.Label>Email notifications</Switch.Label>",
          "  <Switch.HiddenInput />",
          "</Switch.Root>",
        ].join("\n"),
      },
    ],
    vue: [
      {
        title: "An on/off setting that applies at once",
        code: [
          '<script setup lang="ts">',
          'import { Switch } from "@moderno-ui/vue";',
          "</script>",
          "",
          "<template>",
          '  <Switch.Root default-checked @checked-change="save">',
          "    <Switch.Control>",
          "      <Switch.Thumb />",
          "    </Switch.Control>",
          "    <Switch.Label>Email notifications</Switch.Label>",
          "    <Switch.HiddenInput />",
          "  </Switch.Root>",
          "</template>",
        ].join("\n"),
      },
    ],
    svelte: [
      {
        title: "An on/off setting that applies at once",
        code: [
          '<script lang="ts">',
          '  import { Switch } from "@moderno-ui/svelte";',
          "</script>",
          "",
          "<Switch.Root defaultChecked onCheckedChange={save}>",
          "  <Switch.Control>",
          "    <Switch.Thumb />",
          "  </Switch.Control>",
          "  <Switch.Label>Email notifications</Switch.Label>",
          "  <Switch.HiddenInput />",
          "</Switch.Root>",
        ].join("\n"),
      },
    ],
    solid: [
      {
        title: "An on/off setting that applies at once",
        code: [
          'import { Switch } from "@moderno-ui/solid";',
          "",
          "<Switch.Root defaultChecked onCheckedChange={save}>",
          "  <Switch.Control>",
          "    <Switch.Thumb />",
          "  </Switch.Control>",
          "  <Switch.Label>Email notifications</Switch.Label>",
          "  <Switch.HiddenInput />",
          "</Switch.Root>",
        ].join("\n"),
      },
    ],
  },
} satisfies ComponentDefinition;
