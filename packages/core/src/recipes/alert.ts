import { cva, type VariantProps } from "../cva.js";

/**
 * Alert: status `variant` × `size`. There is no Ark machine — an alert is a
 * static region, so every attribute it carries comes from this recipe.
 * `components.css` tints the surface from the matching contract status slot
 * (`--info`/`--success`/`--warning`, and `--destructive` for `error`, so a
 * destructive action and an error message speak with one voice).
 */
export const alertRecipe = cva({
  variants: {
    variant: ["info", "success", "warning", "error"],
    size: ["sm", "md"],
  },
  defaultVariants: { variant: "info", size: "md" },
});

/** Alert's status (`info`, `success`, `warning`, `error`). */
export type AlertVariant = NonNullable<VariantProps<typeof alertRecipe.variants>["variant"]>;

/** Alert's density (`sm` compact, `md` default). */
export type AlertSize = NonNullable<VariantProps<typeof alertRecipe.variants>["size"]>;

/**
 * The ARIA role an Alert's root element takes for a status.
 *
 * Urgency is a property of the status, not a prop the consumer should have to
 * remember: `warning`/`error` interrupt (`role="alert"`, an assertive live
 * region), `info`/`success` report (`role="status"`, polite). It lives beside
 * the recipe so all four bindings resolve it identically — the same seam the
 * recipe itself provides for `data-*`. Consumers can still pass their own
 * `role`; every binding spreads consumer props over this default.
 */
export function alertRole(variant?: AlertVariant): "alert" | "status" {
  return variant === "warning" || variant === "error" ? "alert" : "status";
}
