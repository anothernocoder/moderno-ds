/**
 * Callout's prop types, in a `.ts` file rather than inside each `.svelte`, for
 * the same reason as `alert-props.ts`: a `Props` interface declared inside a
 * component's instance script is not exported, so the namespaced `Callout`
 * object in `index.ts` could not name it and its declaration would be dropped.
 */
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { CalloutVariant } from "@moderno-ui/core";

/** `Callout.Root`: the recipe's status plus any div attribute. */
export interface CalloutRootProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CalloutVariant;
  children?: Snippet;
}

/** Every non-root Callout part: a plain div, styled by its `data-part`. */
export interface CalloutPartProps extends HTMLAttributes<HTMLDivElement> {
  children?: Snippet;
}
