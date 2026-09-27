import { cva, type VariantProps } from "../cva.js";

/**
 * Menu: `size` — the trigger's height and the density of the items. Ark's
 * Menu.Root renders no element, so the size is set on `Menu.Root` and lands on
 * the parts that draw: the trigger and the content. A submenu takes the size
 * of the menu it opens from, unless it sets its own. Open, highlighted,
 * checked and disabled are Ark's own `data-*` attributes.
 */
export const menuRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/** Menu's density: the trigger's height and the items' padding and type. */
export type MenuSize = NonNullable<VariantProps<typeof menuRecipe.variants>["size"]>;
