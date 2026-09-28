/**
 * RadioGroup.ItemDescription's and ItemMedia's props, in a `.ts` file rather
 * than inside the `.svelte`, for the same reason as `callout-props.ts`: a
 * `Props` interface declared inside a component's instance script is not
 * exported, so `index.ts` could not re-export it by name.
 */
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

/** A plain span, styled by its `data-part`. */
export interface RadioGroupItemDescriptionProps extends HTMLAttributes<HTMLSpanElement> {
  children?: Snippet;
}

/** A plain span holding a tile's image or other content, styled by its `data-part`. */
export interface RadioGroupItemMediaProps extends HTMLAttributes<HTMLSpanElement> {
  children?: Snippet;
}
