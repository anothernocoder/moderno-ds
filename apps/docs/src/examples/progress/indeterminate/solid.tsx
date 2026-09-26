/** @jsxImportSource solid-js */
import { Progress } from "@moderno-ui/solid";

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
