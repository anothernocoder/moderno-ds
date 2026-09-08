/**
 * The invalid-state snippet shown under "Input and Textarea" on the Field
 * page — illustrative only (no live demo attached), but still a real,
 * typechecked file rather than a string literal in the page (CONTEXT.md
 * "Example": "never a literal inside the page").
 */
import { Field } from "@moderno-ui/react";

export function FieldInvalidSnippet({ hasError }: { hasError: boolean }) {
  return (
    <Field.Root invalid={hasError}>
      <Field.Label>Email</Field.Label>
      <Field.Input type="email" />
      <Field.ErrorText>Enter a valid email.</Field.ErrorText>
    </Field.Root>
  );
}
