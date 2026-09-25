/** @jsxImportSource solid-js */
/**
 * One labelled Checkbox, unchecked, at the default size —
 * @moderno-ui/solid.
 *
 * See examples/button/solid.tsx for why the pragma above is required.
 */
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
