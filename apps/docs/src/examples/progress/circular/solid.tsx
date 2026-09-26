/** @jsxImportSource solid-js */
import { Progress } from "@moderno-ui/solid";

export function ProgressCircularDemo() {
  return (
    <Progress.Root defaultValue={75}>
      <Progress.Circle>
        <Progress.CircleTrack />
        <Progress.CircleRange />
      </Progress.Circle>
      <Progress.ValueText />
    </Progress.Root>
  );
}
