import { Switch } from "@moderno-ui/react";

export function SwitchDisabledDemo() {
  return (
    <Switch.Root disabled defaultChecked>
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      <Switch.Label>Sync over mobile data</Switch.Label>
      <Switch.HiddenInput />
    </Switch.Root>
  );
}
