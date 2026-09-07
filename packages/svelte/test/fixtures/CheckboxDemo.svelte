<script lang="ts">
  import { Checkbox } from "../../src/index.js";
  import type { CheckboxCheckedChangeDetails, CheckboxCheckedState } from "../../src/index.js";
  import type { CheckboxSize } from "@moderno-ui/core";

  let {
    size = undefined,
    disabled = false,
    defaultChecked = false,
    onCheckedChange = undefined,
  }: {
    size?: CheckboxSize;
    disabled?: boolean;
    defaultChecked?: CheckboxCheckedState;
    onCheckedChange?: (details: CheckboxCheckedChangeDetails) => void;
  } = $props();
</script>

<Checkbox.Root {size} {disabled} {defaultChecked} {onCheckedChange}>
  <Checkbox.Control>
    <Checkbox.Indicator>✓</Checkbox.Indicator>
    <Checkbox.Indicator indeterminate>–</Checkbox.Indicator>
  </Checkbox.Control>
  <Checkbox.Label>Email me updates</Checkbox.Label>
  <Checkbox.HiddenInput />
</Checkbox.Root>
