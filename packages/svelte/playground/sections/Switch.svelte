<!--
  Switch — the label ↔ hidden-input pairing, with the on/off state and the
  switch role on the server string.
-->
<script lang="ts">
  import { Switch } from "../../src/exports/switch.js";
  import type { SectionProps } from "../section.js";

  let {}: SectionProps = $props();
</script>

<section aria-label="switches">
  <Switch.Root defaultChecked>
    <Switch.Control>
      <Switch.Thumb />
    </Switch.Control>
    <Switch.Label>Airplane mode</Switch.Label>
    <Switch.HiddenInput />
  </Switch.Root>
  <Switch.Root size="sm" disabled>
    <Switch.Control>
      <Switch.Thumb />
    </Switch.Control>
    <Switch.Label>Bluetooth</Switch.Label>
    <Switch.HiddenInput />
  </Switch.Root>
</section>
