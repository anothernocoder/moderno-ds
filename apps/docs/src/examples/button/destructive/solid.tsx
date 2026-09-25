/** @jsxImportSource solid-js */
/**
 * A destructive Button beside the outline escape hatch it is usually
 * paired with — @moderno-ui/solid.
 *
 * See examples/button/solid.tsx for why the pragma above is required.
 */
import { Button } from "@moderno-ui/solid";

export function ButtonDestructiveDemo() {
  return (
    <div class="demo-row">
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Delete project</Button>
    </div>
  );
}
