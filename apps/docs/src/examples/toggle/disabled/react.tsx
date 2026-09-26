import { Toggle } from "@moderno-ui/react";

export function ToggleDisabledDemo() {
  return (
    <div className="demo-row">
      <Toggle.Root disabled>Off</Toggle.Root>
      <Toggle.Root disabled defaultPressed>
        On
      </Toggle.Root>
    </div>
  );
}
