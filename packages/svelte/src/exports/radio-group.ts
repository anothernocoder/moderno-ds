import { RadioGroup as ArkRadioGroup } from "@ark-ui/svelte";
import RadioGroupRoot from "../RadioGroupRoot.svelte";
import RadioGroupItemDescription from "../RadioGroupItemDescription.svelte";
import RadioGroupItemMedia from "../RadioGroupItemMedia.svelte";

/**
 * RadioGroup — pick exactly one option from a short list, as radios or as
 * tiles (`variant="tile"`: a grid of cards, each with an image). Ark binds
 * the root `role="radiogroup"` to its `Label` and each `Item` `<label>` to a
 * visually hidden native radio, and stamps `data-state` / `data-disabled` /
 * `data-invalid` on every item part and `data-orientation` on the root.
 * `Root` is wrapped to inject the recipe, and `ItemMedia` and
 * `ItemDescription` are Moderno's; every other part is Ark's verbatim.
 * Annotated so the emitted `.d.ts` doesn't inline an un-nameable `@zag-js`
 * type (TS2742).
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
  RadioGroupAspectRatio,
  RadioGroupColumns,
  RadioGroupSize,
  RadioGroupVariant,
} from "@moderno-ui/core";
export type {
  RadioGroupItemDescriptionProps,
  RadioGroupItemMediaProps,
} from "../radio-group-props.js";
export type { RadioGroupValueChangeDetails } from "@ark-ui/svelte";
