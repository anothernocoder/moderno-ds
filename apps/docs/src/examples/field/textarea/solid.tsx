/** @jsxImportSource solid-js */
import { Field } from "@moderno-ui/solid";

export function FieldTextareaDemo() {
  return (
    <Field.Root>
      <Field.Label>Bio</Field.Label>
      <Field.Textarea placeholder="Tell us about yourself" />
      <Field.HelperText>A few sentences is plenty.</Field.HelperText>
    </Field.Root>
  );
}
