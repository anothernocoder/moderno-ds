import { Checkbox as ArkCheckbox } from "@ark-ui/react";
import type { CheckboxRootProps } from "@ark-ui/react";
import { checkboxRecipe, type CheckboxSize } from "@moderno-ui/core";

export type { CheckboxSize } from "@moderno-ui/core";

export interface ModernoCheckboxRootProps extends CheckboxRootProps {
  /** Control density — resolves to `data-size` on the root part. */
  size?: CheckboxSize;
}

/**
 * Checkbox.Root with the Moderno `size` recipe folded in. Ark's Root spreads
 * unknown props onto its `data-part="root"` element, so the recipe's `data-size`
 * rides along and `components.css` keys the box/label density off it.
 */
function CheckboxRoot({ size, ...props }: ModernoCheckboxRootProps) {
  return <ArkCheckbox.Root {...props} {...checkboxRecipe({ size })} />;
}

/**
 * Checkbox — tri-state (unchecked / checked / indeterminate) with a label.
 *
 * Ark drives the machine: the root is a `<label>` bound to a visually hidden
 * native `<input type="checkbox">` (so forms, `name`/`value` and screen readers
 * work), and every part carries `data-state="checked|unchecked|indeterminate"`
 * plus `data-disabled`/`data-invalid`/`data-readonly`. Those Ark attributes —
 * not CVA variants — are the styling hooks; the recipe only adds the `size`
 * a consumer picks. Anatomy: `Root > Control > Indicator` + `Label` +
 * `HiddenInput`. Render two indicators to distinguish the two "on" states:
 * `<Checkbox.Indicator>` shows when checked, `<Checkbox.Indicator indeterminate>`
 * when indeterminate. Only `Root` is wrapped; every other part is Ark's
 * verbatim, so parts Ark adds later ride along through the spread. The object
 * is annotated so the emitted `.d.ts` doesn't inline an un-nameable `@zag-js`
 * type (TS2742).
 */
export const Checkbox: Omit<typeof ArkCheckbox, "Root"> & { Root: typeof CheckboxRoot } = {
  ...ArkCheckbox,
  Root: CheckboxRoot,
};

export type {
  CheckboxCheckedChangeDetails,
  CheckboxCheckedState,
  CheckboxControlProps,
  CheckboxIndicatorProps,
  CheckboxLabelProps,
  CheckboxHiddenInputProps,
} from "@ark-ui/react";
