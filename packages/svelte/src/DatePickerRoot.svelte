<!--
  DatePicker.Root with the Moderno `size` recipe folded in. Ark's Root spreads
  unknown props onto its data-part="root" element, so the recipe's attribute
  sizes the label and the input box; the calendar usually renders in a Portal,
  outside the root, so the Root also hands the size to its Content through
  context. `value`, `open`, `view` and `focusedValue` stay bindable
  (`bind:value`, …), and `children` and every other prop pass straight through
  via `...rest`.
-->
<script lang="ts">
  import { DatePicker as ArkDatePicker } from "@ark-ui/svelte";
  import type { DatePickerRootProps } from "@ark-ui/svelte";
  import { datePickerRecipe, type DatePickerSize } from "@moderno-ui/core";
  import { setDatePickerSize } from "./date-picker-size.js";

  let {
    size,
    value = $bindable(),
    open = $bindable(),
    view = $bindable(),
    focusedValue = $bindable(),
    ...rest
  }: DatePickerRootProps & { size?: DatePickerSize } = $props();

  setDatePickerSize(() => size);
</script>

<ArkDatePicker.Root
  bind:value
  bind:open
  bind:view
  bind:focusedValue
  {...rest}
  {...datePickerRecipe({ size })}
/>
