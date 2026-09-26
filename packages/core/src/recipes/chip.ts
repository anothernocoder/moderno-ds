import { cva, type VariantProps } from "../cva.js";

/**
 * Chip: surface `variant` × `size`. A compact token that may be removed; the
 * remove button is a plain `<button>`, so there is no machine state to style —
 * only the consumer's choices below.
 */
export const chipRecipe = cva({
  variants: {
    variant: ["outline", "muted", "solid"],
    size: ["sm", "md"],
  },
  defaultVariants: { variant: "outline", size: "md" },
});

/** Chip's surface treatment (`outline`, `muted`, `solid`). */
export type ChipVariant = NonNullable<VariantProps<typeof chipRecipe.variants>["variant"]>;

/** Chip's density. */
export type ChipSize = NonNullable<VariantProps<typeof chipRecipe.variants>["size"]>;
