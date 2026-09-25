/** @jsxImportSource solid-js */
import { Field } from "@moderno-ui/solid";

export function FieldInvalidDemo() {
  return (
    <Field.Root invalid>
      <Field.Label>Workspace URL</Field.Label>
      <Field.Input placeholder="acme" value="not a url" />
      <Field.ErrorText>Use lowercase letters, numbers and dashes.</Field.ErrorText>
    </Field.Root>
  );
}
