import { cva, type VariantProps } from "../cva.js";

/**
 * RadioGroup: `size` (the radio circle and the item text density).
 * Orientation is Ark's own `orientation` prop, stamped as `data-orientation`;
 * checked, disabled, invalid and read-only are Ark's `data-state`/`data-*`.
 * None of them is a variant.
 */
export const radioGroupRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/** RadioGroup's density (radio circle and item text). */
export type RadioGroupSize = NonNullable<VariantProps<typeof radioGroupRecipe.variants>["size"]>;
