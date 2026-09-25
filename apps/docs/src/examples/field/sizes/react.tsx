/**
 * Field at its three sizes, side by side — one size on Field.Root sizes
 * every part — @moderno-ui/react.
 */
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
