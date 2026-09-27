<script lang="ts">
  import { DatePicker, parseDate } from "../../src/index.js";
  import type {
    DatePickerSize,
    DatePickerValueChangeDetails,
    DateValue,
  } from "../../src/index.js";

  let {
    size = undefined,
    selectionMode = undefined,
    locale = undefined,
    value = $bindable(),
    onValueChange = undefined,
  }: {
    size?: DatePickerSize;
    selectionMode?: "single" | "range";
    locale?: string;
    value?: DateValue[];
    onValueChange?: (details: DatePickerValueChangeDetails) => void;
  } = $props();
</script>

<DatePicker.Root
  {size}
  {selectionMode}
  {locale}
  bind:value
  {onValueChange}
  defaultFocusedValue={parseDate("2024-05-15")}
  class="due"
  data-testid="root"
>
  <DatePicker.Label>Due date</DatePicker.Label>
  <DatePicker.Control>
    <DatePicker.Input index={0} />
    {#if selectionMode === "range"}
      <DatePicker.Input index={1} />
    {/if}
    <DatePicker.Trigger aria-label="Open calendar">▾</DatePicker.Trigger>
  </DatePicker.Control>
  <DatePicker.Positioner>
    <DatePicker.Content data-testid="content">
      <DatePicker.View view="day">
        <DatePicker.Context>
          {#snippet render(datePicker)}
            <DatePicker.ViewControl>
              <DatePicker.PrevTrigger>‹</DatePicker.PrevTrigger>
              <DatePicker.ViewTrigger>
                <DatePicker.RangeText />
              </DatePicker.ViewTrigger>
              <DatePicker.NextTrigger>›</DatePicker.NextTrigger>
            </DatePicker.ViewControl>
            <DatePicker.Table>
              <DatePicker.TableBody>
                {#each datePicker().weeks as week, i (i)}
                  <DatePicker.TableRow>
                    {#each week as day, j (j)}
                      <DatePicker.TableCell value={day}>
                        <DatePicker.TableCellTrigger>{day.day}</DatePicker.TableCellTrigger>
                      </DatePicker.TableCell>
                    {/each}
                  </DatePicker.TableRow>
                {/each}
              </DatePicker.TableBody>
            </DatePicker.Table>
          {/snippet}
        </DatePicker.Context>
      </DatePicker.View>
    </DatePicker.Content>
  </DatePicker.Positioner>
</DatePicker.Root>
<output data-testid="picked">{value?.map(String).join(",")}</output>
<button type="button" onclick={() => (value = [parseDate("2024-05-30")])}>End of month</button>
