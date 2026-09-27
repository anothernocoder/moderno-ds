import { cva, type VariantProps } from "../cva.js";

/**
 * Toast: `size` on the root — each toast's padding, gap and type. The
 * status is Ark's own `type` (`toaster.success(…)`, `toaster.error(…)`, …),
 * which lands on the root as `data-type`; placement, overlap and gap belong
 * to the toaster (`createToaster`) and land as `data-placement` /
 * `data-side` / `data-align`. Neither is a variant here.
 */
export const toastRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/** Toast's density: the root's padding, gap and type. */
export type ToastSize = NonNullable<VariantProps<typeof toastRecipe.variants>["size"]>;
