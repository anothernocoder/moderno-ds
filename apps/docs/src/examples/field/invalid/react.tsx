import { Field } from "@moderno-ui/react";

export function FieldInvalidDemo() {
  return (
    <Field.Root invalid>
      <Field.Label>Workspace URL</Field.Label>
      <Field.Input placeholder="acme" defaultValue="not a url" />
      <Field.ErrorText>Use lowercase letters, numbers and dashes.</Field.ErrorText>
    </Field.Root>
  );
}
