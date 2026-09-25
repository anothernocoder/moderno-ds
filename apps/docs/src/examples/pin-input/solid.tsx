/** @jsxImportSource solid-js */
/**
 * A six-digit one-time code at the default size; the hidden input carries
 * the joined code into a form — @moderno-ui/solid.
 *
 * See examples/button/solid.tsx for why the pragma above is required.
 */
import { For } from "solid-js";
import { PinInput } from "@moderno-ui/solid";

const cells = [0, 1, 2, 3, 4, 5];

export function PinInputDemo() {
  return (
    <PinInput.Root count={cells.length} otp>
      <PinInput.Label>Verification code</PinInput.Label>
      <PinInput.Control>
        <For each={cells}>{(index) => <PinInput.Input index={index} />}</For>
      </PinInput.Control>
      <PinInput.HiddenInput />
    </PinInput.Root>
  );
}
