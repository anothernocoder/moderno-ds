/**
 * Field — form control + accessibility, on top of the Button pattern.
 *
 * Ark's Field machine owns the hard parts: it wires `label[for]` ↔ control `id`,
 * mirrors `aria-invalid`/`aria-describedby`, and exposes `data-invalid` /
 * `data-disabled` / `data-required` on every part. Those Ark data-attributes —
 * not CVA variants — are the styling hooks, so there is no recipe here; the
 * error/disabled appearance lives entirely in `components.css`.
 *
 * We re-export Ark's namespace verbatim: the binding's whole job is to prove the
 * shared stylesheet dresses Ark's native output. `Field.Root` emits
 * `data-scope="field" data-part="root"`; the CSS does the rest.
 */
export { Field } from "@ark-ui/react";
export type {
  FieldRootProps,
  FieldLabelProps,
  FieldInputProps,
  FieldTextareaProps,
  FieldHelperTextProps,
  FieldErrorTextProps,
} from "@ark-ui/react";
