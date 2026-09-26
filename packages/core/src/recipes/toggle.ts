import { cva, type VariantProps } from "../cva.js";

/**
 * Toggle: visual `variant` × `size` for a button that stays pressed. `ghost`
 * has no fill at rest; `outline` draws a border. Pressed and disabled are
 * Ark's own `data-state="on|off"` / `data-disabled`, not variants.
 */
export const toggleRecipe = cva({
  variants: {
    variant: ["ghost", "outline"],
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { variant: "ghost", size: "md" },
});

/** Toggle's visual style (`ghost`, `outline`). */
export type ToggleVariant = NonNullable<VariantProps<typeof toggleRecipe.variants>["variant"]>;

/** Toggle's control density. */
export type ToggleSize = NonNullable<VariantProps<typeof toggleRecipe.variants>["size"]>;
