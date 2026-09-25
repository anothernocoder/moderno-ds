/** @jsxImportSource solid-js */
/**
 * Bare vertical Dividers between inline items — each rule takes its length
 * from the row — @moderno-ui/solid.
 *
 * See examples/button/solid.tsx for why the pragma above is required.
 */
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
