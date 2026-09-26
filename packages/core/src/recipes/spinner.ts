import { cva, type VariantProps } from "../cva.js";

/**
 * Spinner: ring `size`. An indeterminate spinner has no progress value, so
 * the size is the only choice a consumer makes; the colour follows the text
 * around it.
 */
export const spinnerRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/** Spinner's ring size. */
export type SpinnerSize = NonNullable<VariantProps<typeof spinnerRecipe.variants>["size"]>;
