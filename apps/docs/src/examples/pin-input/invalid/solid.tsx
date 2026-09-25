/** @jsxImportSource solid-js */
import { For } from "solid-js";
import { PinInput } from "@moderno-ui/solid";

const cells = [0, 1, 2, 3];

export function PinInputInvalidDemo() {
  return (
    <PinInput.Root count={cells.length} invalid defaultValue={["9", "9", "9", "9"]}>
      <PinInput.Label>Verification code</PinInput.Label>
      <PinInput.Control>
        <For each={cells}>{(index) => <PinInput.Input index={index} />}</For>
      </PinInput.Control>
    </PinInput.Root>
  );
}
