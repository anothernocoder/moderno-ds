/** @jsxImportSource solid-js */
/**
 * A labelled Divider at each of its three label alignments —
 * @moderno-ui/solid.
 *
 * See examples/button/solid.tsx for why the pragma above is required.
 */
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
