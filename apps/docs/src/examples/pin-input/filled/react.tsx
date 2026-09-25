/**
 * Filled cells tint toward the primary colour; once every cell holds a
 * character the whole code turns primary — @moderno-ui/react.
 */
import { PinInput } from "@moderno-ui/react";

const cells = [0, 1, 2, 3];

export function PinInputFilledDemo() {
  return (
    <div className="demo-row">
      <PinInput.Root count={cells.length} defaultValue={["4", "2"]}>
        <PinInput.Label>Partly filled</PinInput.Label>
        <PinInput.Control>
          {cells.map((index) => (
            <PinInput.Input key={index} index={index} />
          ))}
        </PinInput.Control>
      </PinInput.Root>
      <PinInput.Root count={cells.length} defaultValue={["4", "2", "1", "7"]}>
        <PinInput.Label>Complete</PinInput.Label>
        <PinInput.Control>
          {cells.map((index) => (
            <PinInput.Input key={index} index={index} />
          ))}
        </PinInput.Control>
      </PinInput.Root>
    </div>
  );
}
