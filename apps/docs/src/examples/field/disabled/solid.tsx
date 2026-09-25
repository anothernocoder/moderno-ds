/** @jsxImportSource solid-js */
/**
 * A disabled Field — every part dims, the control is inert — @moderno-
 * ui/solid.
 *
 * See examples/button/solid.tsx for why the pragma above is required.
 */
import { Field } from "@moderno-ui/solid";

export function FieldDisabledDemo() {
  return (
    <Field.Root disabled>
      <Field.Label>Plan</Field.Label>
      <Field.Input value="Enterprise" />
      <Field.HelperText>Managed by your administrator.</Field.HelperText>
    </Field.Root>
  );
}
