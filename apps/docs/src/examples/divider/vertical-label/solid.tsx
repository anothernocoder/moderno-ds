/** @jsxImportSource solid-js */
/**
 * A captioned vertical Divider between two alternative fields — the
 * caption turns sideways and the rule runs the height of the row —
 * @moderno-ui/solid.
 *
 * See examples/button/solid.tsx for why the pragma above is required.
 */
import { Divider, Field } from "@moderno-ui/solid";

export function DividerVerticalLabelDemo() {
  return (
    <div class="demo-row">
      <Field.Root>
        <Field.Label>Phone</Field.Label>
        <Field.Input type="tel" placeholder="+1 555 0100" />
        <Field.HelperText>We text you a code.</Field.HelperText>
      </Field.Root>
      <Divider orientation="vertical">or</Divider>
      <Field.Root>
        <Field.Label>Email</Field.Label>
        <Field.Input type="email" placeholder="you@example.com" />
        <Field.HelperText>We email you a link.</Field.HelperText>
      </Field.Root>
    </div>
  );
}
