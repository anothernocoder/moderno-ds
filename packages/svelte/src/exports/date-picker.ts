import { DatePicker as ArkDatePicker } from "@ark-ui/svelte";
import DatePickerRoot from "../DatePickerRoot.svelte";
import DatePickerContent from "../DatePickerContent.svelte";

/**
 * DatePicker — a date field with a calendar that opens under it. It picks one
 * date, several, or a range (`selectionMode="range"`), and formats and parses
 * dates for the `locale` it is given. Ark drives all of it: the open state,
 * keyboard moves through the grid, the day / month / year views, typing a
 * date in the input, `min` / `max` and unavailable dates. Values are
 * `DateValue`s; `parseDate("2024-05-01")` makes one. `Root` and `Content` are
 * wrapped for the `size` recipe; every other part is Ark's verbatim.
 * Annotated so the emitted `.d.ts` doesn't inline an un-nameable `@zag-js`
 * type (TS2742).
 */
export const DatePicker: Omit<typeof ArkDatePicker, "Root" | "Content"> & {
  Root: typeof DatePickerRoot;
  Content: typeof DatePickerContent;
} = {
  ...ArkDatePicker,
  Root: DatePickerRoot,
  Content: DatePickerContent,
};
export { parseDate } from "@ark-ui/svelte";
export type { DatePickerSize } from "@moderno-ui/core";
export type {
  DateValue,
  DatePickerDateView,
  DatePickerSelectionMode,
  DatePickerValueChangeDetails,
  DatePickerOpenChangeDetails,
  DatePickerViewChangeDetails,
  DatePickerFocusChangeDetails,
} from "@ark-ui/svelte";
