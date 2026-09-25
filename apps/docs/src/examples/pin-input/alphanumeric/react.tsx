/**
 * An alphanumeric PinInput — letters and digits are both accepted, and the
 * cells use a text keyboard — @moderno-ui/react.
 */
import { PinInput } from "@moderno-ui/react";

const cells = [0, 1, 2, 3, 4, 5];

export function PinInputAlphanumericDemo() {
  return (
    <PinInput.Root count={cells.length} type="alphanumeric">
      <PinInput.Label>Recovery code</PinInput.Label>
      <PinInput.Control>
        {cells.map((index) => (
          <PinInput.Input key={index} index={index} />
        ))}
      </PinInput.Control>
    </PinInput.Root>
  );
}
