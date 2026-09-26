/** @jsxImportSource solid-js */
import { Progress } from "@moderno-ui/solid";

export function ProgressSizesDemo() {
  return (
    <div class="demo-stack">
      <Progress.Root size="sm" defaultValue={25}>
        <Progress.Label>Small</Progress.Label>
        <Progress.ValueText />
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
      <Progress.Root size="md" defaultValue={50}>
        <Progress.Label>Medium</Progress.Label>
        <Progress.ValueText />
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
      <Progress.Root size="lg" defaultValue={75}>
        <Progress.Label>Large</Progress.Label>
        <Progress.ValueText />
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
    </div>
  );
}
