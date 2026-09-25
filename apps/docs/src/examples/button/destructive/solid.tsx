/** @jsxImportSource solid-js */
import { Button } from "@moderno-ui/solid";

export function ButtonDestructiveDemo() {
  return (
    <div class="demo-row">
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Delete project</Button>
    </div>
  );
}
