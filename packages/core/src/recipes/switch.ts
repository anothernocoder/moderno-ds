import { cva, type VariantProps } from "../cva.js";

/**
 * Switch: control `size` (the track, thumb and label density). On/off,
 * disabled, invalid and read-only are Ark's own `data-state`/`data-*`, not
 * variants.
 */
export const switchRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/** Switch's density (track, thumb and label). */
export type SwitchSize = NonNullable<VariantProps<typeof switchRecipe.variants>["size"]>;
