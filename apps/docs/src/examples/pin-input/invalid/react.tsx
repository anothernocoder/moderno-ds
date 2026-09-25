import { PinInput } from "@moderno-ui/react";

const cells = [0, 1, 2, 3];

export function PinInputInvalidDemo() {
  return (
    <PinInput.Root count={cells.length} invalid defaultValue={["9", "9", "9", "9"]}>
      <PinInput.Label>Verification code</PinInput.Label>
      <PinInput.Control>
        {cells.map((index) => (
          <PinInput.Input key={index} index={index} />
        ))}
      </PinInput.Control>
    </PinInput.Root>
  );
}
