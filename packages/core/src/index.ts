/**
 * @moderno-ui/core — framework-agnostic core.
 *
 * CVA (props → deterministic data-attributes), class utilities, the component
 * recipes, and the shared `styles/components.css` skeleton. No DOM, no
 * framework imports.
 */

export { cva } from "./cva.js";
export type { Cva, CvaConfig, VariantProps, VariantsDef } from "./cva.js";

export { cx, partAttrs } from "./utils.js";
export type { ClassValue } from "./utils.js";

// Every recipe and its variant types. `recipes.ts` is written by `pnpm gen`
// from `recipes/*.ts`, so a new component adds its recipe file, not a name here.
export * from "./recipes.js";
