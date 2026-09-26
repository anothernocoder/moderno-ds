<script lang="ts">
  import { ToggleGroup } from "../../src/index.js";
  import type {
    ToggleGroupSize,
    ToggleGroupValueChangeDetails,
    ToggleGroupVariant,
  } from "../../src/index.js";

  let {
    variant = undefined,
    size = undefined,
    orientation = undefined,
    multiple = undefined,
    disabled = undefined,
    defaultValue = undefined,
    onValueChange = undefined,
  }: {
    variant?: ToggleGroupVariant;
    size?: ToggleGroupSize;
    orientation?: "horizontal" | "vertical";
    multiple?: boolean;
    disabled?: boolean;
    defaultValue?: string[];
    onValueChange?: (details: ToggleGroupValueChangeDetails) => void;
  } = $props();

  const items = [
    { value: "left", label: "Left" },
    { value: "center", label: "Center" },
    { value: "right", label: "Right", disabled: true },
  ];
</script>

<ToggleGroup.Root
  {variant}
  {size}
  {orientation}
  {multiple}
  {disabled}
  {defaultValue}
  {onValueChange}
  aria-label="Text alignment"
  class="alignment"
>
  {#each items as item (item.value)}
    <ToggleGroup.Item value={item.value} disabled={item.disabled}>{item.label}</ToggleGroup.Item>
  {/each}
</ToggleGroup.Root>
