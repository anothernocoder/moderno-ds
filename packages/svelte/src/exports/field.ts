import { Field as ArkField } from "@ark-ui/svelte";
import FieldRoot from "../FieldRoot.svelte";

/**
 * Field — only `Root` is wrapped (to inject the `size` recipe); every other
 * part is Ark's verbatim. Ark wires `label[for]` ↔ control `id` and emits
 * `data-invalid`/`data-disabled`/`data-required`, which the shared
 * `components.css` styles directly. Annotated so the emitted `.d.ts` doesn't
 * inline an un-nameable `@zag-js` type (TS2742).
 */
export const Field: Omit<typeof ArkField, "Root"> & { Root: typeof FieldRoot } = {
  ...ArkField,
  Root: FieldRoot,
};
