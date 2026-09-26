import { Switch } from "@moderno-ui/react";

export function SwitchInvalidDemo() {
  return (
    <Switch.Root invalid>
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      <Switch.Label>Share my location</Switch.Label>
      <Switch.HiddenInput />
    </Switch.Root>
  );
}
