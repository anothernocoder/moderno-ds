/** @jsxImportSource solid-js */
import { Progress } from "@moderno-ui/solid";

export function ProgressRangeDemo() {
  return (
    <Progress.Root defaultValue={3} max={5}>
      <Progress.Label>Profile setup</Progress.Label>
      <Progress.ValueText>3 of 5 steps</Progress.ValueText>
      <Progress.Track>
        <Progress.Range />
      </Progress.Track>
    </Progress.Root>
  );
}
