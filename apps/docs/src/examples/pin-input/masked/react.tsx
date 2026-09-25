import { PinInput } from "@moderno-ui/react";

const cells = [0, 1, 2, 3];

export function PinInputMaskedDemo() {
  return (
    <PinInput.Root count={cells.length} mask defaultValue={["7", "3"]}>
      <PinInput.Label>PIN</PinInput.Label>
      <PinInput.Control>
        {cells.map((index) => (
          <PinInput.Input key={index} index={index} />
        ))}
      </PinInput.Control>
    </PinInput.Root>
  );
}
