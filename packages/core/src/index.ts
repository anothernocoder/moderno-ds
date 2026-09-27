/**
 * @moderno-ui/core — framework-agnostic core.
 *
 * CVA (props → deterministic data-attributes), class utilities, the component
 * recipes, the Zag machines for behaviour Ark does not ship (ADR-0010), the
 * screen-reader announcer, and the shared `styles/components.css` skeleton. No
 * framework imports: each framework package binds the machines itself.
 */

export { cva } from "./cva.js";
export type { Cva, CvaConfig, VariantProps, VariantsDef } from "./cva.js";

export { cx, partAttrs } from "./utils.js";
export type { ClassValue } from "./utils.js";

export { serverDocument } from "./server-document.js";
export type { ServerDocument } from "./server-document.js";

export { announce } from "./announce.js";
export type { AnnounceOptions, AnnouncePoliteness } from "./announce.js";

// Every recipe and its variant types. `recipes.ts` is written by `pnpm gen`
// from `recipes/*.ts`, so a new component adds its recipe file, not a name here.
export * from "./recipes.js";

// Every machine, one namespace each. `machines.ts` is written by `pnpm gen`
// from `machines/*/index.ts`, so a new machine adds its folder, not a name here.
export * from "./machines.js";
