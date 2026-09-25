/** @jsxImportSource solid-js */
/**
 * An invalid Checkbox — the box border re-colours from --destructive —
 * @moderno-ui/solid.
 *
 * See examples/button/solid.tsx for why the pragma above is required.
 */
import { Checkbox } from "@moderno-ui/solid";

export function CheckboxInvalidDemo() {
  return (
    <Checkbox.Root invalid>
      <Checkbox.Control>
        <Checkbox.Indicator>✓</Checkbox.Indicator>
      </Checkbox.Control>
      <Checkbox.Label>Accept terms and conditions</Checkbox.Label>
      <Checkbox.HiddenInput />
    </Checkbox.Root>
  );
}
