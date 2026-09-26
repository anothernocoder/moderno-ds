import { cva, type VariantProps } from "../cva.js";

/**
 * Tabs: `variant` × `size` on the root, which the list, its triggers and the
 * indicator follow. `line` underlines the selected tab on a bordered list;
 * `enclosed` lifts it as a pill out of a muted bar. Orientation, activation
 * and the selected value are Ark's own props; selected and disabled surface
 * as Ark's `data-selected` / `data-disabled`, not variants.
 */
export const tabsRecipe = cva({
  variants: {
    variant: ["line", "enclosed"],
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { variant: "line", size: "md" },
});

/** Tabs' visual style (`line`, `enclosed`), shared by the list and its triggers. */
export type TabsVariant = NonNullable<VariantProps<typeof tabsRecipe.variants>["variant"]>;

/** Tabs' density (trigger height and type), shared by every trigger. */
export type TabsSize = NonNullable<VariantProps<typeof tabsRecipe.variants>["size"]>;
