/** @jsxImportSource solid-js */
import { NumberInput } from "@moderno-ui/solid";

export function NumberInputDemo() {
  return (
    <NumberInput.Root defaultValue="1" min={1} max={10}>
      <NumberInput.Label>Quantity</NumberInput.Label>
      <NumberInput.Control>
        <NumberInput.Input />
        <NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger>
        <NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger>
      </NumberInput.Control>
    </NumberInput.Root>
  );
}
