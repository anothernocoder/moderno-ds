/**
 * A disabled, checked Checkbox — inert, and dimmed across every part —
 * @moderno-ui/react.
 */
import { Checkbox } from "@moderno-ui/react";

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
