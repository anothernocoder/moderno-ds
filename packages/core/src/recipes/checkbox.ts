import { cva, type VariantProps } from "../cva.js";

/**
 * Checkbox: control `size` (the box + label density). Checked, indeterminate,
 * disabled and invalid are Ark's own `data-state`/`data-*`, not variants.
 */
export const checkboxRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/** Checkbox's control density (box + label). Checked state stays Ark's. */
export type CheckboxSize = NonNullable<VariantProps<typeof checkboxRecipe.variants>["size"]>;
