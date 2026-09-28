import { splitProps, type JSX } from "solid-js";
import { SegmentGroup as ArkSegmentGroup, useFieldContext } from "@ark-ui/solid";
import type { SegmentGroupItemTextProps, SegmentGroupRootProps } from "@ark-ui/solid";
import {
  segmentedControlAttrs,
  segmentedControlFieldProps,
  syncTruncationTitle,
  type SegmentedControlAttrsProps,
} from "@moderno-ui/core";

export type { SegmentedControlSize } from "@moderno-ui/core";

export type ModernoSegmentedControlRootProps = SegmentGroupRootProps & SegmentedControlAttrsProps;

/**
 * SegmentedControl.Root with the Moderno recipe folded in: `size` and
 * `fullWidth` land on the root part as `data-size` / `data-full-width`. The
 * segments sit in a row. Inside a `Field`, the Field's label names the group
 * and its helper or error text describes it (`segmentedControlFieldProps`).
 */
function SegmentedControlRoot(props: ModernoSegmentedControlRootProps) {
  const [local, rest] = splitProps(props, ["size", "fullWidth"]);
  const field = useFieldContext();
  return (
    <ArkSegmentGroup.Root
      orientation="horizontal"
      {...rest}
      {...segmentedControlFieldProps(field?.(), rest)}
      {...segmentedControlAttrs({ size: local.size, fullWidth: local.fullWidth })}
    />
  );
}

/**
 * SegmentedControl.ItemText — Ark's, plus the full label as a tooltip while
 * a long label is cut off by an ellipsis.
 */
function SegmentedControlItemText(props: SegmentGroupItemTextProps) {
  const [local, rest] = splitProps(props, ["onPointerEnter"]);
  const showFullLabel: JSX.EventHandler<HTMLSpanElement, PointerEvent> = (event) => {
    syncTruncationTitle(event.currentTarget);
    const own = local.onPointerEnter;
    if (typeof own === "function") own(event);
    else own?.[0](own[1], event);
  };
  return <ArkSegmentGroup.ItemText {...rest} onPointerEnter={showFullLabel} />;
}

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
 * `Field.Label`. The object is annotated so the emitted `.d.ts` doesn't
 * inline an un-nameable `@zag-js` type (TS2742).
 */
export const SegmentedControl: Omit<typeof ArkSegmentGroup, "Root" | "ItemText" | "Label"> & {
  Root: typeof SegmentedControlRoot;
  ItemText: typeof SegmentedControlItemText;
} = {
  ...(arkParts as Omit<typeof ArkSegmentGroup, "Label">),
  Root: SegmentedControlRoot,
  ItemText: SegmentedControlItemText,
};

export type {
  SegmentGroupItemProps as SegmentedControlItemProps,
  SegmentGroupItemTextProps as SegmentedControlItemTextProps,
  SegmentGroupItemHiddenInputProps as SegmentedControlItemHiddenInputProps,
  SegmentGroupIndicatorProps as SegmentedControlIndicatorProps,
  SegmentGroupValueChangeDetails as SegmentedControlValueChangeDetails,
} from "@ark-ui/solid";
