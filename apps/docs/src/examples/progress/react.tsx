import { Progress } from "@moderno-ui/react";

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
