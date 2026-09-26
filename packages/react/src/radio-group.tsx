import type { ComponentPropsWithRef } from "react";
import { RadioGroup as ArkRadioGroup } from "@ark-ui/react";
import type { RadioGroupRootProps } from "@ark-ui/react";
import { partAttrs, radioGroupRecipe, type RadioGroupSize } from "@moderno-ui/core";

export type { RadioGroupSize } from "@moderno-ui/core";

export interface ModernoRadioGroupRootProps extends RadioGroupRootProps {
  /** Control density — resolves to `data-size` on the root part. */
  size?: RadioGroupSize;
}

/** Props of `RadioGroup.ItemDescription`: a plain span, styled by its `data-part`. */
export type RadioGroupItemDescriptionProps = ComponentPropsWithRef<"span">;

/**
 * RadioGroup.Root with the Moderno `size` recipe folded in. Ark's Root spreads
 * unknown props onto its `data-part="root"` element, so the recipe's
 * `data-size` rides along and `components.css` keys the circle and text
 * density off it.
 */
function RadioGroupRoot({ size, ...props }: ModernoRadioGroupRootProps) {
  return <ArkRadioGroup.Root {...props} {...radioGroupRecipe({ size })} />;
}

/**
 * RadioGroup.ItemDescription — a hint under an option's label. Moderno's one
 * addition to Ark's anatomy: place it inside `RadioGroup.ItemText`, which
 * names the option's radio, so screen readers read it with the label.
 */
function RadioGroupItemDescription({ children, ...rest }: RadioGroupItemDescriptionProps) {
  return (
    <span {...rest} {...partAttrs("radio-group", "item-description")}>
      {children}
    </span>
  );
}

/**
 * RadioGroup — pick exactly one option from a short list.
 *
 * Ark drives the machine: the root is a `role="radiogroup"` bound to its
 * `Label`, each `Item` is a `<label>` bound to a visually hidden native
 * `<input type="radio">` (so forms, `name`/`value`, arrow keys and focus
 * work), and every item part carries `data-state="checked|unchecked"` plus
 * `data-disabled`/`data-invalid`/`data-readonly`. Ark's `orientation` prop
 * stamps `data-orientation`, which lays the items out in a column or a row.
 * Those Ark attributes — not CVA variants — are the styling hooks; the recipe
 * only adds the `size` a consumer picks. Anatomy: `Root > Label + Item (>
 * ItemControl + ItemText (> ItemDescription) + ItemHiddenInput)` + `Indicator`.
 * `Root` is wrapped for the recipe and `ItemDescription` is Moderno's; every
 * other part is Ark's verbatim, so parts Ark adds later ride along through the
 * spread. The object is annotated so the emitted `.d.ts` doesn't inline an
 * un-nameable `@zag-js` type (TS2742).
 */
export const RadioGroup: Omit<typeof ArkRadioGroup, "Root"> & {
  Root: typeof RadioGroupRoot;
  ItemDescription: typeof RadioGroupItemDescription;
} = {
  ...ArkRadioGroup,
  Root: RadioGroupRoot,
  ItemDescription: RadioGroupItemDescription,
};

export type {
  RadioGroupRootProps,
  RadioGroupLabelProps,
  RadioGroupItemProps,
  RadioGroupItemControlProps,
  RadioGroupItemTextProps,
  RadioGroupItemHiddenInputProps,
  RadioGroupIndicatorProps,
  RadioGroupValueChangeDetails,
} from "@ark-ui/react";
