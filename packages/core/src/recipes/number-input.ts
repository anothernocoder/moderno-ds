import { cva, type VariantProps } from "../cva.js";

/**
 * NumberInput: control `size` — the height of the bordered box, the width of
 * its stepper buttons and the type of the label and value. The value, min,
 * max, step and number format are Ark's own props; focus, disabled, invalid
 * and scrubbing surface as Ark's `data-*`, and a stepper at its bound is
 * disabled by Ark.
 */
export const numberInputRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/** NumberInput's density (box height, stepper width, type), shared by every part. */
export type NumberInputSize = NonNullable<VariantProps<typeof numberInputRecipe.variants>["size"]>;
