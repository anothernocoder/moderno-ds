import { Divider } from "@moderno-ui/react";

export function DividerVerticalDemo() {
  return (
    <div className="demo-row">
      <span>Overview</span>
      <Divider orientation="vertical" />
      <span>Activity</span>
      <Divider orientation="vertical" />
      <span>Settings</span>
    </div>
  );
}
