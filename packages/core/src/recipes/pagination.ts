import { cva, type VariantProps } from "../cva.js";

/**
 * Pagination: `size` on the root — the height and type of the page buttons,
 * the prev/next/first/last triggers and the ellipsis. The page count, current
 * page, page size, sibling and boundary counts are Ark's own props; the
 * current page surfaces as Ark's `data-selected` and `aria-current`, and a
 * trigger with nowhere to go is disabled by Ark.
 */
export const paginationRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/** Pagination's density (button height, type), shared by every part. */
export type PaginationSize = NonNullable<VariantProps<typeof paginationRecipe.variants>["size"]>;
