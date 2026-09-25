/**
 * PinInput at its three sizes, side by side — size on PinInput.Root sizes
 * every cell — @moderno-ui/react.
 */
import { PinInput } from "@moderno-ui/react";

const cells = [0, 1, 2, 3];

export function PinInputSizesDemo() {
  return (
    <div className="demo-row">
      <PinInput.Root count={cells.length} size="sm">
        <PinInput.Label>Small</PinInput.Label>
        <PinInput.Control>
          {cells.map((index) => (
            <PinInput.Input key={index} index={index} />
          ))}
        </PinInput.Control>
      </PinInput.Root>
      <PinInput.Root count={cells.length} size="md">
        <PinInput.Label>Medium</PinInput.Label>
        <PinInput.Control>
          {cells.map((index) => (
            <PinInput.Input key={index} index={index} />
          ))}
        </PinInput.Control>
      </PinInput.Root>
      <PinInput.Root count={cells.length} size="lg">
        <PinInput.Label>Large</PinInput.Label>
        <PinInput.Control>
          {cells.map((index) => (
            <PinInput.Input key={index} index={index} />
          ))}
        </PinInput.Control>
      </PinInput.Root>
    </div>
  );
}
