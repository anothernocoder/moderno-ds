/** @jsxImportSource solid-js */
/**
 * An alphanumeric PinInput — letters and digits are both accepted, and the
 * cells use a text keyboard — @moderno-ui/solid.
 *
 * See examples/button/solid.tsx for why the pragma above is required.
 */
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
