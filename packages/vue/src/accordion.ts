import { defineComponent, h, type Component, type DefineComponent, type PropType } from "vue";
import { Accordion as ArkAccordion } from "@ark-ui/vue";
import type {
  AccordionFocusChangeDetails,
  AccordionRootProps,
  AccordionValueChangeDetails,
} from "@ark-ui/vue";
import { accordionRecipe, type AccordionSize, type AccordionVariant } from "@moderno-ui/core";

export type { AccordionSize, AccordionVariant } from "@moderno-ui/core";

/**
 * The Root's public surface: Ark's own props plus the Moderno `variant` ×
 * `size` recipe. Ark-Vue declares the change callbacks as emits rather than
 * props, so they are spelled out here — a `h()` caller (and a template)
 * passes them as `onValueChange` / `onFocusChange` / `onUpdate:modelValue`
 * handlers, and `inheritAttrs: false` forwards them untouched.
 */
export interface ModernoAccordionRootProps extends AccordionRootProps {
  variant?: AccordionVariant;
  size?: AccordionSize;
  onValueChange?: (details: AccordionValueChangeDetails) => void;
  onFocusChange?: (details: AccordionFocusChangeDetails) => void;
  "onUpdate:modelValue"?: (value: string[]) => void;
}

/**
 * Accordion.Root with the Moderno `variant` × `size` recipe folded in. Ark's
 * Root spreads unknown attributes onto its `data-part="root"` element, so the
 * recipe's attributes ride along and `components.css` styles the items from
 * them. `defaultValue`, `multiple`, `collapsible`, … pass straight through
 * via attrs.
 */
const AccordionRootImpl = defineComponent({
  name: "ModernoAccordionRoot",
  inheritAttrs: false,
  props: {
    variant: { type: String as PropType<AccordionVariant>, default: undefined },
    size: { type: String as PropType<AccordionSize>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    // Ark's Root re-typed as a plain Component so the merged bag isn't checked
    // against its full prop union (we only add the recipe's data-*).
    const Root = ArkAccordion.Root as unknown as Component;
    return () =>
      h(
        Root,
        { ...attrs, ...accordionRecipe({ variant: props.variant, size: props.size }) },
        slots,
      );
  },
});

/**
 * Accordion — a stack of sections, each opened and closed by its own header.
 * Ark drives all of it: each `ItemTrigger` is a native `<button>` with
 * `aria-expanded`, each `ItemContent` a `role="region"` labelled by its
 * trigger and `hidden` while closed, and every part carries
 * `data-state="open|closed"`. One item opens at a time unless `multiple`;
 * `collapsible` lets the open one close. `Root` is wrapped to inject the
 * recipe; every other part is Ark's verbatim.
 *
 * The whole object is annotated explicitly so the emitted `.d.ts` doesn't
 * inline an un-nameable type that points at internal `@zag-js` paths (TS2742).
 */
export const Accordion: Omit<typeof ArkAccordion, "Root"> & {
  Root: DefineComponent<ModernoAccordionRootProps>;
} = {
  ...ArkAccordion,
  Root: AccordionRootImpl as unknown as DefineComponent<ModernoAccordionRootProps>,
};

export type {
  AccordionRootProps,
  AccordionItemProps,
  AccordionItemTriggerProps,
  AccordionItemIndicatorProps,
  AccordionItemContentProps,
  AccordionValueChangeDetails,
} from "@ark-ui/vue";
