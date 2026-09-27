<script lang="ts">
  import { DatePicker, Portal } from "@moderno-ui/svelte";
</script>

<DatePicker.Root>
  <DatePicker.Label>Due date</DatePicker.Label>
  <DatePicker.Control>
    <DatePicker.Input />
    <DatePicker.Trigger aria-label="Open calendar">
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    </DatePicker.Trigger>
  </DatePicker.Control>
  <Portal>
    <DatePicker.Positioner>
      <DatePicker.Content>
        <DatePicker.View view="day">
          <DatePicker.Context>
            {#snippet render(datePicker)}
              <DatePicker.ViewControl>
                <DatePicker.PrevTrigger>‹</DatePicker.PrevTrigger>
                <DatePicker.RangeText />
                <DatePicker.NextTrigger>›</DatePicker.NextTrigger>
              </DatePicker.ViewControl>
              <DatePicker.Table>
                <DatePicker.TableHead>
                  <DatePicker.TableRow>
                    {#each datePicker().weekDays as weekDay, i (i)}
                      <DatePicker.TableHeader>{weekDay.short}</DatePicker.TableHeader>
                    {/each}
                  </DatePicker.TableRow>
                </DatePicker.TableHead>
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
  </Portal>
</DatePicker.Root>
