<script lang="ts">
  import { NumberInput } from "../../src/index.js";
  import type { NumberInputSize, NumberInputValueChangeDetails } from "../../src/index.js";

  let {
    size = undefined,
    value = undefined,
    defaultValue = undefined,
    min = undefined,
    max = undefined,
    step = undefined,
    formatOptions = undefined,
    disabled = false,
    invalid = undefined,
    onValueChange = undefined,
  }: {
    size?: NumberInputSize;
    value?: string;
    defaultValue?: string;
    min?: number;
    max?: number;
    step?: number;
    formatOptions?: Intl.NumberFormatOptions;
    disabled?: boolean;
    invalid?: boolean;
    onValueChange?: (details: NumberInputValueChangeDetails) => void;
  } = $props();
</script>

<NumberInput.Root
  {size}
  {value}
  {defaultValue}
  {min}
  {max}
  {step}
  {formatOptions}
  {disabled}
  {invalid}
  {onValueChange}
  class="quantity"
>
  <NumberInput.Label>Quantity</NumberInput.Label>
  <NumberInput.Control>
    <NumberInput.Input />
    <NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger>
    <NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger>
  </NumberInput.Control>
</NumberInput.Root>
