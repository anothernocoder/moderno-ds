/** @jsxImportSource solid-js */
/**
 * A labelled input with helper text, at the default size — @moderno-
 * ui/solid.
 *
 * See examples/button/solid.tsx for why the pragma above is required.
 */
import { Field } from "@moderno-ui/solid";

export function FieldDemo() {
  return (
    <Field.Root>
      <Field.Label>Email</Field.Label>
      <Field.Input type="email" placeholder="you@example.com" />
      <Field.HelperText>We only use it to send receipts.</Field.HelperText>
    </Field.Root>
  );
}
