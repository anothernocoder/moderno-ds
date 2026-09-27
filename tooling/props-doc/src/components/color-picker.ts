import { colorPickerRecipe } from "@moderno-ui/core";
import type { ComponentDefinition } from "../component-definition.ts";

export default {
  name: "ColorPicker",
  slug: "color-picker",
  scope: "color-picker",
  props: { file: "src/color-picker.tsx", type: "ColorPickerProps" },
  parts: [
    { name: "root", description: "Carries size; holds the trigger and the popover." },
    { name: "control", description: "Holds the trigger." },
    {
      name: "trigger",
      description: "The button that opens the popover; shows the swatch and hex.",
    },
    { name: "swatch", description: "A colour chip, over a checkerboard when see-through." },
    { name: "value-text", description: "The current colour as hex, in the trigger." },
    { name: "positioner", description: "Placed by Ark under the trigger; never style its layout." },
    { name: "content", description: 'The popover surface, role="dialog".' },
    { name: "area", description: "The saturation (across) and brightness (up) area." },
    { name: "area-background", description: "The area's gradients, painted by Ark." },
    {
      name: "area-thumb",
      description: 'The area\'s 2D slider, named "Saturation and brightness".',
    },
    {
      name: "channel-slider",
      description: 'One slider; data-channel="hue", or "alpha" with the alpha prop.',
    },
    { name: "channel-slider-track", description: "The slider's gradient, painted by Ark." },
    { name: "channel-slider-thumb", description: 'The slider\'s thumb, named "Hue" or "Alpha".' },
    { name: "hex-input", description: "The hex text box; commits on Enter or blur." },
    {
      name: "eye-dropper-trigger",
      description: "Picks a colour from the screen. Only where the browser has an EyeDropper.",
    },
    { name: "swatch-group", description: "The preset swatches, with the swatches prop." },
    {
      name: "swatch-trigger",
      description: 'One preset; data-state="checked" when it is the value.',
    },
  ],
  variants: colorPickerRecipe.variants,
  examples: {
    react: [
      {
        title: "A brand colour in a form field",
        code: [
          'import { ColorPicker, Field } from "@moderno-ui/react";',
          "",
          "<Field.Root>",
          "  <Field.Label>Brand color</Field.Label>",
          "  <ColorPicker value={color} onValueChange={(details) => setColor(details.value)} />",
          "  <Field.HelperText>Used for buttons and links.</Field.HelperText>",
          "</Field.Root>",
        ].join("\n"),
      },
      {
        title: "A see-through colour with preset swatches",
        code: [
          'import { ColorPicker } from "@moderno-ui/react";',
          "",
          '<ColorPicker alpha defaultValue="#1E90FF80" swatches={["#EF4444", "#22C55E", "#3B82F6"]} />',
        ].join("\n"),
      },
    ],
    vue: [
      {
        title: "A brand colour in a form field",
        code: [
          '<script setup lang="ts">',
          'import { ref } from "vue";',
          'import { ColorPicker, Field } from "@moderno-ui/vue";',
          "",
          'const color = ref("#1E90FF");',
          "</script>",
          "",
          "<template>",
          "  <Field.Root>",
          "    <Field.Label>Brand color</Field.Label>",
          '    <ColorPicker v-model="color" />',
          "    <Field.HelperText>Used for buttons and links.</Field.HelperText>",
          "  </Field.Root>",
          "</template>",
        ].join("\n"),
      },
      {
        title: "A see-through colour with preset swatches",
        code: [
          '<script setup lang="ts">',
          'import { ColorPicker } from "@moderno-ui/vue";',
          "</script>",
          "",
          "<template>",
          "  <ColorPicker alpha default-value=\"#1E90FF80\" :swatches=\"['#EF4444', '#22C55E', '#3B82F6']\" />",
          "</template>",
        ].join("\n"),
      },
    ],
    svelte: [
      {
        title: "A brand colour in a form field",
        code: [
          '<script lang="ts">',
          '  import { ColorPicker, Field } from "@moderno-ui/svelte";',
          "",
          '  let color = $state("#1E90FF");',
          "</script>",
          "",
          "<Field.Root>",
          "  <Field.Label>Brand color</Field.Label>",
          "  <ColorPicker bind:value={color} />",
          "  <Field.HelperText>Used for buttons and links.</Field.HelperText>",
          "</Field.Root>",
        ].join("\n"),
      },
      {
        title: "A see-through colour with preset swatches",
        code: [
          '<script lang="ts">',
          '  import { ColorPicker } from "@moderno-ui/svelte";',
          "</script>",
          "",
          '<ColorPicker alpha defaultValue="#1E90FF80" swatches={["#EF4444", "#22C55E", "#3B82F6"]} />',
        ].join("\n"),
      },
    ],
    solid: [
      {
        title: "A brand colour in a form field",
        code: [
          'import { createSignal } from "solid-js";',
          'import { ColorPicker, Field } from "@moderno-ui/solid";',
          "",
          'const [color, setColor] = createSignal("#1E90FF");',
          "",
          "<Field.Root>",
          "  <Field.Label>Brand color</Field.Label>",
          "  <ColorPicker value={color()} onValueChange={(details) => setColor(details.value)} />",
          "  <Field.HelperText>Used for buttons and links.</Field.HelperText>",
          "</Field.Root>",
        ].join("\n"),
      },
      {
        title: "A see-through colour with preset swatches",
        code: [
          'import { ColorPicker } from "@moderno-ui/solid";',
          "",
          '<ColorPicker alpha defaultValue="#1E90FF80" swatches={["#EF4444", "#22C55E", "#3B82F6"]} />',
        ].join("\n"),
      },
    ],
  },
} satisfies ComponentDefinition;
