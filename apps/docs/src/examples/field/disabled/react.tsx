/**
 * A disabled Field — every part dims, the control is inert — @moderno-
 * ui/react.
 */
import { Field } from "@moderno-ui/react";

export function FieldDisabledDemo() {
  return (
    <Field.Root disabled>
      <Field.Label>Plan</Field.Label>
      <Field.Input defaultValue="Enterprise" />
      <Field.HelperText>Managed by your administrator.</Field.HelperText>
    </Field.Root>
  );
}
