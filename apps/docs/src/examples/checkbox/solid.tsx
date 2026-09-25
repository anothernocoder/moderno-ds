/** @jsxImportSource solid-js */
import { Checkbox } from "@moderno-ui/solid";

export function CheckboxDemo() {
  return (
    <Checkbox.Root>
      <Checkbox.Control>
        <Checkbox.Indicator>✓</Checkbox.Indicator>
      </Checkbox.Control>
      <Checkbox.Label>Accept terms and conditions</Checkbox.Label>
      <Checkbox.HiddenInput />
    </Checkbox.Root>
  );
}
