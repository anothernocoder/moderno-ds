/**
 * @moderno/svelte — Svelte 5 bindings (and the docs island runtime).
 *
 * Ark UI provides headless behaviour; `@moderno/core` recipes map props to
 * `data-*`; `@moderno/css` (the shared `components.css`) paints everything from
 * token slots. Components ship no styling of their own — import the CSS once:
 *
 *   import "@moderno/css";
 */
import { Select as ArkSelect } from "@ark-ui/svelte";
import SelectRoot from "./SelectRoot.svelte";

export { default as Button } from "./Button.svelte";

/**
 * Field — re-exported from `@ark-ui/svelte`. Ark wires `label[for]` ↔ control
 * `id` and emits `data-invalid`/`data-disabled`/`data-required`; the shared
 * `components.css` dresses that native output, no recipe needed.
 */
export { Field } from "@ark-ui/svelte";

/**
 * Dialog + Portal — re-exported from `@ark-ui/svelte` (portal + focus trap +
 * SSR-stable ids). Composed as
 * `Root > Trigger + Portal(> Backdrop + Positioner > Content)`.
 */
export { Dialog, Portal } from "@ark-ui/svelte";

/**
 * Select — only `Root` is wrapped (to inject the `size` recipe); every other
 * part is Ark's verbatim. Annotated so the emitted `.d.ts` doesn't inline an
 * un-nameable `@zag-js` type (TS2742).
 */
export const Select: Omit<typeof ArkSelect, "Root"> & { Root: typeof SelectRoot } = {
  ...ArkSelect,
  Root: SelectRoot,
};

export { createListCollection } from "@ark-ui/svelte";

export type { SelectValueChangeDetails } from "@ark-ui/svelte";
