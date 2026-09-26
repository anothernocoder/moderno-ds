import { cva, type VariantProps } from "../cva.js";

/** Select: control `size` (the trigger/menu density). Selection state is Ark's. */
export const selectRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/** Select's control density (trigger/menu). Selection state stays Ark's. */
export type SelectSize = NonNullable<VariantProps<typeof selectRecipe.variants>["size"]>;
