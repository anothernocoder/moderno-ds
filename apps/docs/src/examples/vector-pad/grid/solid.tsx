/** @jsxImportSource solid-js */
import { VectorPad } from "@moderno-ui/solid";

export function VectorPadGridDemo() {
  return (
    <VectorPad.Root>
      <VectorPad.Label>Light direction</VectorPad.Label>
      <VectorPad.Control>
        <VectorPad.Grid />
        <VectorPad.Crosshair />
        <VectorPad.Thumb />
      </VectorPad.Control>
      <VectorPad.Input axis="x" />
      <VectorPad.Input axis="y" />
    </VectorPad.Root>
  );
}
