import { Accordion as ArkAccordion } from "@ark-ui/svelte";
import AccordionRoot from "../AccordionRoot.svelte";

/**
 * Accordion — a stack of sections, each opened and closed by its own header.
 * Ark renders each `ItemTrigger` as a native `<button>` with `aria-expanded`
 * and each `ItemContent` as a `role="region"` labelled by its trigger and
 * `hidden` while closed; every part carries `data-state="open|closed"`. One
 * item opens at a time unless `multiple`; `collapsible` lets the open one
 * close. `Root` is wrapped to inject the `variant` × `size` recipe; every
 * other part is Ark's verbatim. Annotated so the emitted `.d.ts` doesn't
 * inline an un-nameable `@zag-js` type (TS2742).
 */
export const Accordion: Omit<typeof ArkAccordion, "Root"> & { Root: typeof AccordionRoot } = {
  ...ArkAccordion,
  Root: AccordionRoot,
};
export type { AccordionVariant, AccordionSize } from "@moderno-ui/core";
export type { AccordionValueChangeDetails } from "@ark-ui/svelte";
