import { cva, type VariantProps } from "../cva.js";

/**
 * Progress: `size` on the root — the thickness of a linear track, or the
 * diameter and stroke of a circle, and the type of the label and value text.
 * Linear or circular is the anatomy the consumer composes (Track + Range, or
 * Circle), not a variant. The value, min, max and orientation are Ark's own
 * props; loading, complete and indeterminate surface as Ark's `data-state`.
 */
export const progressRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/** Progress' density (track thickness, circle size, type), shared by every part. */
export type ProgressSize = NonNullable<VariantProps<typeof progressRecipe.variants>["size"]>;
