/** @jsxImportSource solid-js */
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
