/**
 * Field — re-exported verbatim from `@ark-ui/vue`.
 *
 * Ark's Field machine wires `label[for]` ↔ control `id`, mirrors
 * `aria-invalid`/`aria-describedby`, and emits `data-invalid`/`data-disabled`/
 * `data-required` on every part. Those Ark attributes — not CVA variants — are
 * the styling hooks, so there is no recipe; the shared `components.css` dresses
 * Ark's native output identically to React. `Field.Root` emits
 * `data-scope="field" data-part="root"`.
 */
export { Field } from "@ark-ui/vue";
export type {
  FieldRootProps,
  FieldLabelProps,
  FieldInputProps,
  FieldTextareaProps,
  FieldHelperTextProps,
  FieldErrorTextProps,
} from "@ark-ui/vue";
