<!--
  ColorPicker — Ark's color-picker machine behind one component. The
  trigger's and the thumbs' ids come from Ark; the popover is rendered in
  place (portalled={false}), so the closed area, sliders and hex box reach the
  server string; `open` mounts the first picker open. The second sits in a
  Field (its label names the trigger), with the alpha slider and preset
  swatches. The eyedropper waits for the browser, so neither server string
  has one.
-->
<script lang="ts">
  import { ColorPicker } from "../../src/exports/color-picker.js";
  import { Field } from "../../src/exports/field.js";
  import type { SectionProps } from "../section.js";

  let { open }: SectionProps = $props();
</script>

<section aria-label="color-picker">
  <ColorPicker defaultValue="#1E90FF" defaultOpen={open} portalled={false} />
  <Field.Root>
    <Field.Label>Brand color</Field.Label>
    <ColorPicker
      size="sm"
      alpha
      defaultValue="#1E90FF80"
      swatches={["#EF4444", "#22C55E", "#3B82F680"]}
      portalled={false}
    />
    <Field.HelperText>Used for buttons and links.</Field.HelperText>
  </Field.Root>
</section>
