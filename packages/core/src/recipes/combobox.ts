import { cva, type VariantProps } from "../cva.js";

/**
 * Combobox: control `size` — the height of the input box and the type of the
 * label, the input and its buttons. The items, the filter, the value,
 * `multiple` and the open state are Ark's own props; focus, invalid,
 * disabled, a highlighted or checked item and an empty list surface as Ark's
 * `data-*`.
 */
export const comboboxRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/** Combobox's control density (box height, type), set on the root. */
export type ComboboxSize = NonNullable<VariantProps<typeof comboboxRecipe.variants>["size"]>;
