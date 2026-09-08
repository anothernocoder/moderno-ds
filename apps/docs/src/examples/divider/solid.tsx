/** @jsxImportSource solid-js */
/**
 * Divider — a bare rule, the three label alignments, and vertical rules
 * (bare and captioned) — @moderno-ui/solid, the same demo every framework's
 * example shows.
 *
 * See examples/button/solid.tsx for why the pragma above is required.
 */
import { Divider } from "@moderno-ui/solid";

export function DividerDemo() {
  return (
    <>
      <div class="divider-stack">
        <Divider />
        <Divider>Or continue with</Divider>
        <Divider align="start">Recent</Divider>
        <Divider align="end">Archive</Divider>
      </div>

      <div class="divider-inline">
        <span>Overview</span>
        <Divider orientation="vertical" />
        <span>Activity</span>
        <Divider orientation="vertical">or</Divider>
        <span>Settings</span>
      </div>
    </>
  );
}
