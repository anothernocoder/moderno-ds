/** @jsxImportSource solid-js */
/**
 * Field at its three sizes, side by side — one size on Field.Root sizes
 * every part — @moderno-ui/solid.
 *
 * See examples/button/solid.tsx for why the pragma above is required.
 */
import { Field } from "@moderno-ui/solid";

export function FieldSizesDemo() {
  return (
    <div class="demo-row">
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
