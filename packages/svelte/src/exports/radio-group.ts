import { RadioGroup as ArkRadioGroup } from "@ark-ui/svelte";
import RadioGroupRoot from "../RadioGroupRoot.svelte";
import RadioGroupItemDescription from "../RadioGroupItemDescription.svelte";

/**
 * RadioGroup — pick exactly one option from a short list. Ark binds the root
 * `role="radiogroup"` to its `Label` and each `Item` `<label>` to a visually
 * hidden native radio, and stamps `data-state` / `data-disabled` /
 * `data-invalid` on every item part and `data-orientation` on the root.
 * `Root` is wrapped to inject the `size` recipe and `ItemDescription` is
 * Moderno's; every other part is Ark's verbatim. Annotated so the emitted
 * `.d.ts` doesn't inline an un-nameable `@zag-js` type (TS2742).
 */
export const RadioGroup: Omit<typeof ArkRadioGroup, "Root"> & {
  Root: typeof RadioGroupRoot;
  ItemDescription: typeof RadioGroupItemDescription;
} = {
  ...ArkRadioGroup,
  Root: RadioGroupRoot,
  ItemDescription: RadioGroupItemDescription,
};
export type { RadioGroupSize } from "@moderno-ui/core";
export type { RadioGroupItemDescriptionProps } from "../radio-group-props.js";
export type { RadioGroupValueChangeDetails } from "@ark-ui/svelte";
