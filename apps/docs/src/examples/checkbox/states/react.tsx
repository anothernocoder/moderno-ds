/**
 * Checkbox in its three states — unchecked, checked and indeterminate —
 * side by side — @moderno-ui/react.
 */
import { Checkbox } from "@moderno-ui/react";

export function CheckboxStatesDemo() {
  return (
    <div className="demo-row">
      <Checkbox.Root>
        <Checkbox.Control>
          <Checkbox.Indicator>✓</Checkbox.Indicator>
          <Checkbox.Indicator indeterminate>–</Checkbox.Indicator>
        </Checkbox.Control>
        <Checkbox.Label>Unchecked</Checkbox.Label>
        <Checkbox.HiddenInput />
      </Checkbox.Root>
      <Checkbox.Root defaultChecked>
        <Checkbox.Control>
          <Checkbox.Indicator>✓</Checkbox.Indicator>
          <Checkbox.Indicator indeterminate>–</Checkbox.Indicator>
        </Checkbox.Control>
        <Checkbox.Label>Checked</Checkbox.Label>
        <Checkbox.HiddenInput />
      </Checkbox.Root>
      <Checkbox.Root defaultChecked="indeterminate">
        <Checkbox.Control>
          <Checkbox.Indicator>✓</Checkbox.Indicator>
          <Checkbox.Indicator indeterminate>–</Checkbox.Indicator>
        </Checkbox.Control>
        <Checkbox.Label>Indeterminate</Checkbox.Label>
        <Checkbox.HiddenInput />
      </Checkbox.Root>
    </div>
  );
}
