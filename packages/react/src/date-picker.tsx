import { createContext, useContext } from "react";
import { DatePicker as ArkDatePicker } from "@ark-ui/react";
import type { DatePickerContentProps, DatePickerRootProps } from "@ark-ui/react";
import { datePickerRecipe, type DatePickerSize } from "@moderno-ui/core";

export type { DatePickerSize } from "@moderno-ui/core";

export interface ModernoDatePickerRootProps extends DatePickerRootProps {
  /** Input height, day size and type — resolves to `data-size` on the root and the content. */
  size?: DatePickerSize;
}

/** The size of the nearest DatePicker.Root, for the calendar in its Portal. */
const DatePickerSizeContext = createContext<DatePickerSize | undefined>(undefined);

/**
 * DatePicker.Root with the Moderno `size` recipe folded in. Ark's Root spreads
 * unknown props onto its `data-part="root"` element, so the recipe's attribute
 * sizes the label and the input box. The calendar usually renders in a
 * Portal, outside the root, so the size also travels down a context to the
 * content.
 */
function DatePickerRoot({ size, ...props }: ModernoDatePickerRootProps) {
  return (
    <DatePickerSizeContext.Provider value={size}>
      <ArkDatePicker.Root {...props} {...datePickerRecipe({ size })} />
    </DatePickerSizeContext.Provider>
  );
}

/** DatePicker.Content with the picker's `data-size`, for the calendar's density. */
function DatePickerContent(props: DatePickerContentProps) {
  return (
    <ArkDatePicker.Content
      {...props}
      {...datePickerRecipe({ size: useContext(DatePickerSizeContext) })}
    />
  );
}

/**
 * DatePicker — a date field with a calendar that opens under it. It picks one
 * date, several, or a range (`selectionMode="range"`), and formats and parses
 * dates for the `locale` it is given.
 *
 * Ark drives the machine: the open state, keyboard moves through the grid,
 * the day / month / year views, typing a date in the input, `min` / `max` and
 * unavailable dates. Values are `DateValue`s from `@internationalized/date`;
 * `parseDate("2024-05-01")` makes one. Anatomy: `Root > Label + Control >
 * Input + Trigger (+ ClearTrigger)`, then `Positioner > Content > View* >
 * ViewControl (PrevTrigger, ViewTrigger > RangeText, NextTrigger) + Table >
 * TableHead > TableRow > TableHeader* + TableBody > TableRow > TableCell >
 * TableCellTrigger`. `Root` and `Content` are wrapped for the `size` recipe;
 * every other part is Ark's verbatim. The object is annotated so the emitted
 * `.d.ts` doesn't inline an un-nameable `@zag-js` type (TS2742).
 */
export const DatePicker: Omit<typeof ArkDatePicker, "Root" | "Content"> & {
  Root: typeof DatePickerRoot;
  Content: typeof DatePickerContent;
} = {
  ...ArkDatePicker,
  Root: DatePickerRoot,
  Content: DatePickerContent,
};

export { parseDate } from "@ark-ui/react";

export type {
  DatePickerRootProps,
  DatePickerLabelProps,
  DatePickerControlProps,
  DatePickerInputProps,
  DatePickerTriggerProps,
  DatePickerClearTriggerProps,
  DatePickerValueTextProps,
  DatePickerPositionerProps,
  DatePickerContentProps,
  DatePickerViewProps,
  DatePickerViewControlProps,
  DatePickerViewTriggerProps,
  DatePickerPrevTriggerProps,
  DatePickerNextTriggerProps,
  DatePickerRangeTextProps,
  DatePickerTableProps,
  DatePickerTableHeadProps,
  DatePickerTableHeaderProps,
  DatePickerTableBodyProps,
  DatePickerTableRowProps,
  DatePickerTableCellProps,
  DatePickerTableCellTriggerProps,
  DatePickerMonthSelectProps,
  DatePickerYearSelectProps,
  DatePickerPresetTriggerProps,
  DateValue,
  DatePickerDateView,
  DatePickerSelectionMode,
  DatePickerValueChangeDetails,
  DatePickerOpenChangeDetails,
  DatePickerViewChangeDetails,
  DatePickerFocusChangeDetails,
} from "@ark-ui/react";
