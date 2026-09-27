import { DatePicker, Portal, type DatePickerSize } from "@moderno-ui/react";

const sizes: { size: DatePickerSize; label: string }[] = [
  { size: "sm", label: "Small" },
  { size: "md", label: "Medium" },
  { size: "lg", label: "Large" },
];

export function DatePickerSizesDemo() {
  return (
    <div className="demo-stack">
      {sizes.map(({ size, label }) => (
        <DatePicker.Root key={size} size={size}>
          <DatePicker.Label>{label}</DatePicker.Label>
          <DatePicker.Control>
            <DatePicker.Input />
            <DatePicker.Trigger aria-label="Open calendar">
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
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
                              {datePicker.weekDays.map((weekDay, i) => (
                                <DatePicker.TableHeader key={i}>
                                  {weekDay.short}
                                </DatePicker.TableHeader>
                              ))}
                            </DatePicker.TableRow>
                          </DatePicker.TableHead>
                          <DatePicker.TableBody>
                            {datePicker.weeks.map((week, i) => (
                              <DatePicker.TableRow key={i}>
                                {week.map((day, j) => (
                                  <DatePicker.TableCell key={j} value={day}>
                                    <DatePicker.TableCellTrigger>
                                      {day.day}
                                    </DatePicker.TableCellTrigger>
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
              </DatePicker.Content>
            </DatePicker.Positioner>
          </Portal>
        </DatePicker.Root>
      ))}
    </div>
  );
}
