/**
 * Alert's prop types, in a `.ts` file rather than inside each `.svelte`.
 *
 * `svelte-package` emits a `.d.ts` per component, but a `Props` interface
 * declared inside a component's instance script is not exported — so the
 * namespaced `Alert` object in `index.ts` would reference a type it cannot
 * name and its declaration would be dropped (the same TS2742-class hazard the
 * `Select` export is annotated against). Declaring the types here lets both the
 * components and the annotated export refer to one nameable type.
 */
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { AlertSize, AlertVariant } from "@moderno-ui/core";

/** `Alert.Root`: the recipe's status/density plus any div attribute. */
export interface AlertRootProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  size?: AlertSize;
  children?: Snippet;
}

/** Every non-root Alert part: a plain div, styled by its `data-part`. */
export interface AlertPartProps extends HTMLAttributes<HTMLDivElement> {
  children?: Snippet;
}
