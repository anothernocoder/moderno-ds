import {
  defineComponent,
  h,
  inject,
  provide,
  type Component,
  type DefineComponent,
  type InjectionKey,
  type PropType,
} from "vue";
import { DatePicker as ArkDatePicker } from "@ark-ui/vue";
import type {
  DatePickerRootProps,
  DatePickerDateView,
  DatePickerFocusChangeDetails,
  DatePickerOpenChangeDetails,
  DatePickerValueChangeDetails,
  DatePickerViewChangeDetails,
  DatePickerVisibleRangeChangeDetails,
  DateValue,
} from "@ark-ui/vue";
import { datePickerRecipe, type DatePickerSize } from "@moderno-ui/core";

export type { DatePickerSize } from "@moderno-ui/core";

/**
 * The Root's public surface: Ark's own props plus the Moderno `size` recipe.
 * Ark-Vue declares the callbacks as emits rather than props, so they are
 * spelled out here — a template listens with `@value-change`, `v-model` or
 * `v-model:open`, and `inheritAttrs: false` forwards them untouched.
 */
export interface ModernoDatePickerRootProps extends DatePickerRootProps {
  /** Input height, day size and type — resolves to `data-size` on the root and the content. */
  size?: DatePickerSize;
  onValueChange?: (details: DatePickerValueChangeDetails) => void;
  onOpenChange?: (details: DatePickerOpenChangeDetails) => void;
  onFocusChange?: (details: DatePickerFocusChangeDetails) => void;
  onViewChange?: (details: DatePickerViewChangeDetails) => void;
  onVisibleRangeChange?: (details: DatePickerVisibleRangeChangeDetails) => void;
  onExitComplete?: () => void;
  "onUpdate:modelValue"?: (value: DateValue[]) => void;
  "onUpdate:open"?: (open: boolean) => void;
  "onUpdate:view"?: (view: DatePickerDateView) => void;
  "onUpdate:focusedValue"?: (focusedValue: DateValue) => void;
}

/** The size of the nearest DatePicker.Root, for the calendar in its Portal. */
const DATE_PICKER_SIZE: InjectionKey<() => DatePickerSize | undefined> =
  Symbol("ModernoDatePickerSize");

/**
 * DatePicker.Root with the Moderno `size` recipe folded in. Ark's Root spreads
 * unknown attributes onto its `data-part="root"` element, so the recipe's
 * attribute sizes the label and the input box. The calendar usually renders
 * in a Portal (a Teleport), outside the root, so the size is also provided to
 * the content. Every Ark prop and listener passes straight through via attrs.
 */
const DatePickerRootImpl = defineComponent({
  name: "ModernoDatePickerRoot",
  inheritAttrs: false,
  props: {
    size: { type: String as PropType<DatePickerSize>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    provide(DATE_PICKER_SIZE, () => props.size);
    // Ark's Root re-typed as a plain Component so the merged bag isn't checked
    // against its full prop union (we only add the recipe's data-*).
    const Root = ArkDatePicker.Root as unknown as Component;
    return () => h(Root, { ...attrs, ...datePickerRecipe({ size: props.size }) }, slots);
  },
});

/** DatePicker.Content with the picker's `data-size`, for the calendar's density. */
const DatePickerContentImpl = defineComponent({
  name: "ModernoDatePickerContent",
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const size = inject(DATE_PICKER_SIZE, () => undefined);
    const Content = ArkDatePicker.Content as unknown as Component;
    return () => h(Content, { ...attrs, ...datePickerRecipe({ size: size() }) }, slots);
  },
});

/**
 * DatePicker — a date field with a calendar that opens under it. It picks one
 * date, several, or a range (`selection-mode="range"`), and formats and
 * parses dates for the `locale` it is given. Ark drives all of it: the open
 * state, keyboard moves through the grid, the day / month / year views,
 * typing a date in the input, `min` / `max` and unavailable dates. Values are
 * `DateValue`s; `parseDate("2024-05-01")` makes one. `Root` and `Content` are
 * wrapped for the `size` recipe; every other part is Ark's verbatim.
 *
 * The whole object is annotated explicitly so the emitted `.d.ts` doesn't
 * inline an un-nameable type that points at internal `@zag-js` paths (TS2742).
 */
export const DatePicker: Omit<typeof ArkDatePicker, "Root"> & {
  Root: DefineComponent<ModernoDatePickerRootProps>;
} = {
  ...ArkDatePicker,
  Root: DatePickerRootImpl as unknown as DefineComponent<ModernoDatePickerRootProps>,
  Content: DatePickerContentImpl as unknown as typeof ArkDatePicker.Content,
};

export { parseDate } from "@ark-ui/vue";

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
} from "@ark-ui/vue";
