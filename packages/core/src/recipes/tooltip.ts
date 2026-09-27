import { cva, type VariantProps } from "../cva.js";

/**
 * Tooltip: `size` — the padding, type and arrow of the content. Ark's
 * Tooltip.Root renders no element of its own, so the bindings take `size` on
 * the Root and hand it to the Content, the surface that carries `data-size`.
 * Open/closed, the placement side and an instant open are Ark's own
 * `data-state`, `data-side` and `data-instant`; delays and positioning are
 * Ark's props.
 */
export const tooltipRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/** Tooltip's density: the content's padding, type and arrow. */
export type TooltipSize = NonNullable<VariantProps<typeof tooltipRecipe.variants>["size"]>;
