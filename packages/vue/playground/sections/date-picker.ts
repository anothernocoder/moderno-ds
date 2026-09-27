/**
 * DatePicker — Ark's date-picker machine: the input's and trigger's
 * `aria-controls`, the grid's `aria-labelledby` and every cell id, and the
 * recipe's size travelling from the Root to the Content through
 * provide/inject. The days are laid out from a fixed month, so the server
 * string does not move with the clock. The calendar is rendered in place (no
 * Portal), so the closed grid reaches the server string and hydrates too;
 * `open` mounts the first picker open. The second is a range picker formatted
 * for German.
 */
import { h, type UnwrapRef } from "vue";
import type { UseDatePickerContext } from "@ark-ui/vue";
import { DatePicker, parseDate } from "../../src/date-picker.js";
import type { Section } from "../section.js";

/** What Ark's DatePicker.Context hands its slot. */
type DatePickerApi = UnwrapRef<UseDatePickerContext>;

// The day grid of the visible month, from Ark's Context.
const dayTable = (datePicker: DatePickerApi, withHead: boolean) =>
  h(DatePicker.Table, {}, () => [
    withHead
      ? h(DatePicker.TableHead, {}, () =>
          h(DatePicker.TableRow, {}, () =>
            datePicker.weekDays.map((weekDay, i) =>
              h(DatePicker.TableHeader, { key: i }, () => weekDay.narrow),
            ),
          ),
        )
      : null,
    h(DatePicker.TableBody, {}, () =>
      datePicker.weeks.map((week, i) =>
        h(DatePicker.TableRow, { key: i }, () =>
          week.map((day, j) =>
            h(DatePicker.TableCell, { key: j, value: day }, () =>
              h(DatePicker.TableCellTrigger, {}, () => String(day.day)),
            ),
          ),
        ),
      ),
    ),
  ]);

const monthTable = (datePicker: DatePickerApi) =>
  h(DatePicker.Table, {}, () =>
    h(DatePicker.TableBody, {}, () =>
      datePicker
        .getMonthsGrid({ columns: 4, format: "short" })
        .map((months, i) =>
          h(DatePicker.TableRow, { key: i }, () =>
            months.map((month, j) =>
              h(DatePicker.TableCell, { key: j, value: month.value }, () =>
                h(DatePicker.TableCellTrigger, {}, () => month.label),
              ),
            ),
          ),
        ),
    ),
  );

const DatePickerSection: Section = ({ open }) =>
  h("section", { "aria-label": "date-picker" }, [
    h(DatePicker.Root, { defaultOpen: open, defaultFocusedValue: parseDate("2024-05-15") }, () => [
      h(DatePicker.Label, {}, () => "Due date"),
      h(DatePicker.Control, {}, () => [
        h(DatePicker.Input),
        h(DatePicker.Trigger, { "aria-label": "Open calendar" }, () => "▾"),
      ]),
      h(DatePicker.Positioner, {}, () =>
        h(DatePicker.Content, {}, () => [
          h(DatePicker.View, { view: "day" }, () =>
            h(DatePicker.Context, null, {
              default: (datePicker: DatePickerApi) => [
                h(DatePicker.ViewControl, {}, () => [
                  h(DatePicker.PrevTrigger, {}, () => "‹"),
                  h(DatePicker.ViewTrigger, {}, () => h(DatePicker.RangeText)),
                  h(DatePicker.NextTrigger, {}, () => "›"),
                ]),
                dayTable(datePicker, true),
              ],
            }),
          ),
          h(DatePicker.View, { view: "month" }, () =>
            h(DatePicker.Context, null, {
              default: (datePicker: DatePickerApi) => monthTable(datePicker),
            }),
          ),
        ]),
      ),
    ]),
    h(
      DatePicker.Root,
      {
        size: "sm",
        selectionMode: "range",
        locale: "de-DE",
        defaultValue: [parseDate("2024-05-06"), parseDate("2024-05-10")],
      },
      () => [
        h(DatePicker.Label, {}, () => "Trip"),
        h(DatePicker.Control, {}, () => [
          h(DatePicker.Input, { index: 0 }),
          h(DatePicker.Input, { index: 1 }),
          h(DatePicker.ClearTrigger, { "aria-label": "Clear" }, () => "×"),
        ]),
        h(DatePicker.Positioner, {}, () =>
          h(DatePicker.Content, {}, () =>
            h(DatePicker.View, { view: "day" }, () =>
              h(DatePicker.Context, null, {
                default: (datePicker: DatePickerApi) => dayTable(datePicker, false),
              }),
            ),
          ),
        ),
      ],
    ),
  ]);

export default DatePickerSection;
