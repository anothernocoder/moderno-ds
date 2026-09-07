/**
 * @moderno-ui/core — framework-agnostic core.
 *
 * CVA (props → deterministic data-attributes), class utilities, and the shared
 * `styles/components.css` skeleton. No DOM, no framework imports.
 */

export { cva } from "./cva.js";
export type { Cva, CvaConfig, VariantProps, VariantsDef } from "./cva.js";

export { cx, partAttrs } from "./utils.js";
export type { ClassValue } from "./utils.js";

export { buttonRecipe, checkboxRecipe, selectRecipe, fieldRecipe } from "./recipes.js";
export type { ButtonVariant, ButtonSize, CheckboxSize, SelectSize, FieldSize } from "./recipes.js";
