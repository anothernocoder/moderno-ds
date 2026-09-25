import { Switch } from "@moderno-ui/react";

export function SwitchDemo() {
  return (
    <Switch.Root>
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      <Switch.Label>Email notifications</Switch.Label>
      <Switch.HiddenInput />
    </Switch.Root>
  );
}
