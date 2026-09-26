/** @jsxImportSource solid-js */
import { Progress } from "@moderno-ui/solid";

export function ProgressVerticalDemo() {
  return (
    <Progress.Root defaultValue={70} orientation="vertical">
      <Progress.Label>Storage</Progress.Label>
      <Progress.ValueText />
      <Progress.Track>
        <Progress.Range />
      </Progress.Track>
    </Progress.Root>
  );
}
