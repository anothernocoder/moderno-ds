import { Field } from "@moderno-ui/react";

export function FieldSizesDemo() {
  return (
    <div className="demo-row">
      <Field.Root size="sm">
        <Field.Label>Small</Field.Label>
        <Field.Input placeholder="sm" />
      </Field.Root>
      <Field.Root size="md">
        <Field.Label>Medium</Field.Label>
        <Field.Input placeholder="md" />
      </Field.Root>
      <Field.Root size="lg">
        <Field.Label>Large</Field.Label>
        <Field.Input placeholder="lg" />
      </Field.Root>
    </div>
  );
}
