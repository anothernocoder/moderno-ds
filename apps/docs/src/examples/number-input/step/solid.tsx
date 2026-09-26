/** @jsxImportSource solid-js */
import { NumberInput } from "@moderno-ui/solid";

export function NumberInputStepDemo() {
  return (
    <NumberInput.Root defaultValue="30" min={0} max={120} step={15}>
      <NumberInput.Label>Minutes</NumberInput.Label>
      <NumberInput.Control>
        <NumberInput.Input />
        <NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger>
        <NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger>
      </NumberInput.Control>
    </NumberInput.Root>
  );
}
