/**
 * DatePicker — Ark's date-picker machine: the input's and trigger's
 * `aria-controls`, the grid's `aria-labelledby` and every cell come from
 * `useId`, and the days are laid out from a fixed month (so the server string
 * does not move with the clock). The recipe's size travels from the Root to
 * the Content through context. The calendar is rendered in place (no Portal),
 * so the closed grid reaches the server string and hydrates too; `open`
 * mounts the first picker open. The second is a range picker formatted for
 * German.
 */
import { DatePicker, parseDate } from "../../src/date-picker.js";
import type { Section } from "../section.js";

const DatePickerSection: Section = ({ open }) => (
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
              {(datePicker) => (
                <>
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
                        {datePicker.weekDays.map((weekDay, i) => (
                          <DatePicker.TableHeader key={i}>{weekDay.narrow}</DatePicker.TableHeader>
                        ))}
                      </DatePicker.TableRow>
                    </DatePicker.TableHead>
                    <DatePicker.TableBody>
                      {datePicker.weeks.map((week, i) => (
                        <DatePicker.TableRow key={i}>
                          {week.map((day, j) => (
                            <DatePicker.TableCell key={j} value={day}>
                              <DatePicker.TableCellTrigger>{day.day}</DatePicker.TableCellTrigger>
                            </DatePicker.TableCell>
                          ))}
                        </DatePicker.TableRow>
                      ))}
                    </DatePicker.TableBody>
                  </DatePicker.Table>
                </>
              )}
            </DatePicker.Context>
          </DatePicker.View>
          <DatePicker.View view="month">
            <DatePicker.Context>
              {(datePicker) => (
                <DatePicker.Table>
                  <DatePicker.TableBody>
                    {datePicker.getMonthsGrid({ columns: 4, format: "short" }).map((months, i) => (
                      <DatePicker.TableRow key={i}>
                        {months.map((month, j) => (
                          <DatePicker.TableCell key={j} value={month.value}>
                            <DatePicker.TableCellTrigger>{month.label}</DatePicker.TableCellTrigger>
                          </DatePicker.TableCell>
                        ))}
                      </DatePicker.TableRow>
                    ))}
                  </DatePicker.TableBody>
                </DatePicker.Table>
              )}
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
              {(datePicker) => (
                <DatePicker.Table>
                  <DatePicker.TableBody>
                    {datePicker.weeks.map((week, i) => (
                      <DatePicker.TableRow key={i}>
                        {week.map((day, j) => (
                          <DatePicker.TableCell key={j} value={day}>
                            <DatePicker.TableCellTrigger>{day.day}</DatePicker.TableCellTrigger>
                          </DatePicker.TableCell>
                        ))}
                      </DatePicker.TableRow>
                    ))}
                  </DatePicker.TableBody>
                </DatePicker.Table>
              )}
            </DatePicker.Context>
          </DatePicker.View>
        </DatePicker.Content>
      </DatePicker.Positioner>
    </DatePicker.Root>
  </section>
);

export default DatePickerSection;
