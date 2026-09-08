/**
 * Divider — a bare rule, the three label alignments, and vertical rules
 * (bare and captioned) — @moderno-ui/react, the same demo every framework's
 * example shows.
 */
import { Divider } from "@moderno-ui/react";

export function DividerDemo() {
  return (
    <>
      <div className="divider-stack">
        <Divider />
        <Divider>Or continue with</Divider>
        <Divider align="start">Recent</Divider>
        <Divider align="end">Archive</Divider>
      </div>

      <div className="divider-inline">
        <span>Overview</span>
        <Divider orientation="vertical" />
        <span>Activity</span>
        <Divider orientation="vertical">or</Divider>
        <span>Settings</span>
      </div>
    </>
  );
}
