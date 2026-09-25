/**
 * A Field with a Textarea — same wiring, a minimum height, vertical resize
 * only — @moderno-ui/react.
 */
import { Field } from "@moderno-ui/react";

export function FieldTextareaDemo() {
  return (
    <Field.Root>
      <Field.Label>Bio</Field.Label>
      <Field.Textarea placeholder="Tell us about yourself" />
      <Field.HelperText>A few sentences is plenty.</Field.HelperText>
    </Field.Root>
  );
}
