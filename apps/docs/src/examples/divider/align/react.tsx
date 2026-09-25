import { Divider } from "@moderno-ui/react";

export function DividerAlignDemo() {
  return (
    <div className="demo-stack">
      <Divider align="start">Start</Divider>
      <Divider align="center">Center</Divider>
      <Divider align="end">End</Divider>
    </div>
  );
}
