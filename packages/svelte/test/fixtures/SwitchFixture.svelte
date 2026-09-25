<script lang="ts">
  import { Switch } from "../../src/index.js";
  import type { SwitchCheckedChangeDetails, SwitchSize } from "../../src/index.js";

  let {
    size = undefined,
    disabled = false,
    invalid = false,
    defaultChecked = false,
    inputRole = undefined,
    onCheckedChange = undefined,
  }: {
    size?: SwitchSize;
    disabled?: boolean;
    invalid?: boolean;
    defaultChecked?: boolean;
    inputRole?: string;
    onCheckedChange?: (details: SwitchCheckedChangeDetails) => void;
  } = $props();
</script>

<Switch.Root {size} {disabled} {invalid} {defaultChecked} {onCheckedChange} class="setting">
  <Switch.Control>
    <Switch.Thumb />
  </Switch.Control>
  <Switch.Label>Airplane mode</Switch.Label>
  <Switch.HiddenInput role={inputRole} />
</Switch.Root>
