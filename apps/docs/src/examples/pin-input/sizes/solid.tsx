/** @jsxImportSource solid-js */
import { For } from "solid-js";
import { PinInput } from "@moderno-ui/solid";

const cells = [0, 1, 2, 3];

export function PinInputSizesDemo() {
  return (
    <div class="demo-row">
      <PinInput.Root count={cells.length} size="sm">
        <PinInput.Label>Small</PinInput.Label>
        <PinInput.Control>
          <For each={cells}>{(index) => <PinInput.Input index={index} />}</For>
        </PinInput.Control>
      </PinInput.Root>
      <PinInput.Root count={cells.length} size="md">
        <PinInput.Label>Medium</PinInput.Label>
        <PinInput.Control>
          <For each={cells}>{(index) => <PinInput.Input index={index} />}</For>
        </PinInput.Control>
      </PinInput.Root>
      <PinInput.Root count={cells.length} size="lg">
        <PinInput.Label>Large</PinInput.Label>
        <PinInput.Control>
          <For each={cells}>{(index) => <PinInput.Input index={index} />}</For>
        </PinInput.Control>
      </PinInput.Root>
    </div>
  );
}
