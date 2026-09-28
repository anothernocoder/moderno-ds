import { cva, type VariantProps } from "../cva.js";

/**
 * VectorPad: `size` on the root — the pad's side, the number fields' height
 * and the type of the label, matched to the Field sizes. The value, range,
 * step, `invertY`, disabled, read-only and invalid are the machine's own
 * props (`vectorPad.machine`); dragging, disabled, read-only and invalid
 * surface as its `data-*` on every part.
 */
export const vectorPadRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/** VectorPad's density (pad side, field height, type), shared by every part. */
export type VectorPadSize = NonNullable<VariantProps<typeof vectorPadRecipe.variants>["size"]>;
