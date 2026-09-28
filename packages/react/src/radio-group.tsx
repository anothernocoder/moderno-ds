import type { ComponentPropsWithRef } from "react";
import { RadioGroup as ArkRadioGroup } from "@ark-ui/react";
import type { RadioGroupRootProps } from "@ark-ui/react";
import {
  partAttrs,
  radioGroupAttrs,
  type RadioGroupAspectRatio,
  type RadioGroupColumns,
  type RadioGroupSize,
  type RadioGroupVariant,
} from "@moderno-ui/core";

export type {
  RadioGroupAspectRatio,
  RadioGroupColumns,
  RadioGroupSize,
  RadioGroupVariant,
} from "@moderno-ui/core";

export interface ModernoRadioGroupRootProps extends RadioGroupRootProps {
  /** Layout: `list` radios or `tile` cards in a grid — resolves to `data-variant`. */
  variant?: RadioGroupVariant;
  /** Control density — resolves to `data-size` on the root part. */
  size?: RadioGroupSize;
  /** Tiles only: fix the grid to this many columns — resolves to `data-columns`. */
  columns?: RadioGroupColumns;
  /** Tiles only: the shape of every `ItemMedia`, 16:9 when unset — resolves to `data-aspect-ratio`. */
  aspectRatio?: RadioGroupAspectRatio;
}

/** Props of `RadioGroup.ItemDescription`: a plain span, styled by its `data-part`. */
export type RadioGroupItemDescriptionProps = ComponentPropsWithRef<"span">;

/** Props of `RadioGroup.ItemMedia`: a plain span, styled by its `data-part`. */
export type RadioGroupItemMediaProps = ComponentPropsWithRef<"span">;

/**
 * RadioGroup.Root with the Moderno recipe folded in. Ark's Root spreads
 * unknown props onto its `data-part="root"` element, so the attributes of
 * `radioGroupAttrs` (`data-variant`, `data-size`, `data-columns`,
 * `data-aspect-ratio`) ride along and `components.css` keys the layout and
 * density off them.
 */
function RadioGroupRoot({
  variant,
  size,
  columns,
  aspectRatio,
  ...props
}: ModernoRadioGroupRootProps) {
  return (
    <ArkRadioGroup.Root {...props} {...radioGroupAttrs({ variant, size, columns, aspectRatio })} />
  );
}

/**
 * RadioGroup.ItemDescription — a hint under an option's label. Moderno's
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
 * RadioGroup.ItemMedia — a tile's image, or any other content, above its
 * label. Moderno's addition to Ark's anatomy: it keeps the root's
 * `aspectRatio` and crops an image to fill it. `ItemText` names the radio,
 * so an image here takes `alt=""` unless the item has no `ItemText`.
 */
function RadioGroupItemMedia({ children, ...rest }: RadioGroupItemMediaProps) {
  return (
    <span {...rest} {...partAttrs("radio-group", "item-media")}>
      {children}
    </span>
  );
}

/**
 * RadioGroup — pick exactly one option from a short list, as radios or as
 * tiles (`variant="tile"`: a grid of cards, each with an image).
 *
 * Ark drives the machine: the root is a `role="radiogroup"` bound to its
 * `Label`, each `Item` is a `<label>` bound to a visually hidden native
 * `<input type="radio">` (so forms, `name`/`value`, arrow keys and focus
 * work), and every item part carries `data-state="checked|unchecked"` plus
 * `data-disabled`/`data-invalid`/`data-readonly`. Ark's `orientation` prop
 * stamps `data-orientation`, which lays the items out in a column or a row.
 * Those Ark attributes — not CVA variants — are the styling hooks; the recipe
 * only adds the `variant` and `size` a consumer picks, and for tiles the
 * `columns` and `aspectRatio`. Anatomy: `Root > Label + Item (> ItemMedia +
 * ItemControl + ItemText (> ItemDescription) + ItemHiddenInput)` +
 * `Indicator`. `Root` is wrapped for the recipe, and `ItemMedia` and
 * `ItemDescription` are Moderno's; every other part is Ark's verbatim, so
 * parts Ark adds later ride along through the spread. The object is annotated
 * so the emitted `.d.ts` doesn't inline an un-nameable `@zag-js` type (TS2742).
 */
export const RadioGroup: Omit<typeof ArkRadioGroup, "Root"> & {
  Root: typeof RadioGroupRoot;
  ItemDescription: typeof RadioGroupItemDescription;
  ItemMedia: typeof RadioGroupItemMedia;
} = {
  ...ArkRadioGroup,
  Root: RadioGroupRoot,
  ItemDescription: RadioGroupItemDescription,
  ItemMedia: RadioGroupItemMedia,
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
