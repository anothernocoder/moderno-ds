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

import { cva } from "./cva.js";

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
