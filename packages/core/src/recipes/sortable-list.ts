import { cva, type VariantProps } from "../cva.js";

/**
 * SortableList: `size` on the root — each item's height, padding and type,
 * matched to Button's sizes. What moves, what is picked up and what is
 * disabled come from the sortable-list machine (`machines/sortable-list/`)
 * as its own `data-*`, not from the recipe.
 */
export const sortableListRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/** SortableList's density, shared by every item. */
export type SortableListSize = NonNullable<
  VariantProps<typeof sortableListRecipe.variants>["size"]
>;

/**
 * The handle's default icon, a grip of six dots, drawn the same by every
 * binding: an SVG of this `viewBox` with one circle of `radius` per dot. The
 * stylesheet sizes it; the dots fill with the text colour.
 */
export const sortableListGripIcon = {
  viewBox: "0 0 16 16",
  radius: 1.25,
  dots: [
    { cx: 6, cy: 4 },
    { cx: 10, cy: 4 },
    { cx: 6, cy: 8 },
    { cx: 10, cy: 8 },
    { cx: 6, cy: 12 },
    { cx: 10, cy: 12 },
  ],
} as const;
