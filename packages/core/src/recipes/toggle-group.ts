import { cva, type VariantProps } from "../cva.js";

/**
 * ToggleGroup: `variant` × `size` on the root, which every item follows.
 * `ghost` sets the items apart; `outline` holds them in one bordered bar.
 * Orientation and single/multiple selection are Ark's own `orientation` and
 * `multiple` props; pressed and disabled are Ark's `data-state`/`data-*`.
 */
export const toggleGroupRecipe = cva({
  variants: {
    variant: ["ghost", "outline"],
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { variant: "ghost", size: "md" },
});

/** ToggleGroup's visual style (`ghost`, `outline`), shared by its items. */
export type ToggleGroupVariant = NonNullable<
  VariantProps<typeof toggleGroupRecipe.variants>["variant"]
>;

/** ToggleGroup's density, shared by its items. */
export type ToggleGroupSize = NonNullable<VariantProps<typeof toggleGroupRecipe.variants>["size"]>;
