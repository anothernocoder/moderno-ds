import { cva, type VariantProps } from "../cva.js";

/**
 * Splitter: `variant` on the root, which every panel and resize trigger
 * follows. `line` sets the panels side by side with a rule between them;
 * `enclosed` holds them in one bordered box. There is no `size` variant:
 * Ark's Root already takes `size` for the panels' controlled sizes.
 * Orientation, the panels and their sizes are Ark's own props; dragging,
 * focus and disabled surface as Ark's `data-*`, not variants.
 */
export const splitterRecipe = cva({
  variants: {
    variant: ["line", "enclosed"],
  },
  defaultVariants: { variant: "line" },
});

/** Splitter's visual style (`line`, `enclosed`), shared by the panels and triggers. */
export type SplitterVariant = NonNullable<VariantProps<typeof splitterRecipe.variants>["variant"]>;
