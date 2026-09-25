/** @jsxImportSource solid-js */
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
