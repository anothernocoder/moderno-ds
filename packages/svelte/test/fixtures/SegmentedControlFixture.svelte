<script lang="ts">
  import { SegmentedControl } from "../../src/index.js";
  import type {
    SegmentedControlSize,
    SegmentedControlValueChangeDetails,
  } from "../../src/index.js";

  let {
    size = undefined,
    fullWidth = undefined,
    disabled = undefined,
    defaultValue = undefined,
    value = $bindable(),
    onValueChange = undefined,
  }: {
    size?: SegmentedControlSize;
    fullWidth?: boolean;
    disabled?: boolean;
    defaultValue?: string;
    value?: string | null;
    onValueChange?: (details: SegmentedControlValueChangeDetails) => void;
  } = $props();

  const options = [
    { value: "fit", label: "Fit" },
    { value: "fill", label: "Fill" },
    { value: "stretch", label: "Stretch", disabled: true },
  ];
</script>

<SegmentedControl.Root
  {size}
  {fullWidth}
  {disabled}
  {defaultValue}
  bind:value
  {onValueChange}
  name="scale"
  aria-label="Scale"
  class="scale"
>
  <SegmentedControl.Indicator />
  {#each options as option (option.value)}
    <SegmentedControl.Item value={option.value} disabled={option.disabled}>
      <SegmentedControl.ItemText>{option.label}</SegmentedControl.ItemText>
      <SegmentedControl.ItemHiddenInput />
    </SegmentedControl.Item>
  {/each}
</SegmentedControl.Root>
<output>{value}</output>
