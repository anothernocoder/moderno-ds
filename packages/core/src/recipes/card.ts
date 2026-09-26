import { cva, type VariantProps } from "../cva.js";

/**
 * Card: surface `variant` × padding `size`. A CSS-only primitive — no Ark
 * machine exists for a card, so this recipe is its entire behavioural surface
 * and `components.css` paints every part from `[data-scope="card"]`.
 */
export const cardRecipe = cva({
  variants: {
    variant: ["outline", "muted", "ghost"],
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { variant: "outline", size: "md" },
});

/** Card's surface treatment (`outline`, `muted`, `ghost`). */
export type CardVariant = NonNullable<VariantProps<typeof cardRecipe.variants>["variant"]>;

/** Card's padding density. */
export type CardSize = NonNullable<VariantProps<typeof cardRecipe.variants>["size"]>;
