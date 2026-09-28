import { VectorPad } from "@moderno-ui/react";

export function VectorPadInvertYDemo() {
  return (
    <VectorPad.Root min={0} max={100} defaultValue={{ x: 30, y: 20 }} invertY>
      <VectorPad.Label>Focal point</VectorPad.Label>
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
