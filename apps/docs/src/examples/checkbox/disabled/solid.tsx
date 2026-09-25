/** @jsxImportSource solid-js */
/**
 * A disabled, checked Checkbox — inert, and dimmed across every part —
 * @moderno-ui/solid.
 *
 * See examples/button/solid.tsx for why the pragma above is required.
 */
import { Checkbox } from "@moderno-ui/solid";

export function CheckboxDisabledDemo() {
  return (
    <Checkbox.Root disabled defaultChecked>
      <Checkbox.Control>
        <Checkbox.Indicator>✓</Checkbox.Indicator>
      </Checkbox.Control>
      <Checkbox.Label>Share usage analytics</Checkbox.Label>
      <Checkbox.HiddenInput />
    </Checkbox.Root>
  );
}
