/** @jsxImportSource solid-js */
import { Index } from "solid-js";
import { DatePicker, Portal } from "@moderno-ui/solid";

export function DatePickerLocaleDemo() {
  return (
    <DatePicker.Root locale="es-ES" startOfWeek={1}>
      <DatePicker.Label>Fecha de entrega</DatePicker.Label>
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
                {(datePicker) => (
                  <>
                    <DatePicker.ViewControl>
                      <DatePicker.PrevTrigger>‹</DatePicker.PrevTrigger>
                      <DatePicker.RangeText />
                      <DatePicker.NextTrigger>›</DatePicker.NextTrigger>
                    </DatePicker.ViewControl>
                    <DatePicker.Table>
                      <DatePicker.TableHead>
                        <DatePicker.TableRow>
                          <Index each={datePicker().weekDays}>
                            {(weekDay) => (
                              <DatePicker.TableHeader>{weekDay().short}</DatePicker.TableHeader>
                            )}
                          </Index>
                        </DatePicker.TableRow>
                      </DatePicker.TableHead>
                      <DatePicker.TableBody>
                        <Index each={datePicker().weeks}>
                          {(week) => (
                            <DatePicker.TableRow>
                              <Index each={week()}>
                                {(day) => (
                                  <DatePicker.TableCell value={day()}>
                                    <DatePicker.TableCellTrigger>
                                      {day().day}
                                    </DatePicker.TableCellTrigger>
                                  </DatePicker.TableCell>
                                )}
                              </Index>
                            </DatePicker.TableRow>
                          )}
                        </Index>
                      </DatePicker.TableBody>
                    </DatePicker.Table>
                  </>
                )}
              </DatePicker.Context>
            </DatePicker.View>
          </DatePicker.Content>
        </DatePicker.Positioner>
      </Portal>
    </DatePicker.Root>
  );
}
