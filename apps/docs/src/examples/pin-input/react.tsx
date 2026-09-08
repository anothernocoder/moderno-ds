/**
 * PinInput across its three sizes plus the invalid state — @moderno-ui/react,
 * the same demo every framework's example shows.
 */
import { PinInput } from "@moderno-ui/react";

const cells = [0, 1, 2, 3, 4, 5];

export function PinInputDemo() {
  return (
    <>
      <div className="demo-row">
        <PinInput.Root count={cells.length} otp size="md">
          <PinInput.Label>Verification code</PinInput.Label>
          <PinInput.Control>
            {cells.map((index) => (
              <PinInput.Input key={index} index={index} />
            ))}
          </PinInput.Control>
          <PinInput.HiddenInput />
        </PinInput.Root>
      </div>

      <div className="demo-row">
        <PinInput.Root count={4} size="sm" defaultValue={["1", "2", "3", "4"]}>
          <PinInput.Label>Small, complete</PinInput.Label>
          <PinInput.Control>
            {[0, 1, 2, 3].map((index) => (
              <PinInput.Input key={index} index={index} />
            ))}
          </PinInput.Control>
        </PinInput.Root>

        <PinInput.Root count={4} size="lg" mask>
          <PinInput.Label>Large, masked</PinInput.Label>
          <PinInput.Control>
            {[0, 1, 2, 3].map((index) => (
              <PinInput.Input key={index} index={index} />
            ))}
          </PinInput.Control>
        </PinInput.Root>

        <PinInput.Root count={4} invalid defaultValue={["9", "9", "9", "9"]}>
          <PinInput.Label>Invalid</PinInput.Label>
          <PinInput.Control>
            {[0, 1, 2, 3].map((index) => (
              <PinInput.Input key={index} index={index} />
            ))}
          </PinInput.Control>
        </PinInput.Root>
      </div>
    </>
  );
}
