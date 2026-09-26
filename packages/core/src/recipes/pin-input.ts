import { cva, type VariantProps } from "../cva.js";

/**
 * PinInput: cell `size` (the width/height of every code cell). Everything else
 * the one-time-code input expresses visually — a filled cell, a complete code,
 * an invalid entry, a disabled control — is Ark's own `data-filled` /
 * `data-complete` / `data-invalid` / `data-disabled`, not a variant.
 */
export const pinInputRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/** PinInput's cell density. Filled/complete/invalid stay Ark's. */
export type PinInputSize = NonNullable<VariantProps<typeof pinInputRecipe.variants>["size"]>;
