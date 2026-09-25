import { Checkbox } from "@moderno-ui/react";

export function CheckboxSizesDemo() {
  return (
    <div className="demo-row">
      <Checkbox.Root size="sm" defaultChecked>
        <Checkbox.Control>
          <Checkbox.Indicator>✓</Checkbox.Indicator>
        </Checkbox.Control>
        <Checkbox.Label>Small</Checkbox.Label>
        <Checkbox.HiddenInput />
      </Checkbox.Root>
      <Checkbox.Root size="md" defaultChecked>
        <Checkbox.Control>
          <Checkbox.Indicator>✓</Checkbox.Indicator>
        </Checkbox.Control>
        <Checkbox.Label>Medium</Checkbox.Label>
        <Checkbox.HiddenInput />
      </Checkbox.Root>
      <Checkbox.Root size="lg" defaultChecked>
        <Checkbox.Control>
          <Checkbox.Indicator>✓</Checkbox.Indicator>
        </Checkbox.Control>
        <Checkbox.Label>Large</Checkbox.Label>
        <Checkbox.HiddenInput />
      </Checkbox.Root>
    </div>
  );
}
