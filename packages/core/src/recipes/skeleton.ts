import { cva, type VariantProps } from "../cva.js";

/**
 * Skeleton: the placeholder's `shape` — a line of `text`, a `rect` block or a
 * `circle` (an avatar). There is no size: a skeleton stands in for content the
 * consumer is about to render, so the consumer sizes it like that content.
 */
export const skeletonRecipe = cva({
  variants: {
    shape: ["text", "rect", "circle"],
  },
  defaultVariants: { shape: "text" },
});

/** Skeleton's placeholder shape (`text`, `rect`, `circle`). */
export type SkeletonShape = NonNullable<VariantProps<typeof skeletonRecipe.variants>["shape"]>;
