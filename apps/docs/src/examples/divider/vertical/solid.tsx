/** @jsxImportSource solid-js */
import { Divider } from "@moderno-ui/solid";

export function DividerVerticalDemo() {
  return (
    <div class="demo-row">
      <span>Overview</span>
      <Divider orientation="vertical" />
      <span>Activity</span>
      <Divider orientation="vertical" />
      <span>Settings</span>
    </div>
  );
}
