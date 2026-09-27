import { splitProps, type JSX } from "solid-js";
import { RadioGroup as ArkRadioGroup } from "@ark-ui/solid";
import type { RadioGroupRootProps } from "@ark-ui/solid";
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

export type ModernoRadioGroupRootProps = RadioGroupRootProps & {
  /** Layout: `list` radios or `tile` cards in a grid — resolves to `data-variant`. */
  variant?: RadioGroupVariant;
  /** Control density — resolves to `data-size` on the root part. */
  size?: RadioGroupSize;
  /** Tiles only: fix the grid to this many columns — resolves to `data-columns`. */
  columns?: RadioGroupColumns;
  /** Tiles only: the shape of every `ItemMedia`, 16:9 when unset — resolves to `data-aspect-ratio`. */
  aspectRatio?: RadioGroupAspectRatio;
};

/** Props of `RadioGroup.ItemDescription`: a plain span, styled by its `data-part`. */
export type RadioGroupItemDescriptionProps = JSX.HTMLAttributes<HTMLSpanElement>;

/** Props of `RadioGroup.ItemMedia`: a plain span, styled by its `data-part`. */
export type RadioGroupItemMediaProps = JSX.HTMLAttributes<HTMLSpanElement>;

/**
 * RadioGroup.Root with the Moderno recipe folded in. Ark's Root spreads
 * unknown props onto its `data-part="root"` element, so the attributes of
 * `radioGroupAttrs` (`data-variant`, `data-size`, `data-columns`,
 * `data-aspect-ratio`) ride along and `components.css` keys the layout and
 * density off them.
 */
function RadioGroupRoot(props: ModernoRadioGroupRootProps) {
  const [local, rest] = splitProps(props, ["variant", "size", "columns", "aspectRatio"]);
  return (
    <ArkRadioGroup.Root
      {...rest}
      {...radioGroupAttrs({
        variant: local.variant,
        size: local.size,
        columns: local.columns,
        aspectRatio: local.aspectRatio,
      })}
    />
  );
}

/**
 * RadioGroup.ItemDescription — a hint under an option's label. Moderno's
 * addition to Ark's anatomy: place it inside `RadioGroup.ItemText`, which
 * names the option's radio, so screen readers read it with the label.
 */
function RadioGroupItemDescription(props: RadioGroupItemDescriptionProps) {
  const [local, rest] = splitProps(props, ["children"]);
  return (
    <span {...rest} {...partAttrs("radio-group", "item-description")}>
      {local.children}
    </span>
  );
}

/**
 * RadioGroup.ItemMedia — a tile's image, or any other content, above its
 * label. Moderno's addition to Ark's anatomy: it keeps the root's
 * `aspectRatio` and crops an image to fill it. `ItemText` names the radio,
 * so an image here takes `alt=""` unless the item has no `ItemText`.
 */
function RadioGroupItemMedia(props: RadioGroupItemMediaProps) {
  const [local, rest] = splitProps(props, ["children"]);
  return (
    <span {...rest} {...partAttrs("radio-group", "item-media")}>
      {local.children}
    </span>
  );
}

/**
 * RadioGroup — pick exactly one option from a short list, as radios or as
 * tiles (`variant="tile"`: a grid of cards, each with an image); Ark drives
 * all of it. The root is a `role="radiogroup"` bound to its `Label`, each
 * `Item` is a `<label>` bound to a visually hidden native
 * `<input type="radio">`, and every item part carries
 * `data-state="checked|unchecked"` plus `data-disabled`/`data-invalid`/
 * `data-readonly`; Ark's `orientation` stamps `data-orientation`. Ark
 * attributes, not CVA variants, are the styling hooks. `Root` is wrapped to
 * inject the recipe, and `ItemMedia` and `ItemDescription` are Moderno's;
 * every other part is Ark's verbatim. The object is annotated so the emitted
 * `.d.ts` doesn't inline an un-nameable `@zag-js` type (TS2742).
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
} from "@ark-ui/solid";
