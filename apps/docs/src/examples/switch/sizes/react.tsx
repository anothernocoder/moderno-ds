import { Switch } from "@moderno-ui/react";

export function SwitchSizesDemo() {
  return (
    <div className="demo-row">
      <Switch.Root size="sm" defaultChecked>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Switch.Label>Small</Switch.Label>
        <Switch.HiddenInput />
      </Switch.Root>
      <Switch.Root size="md" defaultChecked>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Switch.Label>Medium</Switch.Label>
        <Switch.HiddenInput />
      </Switch.Root>
      <Switch.Root size="lg" defaultChecked>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Switch.Label>Large</Switch.Label>
        <Switch.HiddenInput />
      </Switch.Root>
    </div>
  );
}
