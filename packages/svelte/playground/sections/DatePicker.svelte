<!--
  DatePicker — Ark's date-picker machine: the input's and trigger's
  aria-controls, the grid and every cell id, and the recipe's size travelling
  from the Root to the Content through context. The days are laid out from a
  fixed month, so the server string does not move with the clock. The
  calendar is rendered in place (no Portal), so the closed grid reaches the
  server string; `open` mounts the first picker open. The second is a range
  picker formatted for German.
-->
<script lang="ts">
  import { DatePicker, parseDate } from "../../src/exports/date-picker.js";
  import type { SectionProps } from "../section.js";

  let { open }: SectionProps = $props();
</script>

<section aria-label="date-picker">
  <DatePicker.Root defaultOpen={open} defaultFocusedValue={parseDate("2024-05-15")}>
    <DatePicker.Label>Due date</DatePicker.Label>
    <DatePicker.Control>
      <DatePicker.Input />
      <DatePicker.Trigger aria-label="Open calendar">▾</DatePicker.Trigger>
    </DatePicker.Control>
    <DatePicker.Positioner>
      <DatePicker.Content>
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
                <DatePicker.TableHead>
                  <DatePicker.TableRow>
                    {#each datePicker().weekDays as weekDay, i (i)}
                      <DatePicker.TableHeader>{weekDay.narrow}</DatePicker.TableHeader>
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
        <DatePicker.View view="month">
          <DatePicker.Context>
            {#snippet render(datePicker)}
              <DatePicker.Table>
                <DatePicker.TableBody>
                  {#each datePicker().getMonthsGrid({ columns: 4, format: "short" }) as months, i (i)}
                    <DatePicker.TableRow>
                      {#each months as month, j (j)}
                        <DatePicker.TableCell value={month.value}>
                          <DatePicker.TableCellTrigger>{month.label}</DatePicker.TableCellTrigger>
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
  <DatePicker.Root
    size="sm"
    selectionMode="range"
    locale="de-DE"
    defaultValue={[parseDate("2024-05-06"), parseDate("2024-05-10")]}
  >
    <DatePicker.Label>Trip</DatePicker.Label>
    <DatePicker.Control>
      <DatePicker.Input index={0} />
      <DatePicker.Input index={1} />
      <DatePicker.ClearTrigger aria-label="Clear">×</DatePicker.ClearTrigger>
    </DatePicker.Control>
    <DatePicker.Positioner>
      <DatePicker.Content>
        <DatePicker.View view="day">
          <DatePicker.Context>
            {#snippet render(datePicker)}
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
</section>
