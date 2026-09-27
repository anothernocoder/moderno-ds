import { createContext, splitProps, useContext } from "solid-js";
import { DatePicker as ArkDatePicker } from "@ark-ui/solid";
import type { DatePickerContentProps, DatePickerRootProps } from "@ark-ui/solid";
import { datePickerRecipe, type DatePickerSize } from "@moderno-ui/core";

export type { DatePickerSize } from "@moderno-ui/core";

export type ModernoDatePickerRootProps = DatePickerRootProps & {
  /** Input height, day size and type — resolves to `data-size` on the root and the content. */
  size?: DatePickerSize;
};

/** The size of the nearest DatePicker.Root, for the calendar in its Portal. */
const DatePickerSizeContext = createContext<() => DatePickerSize | undefined>(() => undefined);

/**
 * DatePicker.Root with the Moderno `size` recipe folded in. Ark's Root spreads
 * unknown props onto its `data-part="root"` element, so the recipe's attribute
 * sizes the label and the input box. The calendar usually renders in a
 * Portal, outside the root, so the size also travels down a context to the
 * content.
 */
function DatePickerRoot(props: ModernoDatePickerRootProps) {
  const [local, rest] = splitProps(props, ["size"]);
  return (
    <DatePickerSizeContext.Provider value={() => local.size}>
      <ArkDatePicker.Root {...rest} {...datePickerRecipe({ size: local.size })} />
    </DatePickerSizeContext.Provider>
  );
}

/** DatePicker.Content with the picker's `data-size`, for the calendar's density. */
function DatePickerContent(props: DatePickerContentProps) {
  const size = useContext(DatePickerSizeContext);
  return <ArkDatePicker.Content {...props} {...datePickerRecipe({ size: size() })} />;
}

/**
 * DatePicker — a date field with a calendar that opens under it. It picks one
 * date, several, or a range (`selectionMode="range"`), and formats and parses
 * dates for the `locale` it is given. Ark drives all of it: the open state,
 * keyboard moves through the grid, the day / month / year views, typing a
 * date in the input, `min` / `max` and unavailable dates. Values are
 * `DateValue`s; `parseDate("2024-05-01")` makes one. `Root` and `Content` are
 * wrapped for the `size` recipe; every other part is Ark's verbatim. The
 * object is annotated so the emitted `.d.ts` doesn't inline an un-nameable
 * `@zag-js` type (TS2742).
 */
export const DatePicker: Omit<typeof ArkDatePicker, "Root" | "Content"> & {
  Root: typeof DatePickerRoot;
  Content: typeof DatePickerContent;
} = {
  ...ArkDatePicker,
  Root: DatePickerRoot,
  Content: DatePickerContent,
};

export { parseDate } from "@ark-ui/solid";

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
} from "@ark-ui/solid";
