import type { PointerEvent } from "react";
import { SegmentGroup as ArkSegmentGroup, useFieldContext } from "@ark-ui/react";
import type { SegmentGroupItemTextProps, SegmentGroupRootProps } from "@ark-ui/react";
import {
  segmentedControlAttrs,
  segmentedControlFieldProps,
  syncTruncationTitle,
  type SegmentedControlAttrsProps,
} from "@moderno-ui/core";

export type { SegmentedControlSize } from "@moderno-ui/core";

export interface ModernoSegmentedControlRootProps
  extends SegmentGroupRootProps, SegmentedControlAttrsProps {}

/**
 * SegmentedControl.Root with the Moderno recipe folded in: `size` and
 * `fullWidth` land on the root part as `data-size` / `data-full-width`. The
 * segments sit in a row. Inside a `Field`, the Field's label names the group
 * and its helper or error text describes it (`segmentedControlFieldProps`).
 */
function SegmentedControlRoot({ size, fullWidth, ...props }: ModernoSegmentedControlRootProps) {
  const field = useFieldContext();
  return (
    <ArkSegmentGroup.Root
      orientation="horizontal"
      {...props}
      {...segmentedControlFieldProps(field, props)}
      {...segmentedControlAttrs({ size, fullWidth })}
    />
  );
}

/**
 * SegmentedControl.ItemText — Ark's, plus the full label as a tooltip while
 * a long label is cut off by an ellipsis.
 */
function SegmentedControlItemText({ onPointerEnter, ...props }: SegmentGroupItemTextProps) {
  const showFullLabel = (event: PointerEvent<HTMLSpanElement>) => {
    syncTruncationTitle(event.currentTarget);
    onPointerEnter?.(event);
  };
  return <ArkSegmentGroup.ItemText {...props} onPointerEnter={showFullLabel} />;
}

/** Ark's parts but its `Label`, which Moderno leaves out (see below). */
const arkParts: Partial<typeof ArkSegmentGroup> = { ...ArkSegmentGroup };
delete arkParts.Label;

/**
 * SegmentedControl — pick one value from two to five options shown side by
 * side in one track, with a pill that slides behind the selected one.
 *
 * Built on Ark's SegmentGroup, a radio machine: the root is a
 * `role="radiogroup"`, each `Item` is a `<label>` bound to a visually hidden
 * native `<input type="radio">` (so Tab enters the group, the arrow keys move
 * and select, and forms get `name`/`value`), and every item part carries
 * `data-state="checked|unchecked"` plus `data-disabled`/`data-invalid`/
 * `data-readonly`. Ark measures the checked item and slides the `Indicator`
 * to it. Anatomy: `Root > Indicator + Item (> icon + ItemText +
 * ItemHiddenInput)`. `Root` and `ItemText` are wrapped; every other part is
 * Ark's verbatim, except Ark's `Label`, left out: the root is the track, so a
 * label inside it would sit in the track. Name the control with `aria-label`,
 * or put it in a `Field` with a `Field.Label`. The object is annotated so the
 * emitted `.d.ts` doesn't inline an un-nameable `@zag-js` type (TS2742).
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
} from "@ark-ui/react";
