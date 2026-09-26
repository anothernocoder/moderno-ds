/** @jsxImportSource solid-js */
import { Switch } from "@moderno-ui/solid";

export function SwitchSizesDemo() {
  return (
    <div class="demo-row">
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
