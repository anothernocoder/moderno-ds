/**
 * Bare vertical Dividers between inline items — each rule takes its length
 * from the row — @moderno-ui/react.
 */
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
