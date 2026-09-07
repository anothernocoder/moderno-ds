/**
 * Component recipes — the variant tables shared by every framework binding.
 *
 * A recipe is just a `cva` instance: it maps public props to deterministic
 * `data-*` attributes on a component's root part. Recipes live in `@moderno-ui/core`
 * (not in the React/Vue/Svelte/Solid packages) so all bindings resolve variants
 * identically — the framework only differs in how it spreads the attributes onto
 * markup. `components.css` styles those attributes; the recipe and the stylesheet
 * are the two halves of one contract.
 *
 * Visual states that Ark already tracks (invalid, disabled, highlighted, open)
 * are NOT recipe variants — they surface as Ark's own `data-*` attributes and
 * are styled directly. Recipes only carry the choices a consumer makes via props.
 */

import { cva, type VariantProps } from "./cva.js";

/** Button: visual `variant` × `size`. The canonical recipe Phases 3–4 replicate. */
export const buttonRecipe = cva({
  variants: {
    variant: ["primary", "secondary", "outline", "ghost", "destructive"],
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { variant: "primary", size: "md" },
});

/**
 * Checkbox: control `size` (the box + label density). Checked, indeterminate,
 * disabled and invalid are Ark's own `data-state`/`data-*`, not variants.
 */
export const checkboxRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/** Select: control `size` (the trigger/menu density). Selection state is Ark's. */
export const selectRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/**
 * Field: control `size` — the density of the whole field (label, control,
 * helper/error text), carried on the root so one attribute sizes every part.
 * Invalid/disabled/required stay Ark's own data-attributes, not variants.
 */
export const fieldRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

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

/*
 * The variant unions, derived once beside the recipes. Bindings import these
 * names instead of re-deriving them from the recipe tables — a recipe change
 * ripples to every framework through this seam.
 */

/** Button's visual style (`primary`, `outline`, …). */
export type ButtonVariant = NonNullable<VariantProps<typeof buttonRecipe.variants>["variant"]>;

/** Button's control density. */
export type ButtonSize = NonNullable<VariantProps<typeof buttonRecipe.variants>["size"]>;

/** Select's control density (trigger/menu). Selection state stays Ark's. */
export type SelectSize = NonNullable<VariantProps<typeof selectRecipe.variants>["size"]>;

/** Checkbox's control density (box + label). Checked state stays Ark's. */
export type CheckboxSize = NonNullable<VariantProps<typeof checkboxRecipe.variants>["size"]>;

/** Field's control density (label, input/textarea, helper and error text). */
export type FieldSize = NonNullable<VariantProps<typeof fieldRecipe.variants>["size"]>;

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
