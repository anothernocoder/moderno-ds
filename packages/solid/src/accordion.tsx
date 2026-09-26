import { splitProps } from "solid-js";
import { Accordion as ArkAccordion } from "@ark-ui/solid";
import type { AccordionRootProps } from "@ark-ui/solid";
import { accordionRecipe, type AccordionSize, type AccordionVariant } from "@moderno-ui/core";

export type { AccordionSize, AccordionVariant } from "@moderno-ui/core";

export type ModernoAccordionRootProps = AccordionRootProps & {
  /** Visual style of the items — resolves to `data-variant` on the root part. */
  variant?: AccordionVariant;
  /** Density of every item — resolves to `data-size` on the root part. */
  size?: AccordionSize;
};

/**
 * Accordion.Root with the Moderno `variant` × `size` recipe folded in. Ark's
 * Root spreads unknown props onto its `data-part="root"` element, so the
 * recipe's attributes ride along and `components.css` styles the items from
 * them.
 */
function AccordionRoot(props: ModernoAccordionRootProps) {
  const [local, rest] = splitProps(props, ["variant", "size"]);
  return (
    <ArkAccordion.Root
      {...rest}
      {...accordionRecipe({ variant: local.variant, size: local.size })}
    />
  );
}

/**
 * Accordion — a stack of sections, each opened and closed by its own header.
 * Ark drives all of it: each `ItemTrigger` is a native `<button>` with
 * `aria-expanded`, each `ItemContent` a `role="region"` labelled by its
 * trigger and `hidden` while closed, and every part carries
 * `data-state="open|closed"`. One item opens at a time unless `multiple`;
 * `collapsible` lets the open one close. `Root` is wrapped to inject the
 * recipe; every other part is Ark's verbatim. The object is annotated so the
 * emitted `.d.ts` doesn't inline an un-nameable `@zag-js` type (TS2742).
 */
export const Accordion: Omit<typeof ArkAccordion, "Root"> & { Root: typeof AccordionRoot } = {
  ...ArkAccordion,
  Root: AccordionRoot,
};

export type {
  AccordionRootProps,
  AccordionItemProps,
  AccordionItemTriggerProps,
  AccordionItemIndicatorProps,
  AccordionItemContentProps,
  AccordionValueChangeDetails,
} from "@ark-ui/solid";
