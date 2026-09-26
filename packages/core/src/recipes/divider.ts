import { cva, type VariantProps } from "../cva.js";

/**
 * Divider: `orientation` (the rule's axis) × `align` (where an optional label
 * sits along it). Both are consumer choices, so both are recipe variants; the
 * rule itself is drawn by `components.css` from the `--border` slot.
 */
export const dividerRecipe = cva({
  variants: {
    orientation: ["horizontal", "vertical"],
    align: ["start", "center", "end"],
  },
  defaultVariants: { orientation: "horizontal", align: "center" },
});

/** Divider's axis (`horizontal`, `vertical`). */
export type DividerOrientation = NonNullable<
  VariantProps<typeof dividerRecipe.variants>["orientation"]
>;

/** Where a Divider's optional label sits along the rule. */
export type DividerAlign = NonNullable<VariantProps<typeof dividerRecipe.variants>["align"]>;
