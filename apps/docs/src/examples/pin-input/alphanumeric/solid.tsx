/** @jsxImportSource solid-js */
import { For } from "solid-js";
import { PinInput } from "@moderno-ui/solid";

const cells = [0, 1, 2, 3, 4, 5];

export function PinInputAlphanumericDemo() {
  return (
    <PinInput.Root count={cells.length} type="alphanumeric">
      <PinInput.Label>Recovery code</PinInput.Label>
      <PinInput.Control>
        <For each={cells}>{(index) => <PinInput.Input index={index} />}</For>
      </PinInput.Control>
    </PinInput.Root>
  );
}
