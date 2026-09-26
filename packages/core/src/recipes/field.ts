import { cva, type VariantProps } from "../cva.js";

/**
 * Field: control `size` — the density of the whole field (label, control,
 * helper/error text), carried on the root so one attribute sizes every part.
 * Invalid/disabled/required stay Ark's own data-attributes, not variants.
 */
export const fieldRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/** Field's control density (label, input/textarea, helper and error text). */
export type FieldSize = NonNullable<VariantProps<typeof fieldRecipe.variants>["size"]>;
