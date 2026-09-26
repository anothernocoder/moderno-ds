/** @jsxImportSource solid-js */
import { Switch } from "@moderno-ui/solid";

export function SwitchStatesDemo() {
  return (
    <div class="demo-row">
      <Switch.Root>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Switch.Label>Off</Switch.Label>
        <Switch.HiddenInput />
      </Switch.Root>
      <Switch.Root defaultChecked>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Switch.Label>On</Switch.Label>
        <Switch.HiddenInput />
      </Switch.Root>
    </div>
  );
}
