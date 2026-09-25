/** @jsxImportSource solid-js */
/**
 * A masked PinInput — the cells render as password inputs — @moderno-
 * ui/solid.
 *
 * See examples/button/solid.tsx for why the pragma above is required.
 */
import { For } from "solid-js";
import { PinInput } from "@moderno-ui/solid";

const cells = [0, 1, 2, 3];

export function PinInputMaskedDemo() {
  return (
    <PinInput.Root count={cells.length} mask defaultValue={["7", "3"]}>
      <PinInput.Label>PIN</PinInput.Label>
      <PinInput.Control>
        <For each={cells}>{(index) => <PinInput.Input index={index} />}</For>
      </PinInput.Control>
    </PinInput.Root>
  );
}
