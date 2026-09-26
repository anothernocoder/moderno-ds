import { cva, type VariantProps } from "../cva.js";

/**
 * Accordion: `variant` × `size` on the root, which every item, trigger and
 * content follows. `line` rules the items apart; `enclosed` holds them in one
 * bordered box. Single or multiple open items, collapsible and orientation are
 * Ark's own props; open and disabled surface as Ark's `data-state` /
 * `data-disabled`, not variants.
 */
export const accordionRecipe = cva({
  variants: {
    variant: ["line", "enclosed"],
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { variant: "line", size: "md" },
});

/** Accordion's visual style (`line`, `enclosed`), shared by every item. */
export type AccordionVariant = NonNullable<
  VariantProps<typeof accordionRecipe.variants>["variant"]
>;

/** Accordion's density (trigger padding and type), shared by every item. */
export type AccordionSize = NonNullable<VariantProps<typeof accordionRecipe.variants>["size"]>;
