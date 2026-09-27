import { cva, type VariantProps } from "../cva.js";

/**
 * Popover: `size` on the root, which the content follows (its padding, gap,
 * type and widest measure). Ark's Popover.Root renders no element, so the
 * bindings hand the size from the root to the content, and the recipe's
 * attribute lands there. Open state, placement and focus are Ark's own
 * props; open and placement surface as Ark's `data-state` /
 * `data-placement`, not variants.
 */
export const popoverRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/** Popover's density (content padding, type and width). */
export type PopoverSize = NonNullable<VariantProps<typeof popoverRecipe.variants>["size"]>;
