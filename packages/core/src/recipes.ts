/**
 * Component recipes — the variant tables shared by every framework binding.
 *
 * A recipe is just a `cva` instance: it maps public props to deterministic
 * `data-*` attributes on a component's root part. Recipes live in `@moderno/core`
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

/** Select: control `size` (the trigger/menu density). Selection state is Ark's. */
export const selectRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
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
