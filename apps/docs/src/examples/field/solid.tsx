/** @jsxImportSource solid-js */
/**
 * Field across its three sizes, both controls, and the invalid/disabled
 * states — @moderno-ui/solid, the same demo every framework's example shows.
 *
 * See examples/button/solid.tsx for why the pragma above is required.
 */
import { Field } from "@moderno-ui/solid";

export function FieldDemo() {
  return (
    <div class="demo-stack">
      <Field.Root size="sm">
        <Field.Label>Email</Field.Label>
        <Field.Input placeholder="you@example.com" />
        <Field.HelperText>Small — dense forms and filter bars.</Field.HelperText>
      </Field.Root>

      <Field.Root size="md">
        <Field.Label>Full name</Field.Label>
        <Field.Input placeholder="Ada Lovelace" />
        <Field.HelperText>Medium — the default.</Field.HelperText>
      </Field.Root>

      <Field.Root size="lg" invalid>
        <Field.Label>Workspace URL</Field.Label>
        <Field.Input placeholder="acme" value="not a url" />
        <Field.ErrorText>Use lowercase letters, numbers and dashes.</Field.ErrorText>
      </Field.Root>

      <Field.Root size="md">
        <Field.Label>Bio</Field.Label>
        <Field.Textarea placeholder="Tell us about yourself" />
        <Field.HelperText>Textarea grows vertically; the size sets its floor.</Field.HelperText>
      </Field.Root>

      <Field.Root size="md" disabled>
        <Field.Label>Plan</Field.Label>
        <Field.Input value="Enterprise" />
        <Field.HelperText>Disabled — managed by your administrator.</Field.HelperText>
      </Field.Root>
    </div>
  );
}
