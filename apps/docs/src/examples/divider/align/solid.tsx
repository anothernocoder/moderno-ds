/** @jsxImportSource solid-js */
import { Divider } from "@moderno-ui/solid";

export function DividerAlignDemo() {
  return (
    <div class="demo-stack">
      <Divider align="start">Start</Divider>
      <Divider align="center">Center</Divider>
      <Divider align="end">End</Divider>
    </div>
  );
}
