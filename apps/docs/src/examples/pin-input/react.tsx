import { PinInput } from "@moderno-ui/react";

const cells = [0, 1, 2, 3, 4, 5];

export function PinInputDemo() {
  return (
    <PinInput.Root count={cells.length} otp>
      <PinInput.Label>Verification code</PinInput.Label>
      <PinInput.Control>
        {cells.map((index) => (
          <PinInput.Input key={index} index={index} />
        ))}
      </PinInput.Control>
      <PinInput.HiddenInput />
    </PinInput.Root>
  );
}
