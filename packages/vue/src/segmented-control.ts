import {
  computed,
  defineComponent,
  h,
  type Component,
  type DefineComponent,
  type PropType,
} from "vue";
import { SegmentGroup as ArkSegmentGroup, useFieldContext, useSegmentGroup } from "@ark-ui/vue";
import type {
  SegmentGroupRootProps,
  SegmentGroupItemTextProps,
  SegmentGroupValueChangeDetails,
  UseSegmentGroupProps,
} from "@ark-ui/vue";
import {
  segmentedControlAttrs,
  segmentedControlFieldProps,
  syncTruncationTitle,
  type SegmentedControlSize,
} from "@moderno-ui/core";

export type { SegmentedControlSize } from "@moderno-ui/core";

/**
 * The Root's public surface: Ark's own props, `invalid` and `required`
 * (Ark-Vue's Root leaves those two machine props out), and the Moderno
 * `size` and `fullWidth`. Ark-Vue declares the change callbacks as emits, so
 * they are spelled out here for a `h()` caller.
 */
export interface ModernoSegmentedControlRootProps extends SegmentGroupRootProps {
  size?: SegmentedControlSize;
  /** Stretch the track to its container and share the width evenly between segments. */
  fullWidth?: boolean;
  invalid?: boolean;
  required?: boolean;
  onValueChange?: (details: SegmentGroupValueChangeDetails) => void;
  "onUpdate:modelValue"?: (value: SegmentGroupValueChangeDetails["value"]) => void;
}

/** A boolean machine prop that stays `undefined` unless set, so a Field can supply it. */
const optionalBoolean = { type: Boolean, default: undefined } as const;

/**
 * SegmentedControl.Root with the Moderno recipe folded in: `size` and
 * `fullWidth` land on the root part as `data-size` / `data-full-width`, and
 * the segments sit in a row. It runs Ark's `useSegmentGroup` behind Ark's
 * `RootProvider` (rather than Ark-Vue's Root) so every machine prop reaches
 * the machine, `invalid` and `required` included. Inside a `Field`, the
 * Field's label names the group and its helper or error text describes it
 * (`segmentedControlFieldProps`). v-model binds `modelValue`.
 */
const SegmentedControlRootImpl = defineComponent({
  name: "ModernoSegmentedControlRoot",
  inheritAttrs: false,
  props: {
    size: { type: String as PropType<SegmentedControlSize>, default: undefined },
    fullWidth: Boolean,
    modelValue: { type: String as PropType<string | null>, default: undefined },
    defaultValue: { type: String as PropType<string | null>, default: undefined },
    name: { type: String, default: undefined },
    form: { type: String, default: undefined },
    id: { type: String, default: undefined },
    ids: { type: Object as PropType<UseSegmentGroupProps["ids"]>, default: undefined },
    orientation: {
      type: String as PropType<UseSegmentGroupProps["orientation"]>,
      default: "horizontal",
    },
    disabled: optionalBoolean,
    invalid: optionalBoolean,
    readOnly: optionalBoolean,
    required: optionalBoolean,
  },
  emits: ["valueChange", "update:modelValue"],
  setup(props, { slots, attrs, emit }) {
    const field = useFieldContext();
    // The consumer's machine props, and what the Field around them supplies.
    const machineProps = computed(() => ({
      ...props,
      ...segmentedControlFieldProps(field?.value, props),
    }));
    const segmentGroup = useSegmentGroup(machineProps, emit);
    const RootProvider = ArkSegmentGroup.RootProvider as unknown as Component;
    return () =>
      h(
        RootProvider,
        {
          ...attrs,
          "aria-describedby": attrs["aria-describedby"] ?? field?.value.ariaDescribedby,
          value: segmentGroup.value,
          ...segmentedControlAttrs({ size: props.size, fullWidth: props.fullWidth }),
        },
        slots,
      );
  },
});

/**
 * SegmentedControl.ItemText — Ark's, plus the full label as a tooltip while
 * a long label is cut off by an ellipsis.
 */
const SegmentedControlItemTextImpl = defineComponent({
  name: "ModernoSegmentedControlItemText",
  inheritAttrs: false,
  setup(_props, { slots, attrs }) {
    const ItemText = ArkSegmentGroup.ItemText as unknown as Component;
    const own = attrs.onPointerenter as ((event: PointerEvent) => void) | undefined;
    const showFullLabel = (event: PointerEvent) => {
      syncTruncationTitle(event.currentTarget as HTMLElement);
      own?.(event);
    };
    return () => h(ItemText, { ...attrs, onPointerenter: showFullLabel }, slots);
  },
});

/** Ark's parts but its `Label`, which Moderno leaves out (see below). */
const arkParts: Partial<typeof ArkSegmentGroup> = { ...ArkSegmentGroup };
delete arkParts.Label;

/**
 * SegmentedControl — pick one value from two to five options shown side by
 * side in one track, with a pill that slides behind the selected one. Ark's
 * SegmentGroup (a radio machine) drives it: the root is a `role="radiogroup"`,
 * each `Item` is a `<label>` bound to a visually hidden native radio, and
 * every item part carries `data-state="checked|unchecked"` plus
 * `data-disabled`/`data-invalid`/`data-readonly`. `Root` and `ItemText` are
 * wrapped; every other part is Ark's verbatim, except Ark's `Label`, left
 * out: the root is the track, so a label inside it would sit in the track.
 * Name the control with `aria-label`, or put it in a `Field` with a
 * `Field.Label`.
 *
 * The whole object is annotated explicitly so the emitted `.d.ts` doesn't
 * inline an un-nameable type that points at internal `@zag-js` paths (TS2742).
 */
export const SegmentedControl: Omit<typeof ArkSegmentGroup, "Root" | "ItemText" | "Label"> & {
  Root: DefineComponent<ModernoSegmentedControlRootProps>;
  ItemText: DefineComponent<SegmentGroupItemTextProps>;
} = {
  ...(arkParts as Omit<typeof ArkSegmentGroup, "Label">),
  Root: SegmentedControlRootImpl as unknown as DefineComponent<ModernoSegmentedControlRootProps>,
  ItemText: SegmentedControlItemTextImpl as unknown as DefineComponent<SegmentGroupItemTextProps>,
};

export type {
  SegmentGroupItemProps as SegmentedControlItemProps,
  SegmentGroupItemTextProps as SegmentedControlItemTextProps,
  SegmentGroupItemHiddenInputProps as SegmentedControlItemHiddenInputProps,
  SegmentGroupIndicatorProps as SegmentedControlIndicatorProps,
  SegmentGroupValueChangeDetails as SegmentedControlValueChangeDetails,
} from "@ark-ui/vue";
