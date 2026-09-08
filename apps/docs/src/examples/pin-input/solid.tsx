/** @jsxImportSource solid-js */
/**
 * PinInput across its three sizes plus the invalid state —
 * @moderno-ui/solid, the same demo every framework's example shows.
 *
 * See examples/button/solid.tsx for why the pragma above is required.
 */
import { For } from "solid-js";
import { PinInput } from "@moderno-ui/solid";

const cells = [0, 1, 2, 3, 4, 5];

export function PinInputDemo() {
  return (
    <>
      <div class="demo-row">
        <PinInput.Root count={cells.length} otp size="md">
          <PinInput.Label>Verification code</PinInput.Label>
          <PinInput.Control>
            <For each={cells}>{(index) => <PinInput.Input index={index} />}</For>
          </PinInput.Control>
          <PinInput.HiddenInput />
        </PinInput.Root>
      </div>

      <div class="demo-row">
        <PinInput.Root count={4} size="sm" defaultValue={["1", "2", "3", "4"]}>
          <PinInput.Label>Small, complete</PinInput.Label>
          <PinInput.Control>
            <For each={[0, 1, 2, 3]}>{(index) => <PinInput.Input index={index} />}</For>
          </PinInput.Control>
        </PinInput.Root>

        <PinInput.Root count={4} size="lg" mask>
          <PinInput.Label>Large, masked</PinInput.Label>
          <PinInput.Control>
            <For each={[0, 1, 2, 3]}>{(index) => <PinInput.Input index={index} />}</For>
          </PinInput.Control>
        </PinInput.Root>

        <PinInput.Root count={4} invalid defaultValue={["9", "9", "9", "9"]}>
          <PinInput.Label>Invalid</PinInput.Label>
          <PinInput.Control>
            <For each={[0, 1, 2, 3]}>{(index) => <PinInput.Input index={index} />}</For>
          </PinInput.Control>
        </PinInput.Root>
      </div>
    </>
  );
}
