<!--
  DatePicker.Content with the recipe's data-size from its Root, so
  components.css sets the calendar's density from it. `children` and every
  other prop pass straight through.
-->
<script lang="ts">
  import { DatePicker as ArkDatePicker } from "@ark-ui/svelte";
  import type { DatePickerContentProps } from "@ark-ui/svelte";
  import { datePickerRecipe } from "@moderno-ui/core";
  import { getDatePickerSize } from "./date-picker-size.js";

  let props: DatePickerContentProps = $props();

  const size = getDatePickerSize();
</script>

<ArkDatePicker.Content {...props} {...datePickerRecipe({ size: size() })} />
