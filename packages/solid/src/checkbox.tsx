import { splitProps } from "solid-js";
import { Checkbox as ArkCheckbox } from "@ark-ui/solid";
import type { CheckboxRootProps } from "@ark-ui/solid";
import { checkboxRecipe, type CheckboxSize } from "@moderno-ui/core";

export type { CheckboxSize } from "@moderno-ui/core";

export type ModernoCheckboxRootProps = CheckboxRootProps & {
  /** Control density — resolves to `data-size` on the root part. */
  size?: CheckboxSize;
};

/**
 * Checkbox.Root with the Moderno `size` recipe folded in. Ark's Root spreads
 * unknown props onto its `data-part="root"` element, so the recipe's `data-size`
 * rides along and `components.css` keys the box/label density off it.
 */
function CheckboxRoot(props: ModernoCheckboxRootProps) {
  const [local, rest] = splitProps(props, ["size"]);
  return <ArkCheckbox.Root {...rest} {...checkboxRecipe({ size: local.size })} />;
}

/**
 * Checkbox — tri-state (unchecked / checked / indeterminate) with a label; Ark
 * drives all of it. The root is a `<label>` bound to a visually hidden native
 * `<input type="checkbox">`, and every part carries
 * `data-state="checked|unchecked|indeterminate"` plus `data-disabled`/
 * `data-invalid`/`data-readonly` — Ark attributes, not CVA variants, are the
 * styling hooks. Only `Root` is wrapped to inject the `size` recipe; every
 * other part is Ark's verbatim. The object is annotated so the emitted `.d.ts`
 * doesn't inline an un-nameable `@zag-js` type (TS2742).
 */
export const Checkbox: Omit<typeof ArkCheckbox, "Root"> & { Root: typeof CheckboxRoot } = {
  ...ArkCheckbox,
  Root: CheckboxRoot,
};

export type {
  CheckboxRootProps,
  CheckboxControlProps,
  CheckboxIndicatorProps,
  CheckboxLabelProps,
  CheckboxHiddenInputProps,
  CheckboxCheckedChangeDetails,
  CheckboxCheckedState,
} from "@ark-ui/solid";
