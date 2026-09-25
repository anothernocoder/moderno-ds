/** @jsxImportSource solid-js */
import { For } from "solid-js";
import { PinInput } from "@moderno-ui/solid";

const cells = [0, 1, 2, 3];

export function PinInputFilledDemo() {
  return (
    <div class="demo-row">
      <PinInput.Root count={cells.length} defaultValue={["4", "2"]}>
        <PinInput.Label>Partly filled</PinInput.Label>
        <PinInput.Control>
          <For each={cells}>{(index) => <PinInput.Input index={index} />}</For>
        </PinInput.Control>
      </PinInput.Root>
      <PinInput.Root count={cells.length} defaultValue={["4", "2", "1", "7"]}>
        <PinInput.Label>Complete</PinInput.Label>
        <PinInput.Control>
          <For each={cells}>{(index) => <PinInput.Input index={index} />}</For>
        </PinInput.Control>
      </PinInput.Root>
    </div>
  );
}
