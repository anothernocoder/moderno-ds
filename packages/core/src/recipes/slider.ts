import { cva, type VariantProps } from "../cva.js";

/**
 * Slider: `size` on the root — the track's thickness, the thumb's diameter
 * and the type of the label, value text and marks. One thumb or two (a range)
 * is how many values the consumer passes and how many `Thumb`s they render,
 * not a variant. The value, min, max, step, orientation and origin are Ark's
 * own props; dragging, focus, disabled and invalid surface as Ark's `data-*`.
 */
export const sliderRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/** Slider's density (track thickness, thumb size, type), shared by every part. */
export type SliderSize = NonNullable<VariantProps<typeof sliderRecipe.variants>["size"]>;
