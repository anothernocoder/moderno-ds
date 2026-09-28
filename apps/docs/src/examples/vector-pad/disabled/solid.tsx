/** @jsxImportSource solid-js */
import { VectorPad } from "@moderno-ui/solid";

export function VectorPadDisabledDemo() {
  return (
    <VectorPad.Root defaultValue={{ x: 40, y: 20 }} disabled>
      <VectorPad.Label>Offset</VectorPad.Label>
      <VectorPad.Control>
        <VectorPad.Thumb />
      </VectorPad.Control>
      <VectorPad.Input axis="x" />
      <VectorPad.Input axis="y" />
    </VectorPad.Root>
  );
}
