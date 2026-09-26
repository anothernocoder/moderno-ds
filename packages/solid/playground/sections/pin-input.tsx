/**
 * PinInput — n cells whose ids and aria labels are derived from the root id
 * and `count`, so the server must know the cell count too.
 */
import { For } from "solid-js";
import { PinInput } from "../../src/pin-input.jsx";
import type { Section } from "../section.js";

// A six-digit one-time code: the cell indices the PinInput renders. `count` on
// the Root tells Ark the same number so the server-rendered aria labels match.
const CODE_CELLS = [0, 1, 2, 3, 4, 5];

const PinInputSection: Section = () => (
  <section aria-label="pin-input">
    <PinInput.Root count={CODE_CELLS.length} otp size="md">
      <PinInput.Label>Verification code</PinInput.Label>
      <PinInput.Control>
        <For each={CODE_CELLS}>{(index) => <PinInput.Input index={index} />}</For>
      </PinInput.Control>
      <PinInput.HiddenInput />
    </PinInput.Root>
  </section>
);

export default PinInputSection;
