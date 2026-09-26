import { Progress } from "@moderno-ui/react";

export function ProgressIndeterminateDemo() {
  return (
    <Progress.Root defaultValue={null}>
      <Progress.Label>Preparing your download</Progress.Label>
      <Progress.Track>
        <Progress.Range />
      </Progress.Track>
    </Progress.Root>
  );
}
