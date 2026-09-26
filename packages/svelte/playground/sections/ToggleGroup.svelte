<!--
  ToggleGroup — Ark's toggle-group machine on native buttons; the pressed
  state (aria-checked, aria-pressed, data-state), the group's role and
  orientation, and the disabled buttons reach the server string.
-->
<script lang="ts">
  import { ToggleGroup } from "../../src/exports/toggle-group.js";
  import type { SectionProps } from "../section.js";

  let {}: SectionProps = $props();
</script>

<section aria-label="toggle groups">
  <ToggleGroup.Root defaultValue={["center"]} aria-label="Text alignment">
    <ToggleGroup.Item value="left">Left</ToggleGroup.Item>
    <ToggleGroup.Item value="center">Center</ToggleGroup.Item>
  </ToggleGroup.Root>
  <ToggleGroup.Root
    variant="outline"
    size="lg"
    orientation="vertical"
    multiple
    disabled
    aria-label="Text style"
  >
    <ToggleGroup.Item value="bold">Bold</ToggleGroup.Item>
    <ToggleGroup.Item value="italic">Italic</ToggleGroup.Item>
  </ToggleGroup.Root>
</section>
