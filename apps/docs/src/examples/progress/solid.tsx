/** @jsxImportSource solid-js */
import { Progress } from "@moderno-ui/solid";

export function ProgressDemo() {
  return (
    <Progress.Root defaultValue={60}>
      <Progress.Label>Uploading photos</Progress.Label>
      <Progress.ValueText />
      <Progress.Track>
        <Progress.Range />
      </Progress.Track>
    </Progress.Root>
  );
}
