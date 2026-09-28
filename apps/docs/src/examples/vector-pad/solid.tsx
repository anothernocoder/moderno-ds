/** @jsxImportSource solid-js */
import { VectorPad } from "@moderno-ui/solid";

export function VectorPadDemo() {
  return (
    <VectorPad.Root>
      <VectorPad.Label>Offset</VectorPad.Label>
      <VectorPad.Control>
        <VectorPad.Thumb />
      </VectorPad.Control>
      <VectorPad.Input axis="x" />
      <VectorPad.Input axis="y" />
    </VectorPad.Root>
  );
}
