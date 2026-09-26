<script lang="ts">
  import { RadioGroup } from "../../src/index.js";
  import type { RadioGroupSize, RadioGroupValueChangeDetails } from "../../src/index.js";

  let {
    size = undefined,
    orientation = undefined,
    disabled = false,
    invalid = false,
    defaultValue = undefined,
    onValueChange = undefined,
  }: {
    size?: RadioGroupSize;
    orientation?: "horizontal" | "vertical";
    disabled?: boolean;
    invalid?: boolean;
    defaultValue?: string;
    onValueChange?: (details: RadioGroupValueChangeDetails) => void;
  } = $props();

  const options = [
    { value: "standard", label: "Standard", description: "3–5 business days" },
    { value: "express", label: "Express", description: "1–2 business days" },
    { value: "pickup", label: "Pickup", description: "Closed this week", disabled: true },
  ];
</script>

<RadioGroup.Root
  {size}
  {orientation}
  {disabled}
  {invalid}
  {defaultValue}
  {onValueChange}
  name="shipping"
  class="shipping"
>
  <RadioGroup.Label>Shipping</RadioGroup.Label>
  {#each options as option (option.value)}
    <RadioGroup.Item value={option.value} disabled={option.disabled}>
      <RadioGroup.ItemControl />
      <RadioGroup.ItemText>
        {option.label}
        <RadioGroup.ItemDescription>{option.description}</RadioGroup.ItemDescription>
      </RadioGroup.ItemText>
      <RadioGroup.ItemHiddenInput />
    </RadioGroup.Item>
  {/each}
</RadioGroup.Root>
