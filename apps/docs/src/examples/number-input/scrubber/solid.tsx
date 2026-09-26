/** @jsxImportSource solid-js */
import { NumberInput } from "@moderno-ui/solid";

export function NumberInputScrubberDemo() {
  return (
    <NumberInput.Root defaultValue="320" min={0}>
      <NumberInput.Label>Width</NumberInput.Label>
      <NumberInput.Control>
        <NumberInput.Scrubber aria-hidden="true">↔</NumberInput.Scrubber>
        <NumberInput.Input />
        <NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger>
        <NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger>
      </NumberInput.Control>
    </NumberInput.Root>
  );
}
