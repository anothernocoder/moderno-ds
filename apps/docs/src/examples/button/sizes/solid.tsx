/** @jsxImportSource solid-js */
/**
 * Button at its three sizes, side by side — @moderno-ui/solid.
 *
 * See examples/button/solid.tsx for why the pragma above is required.
 */
import { Button } from "@moderno-ui/solid";

export function ButtonSizesDemo() {
  return (
    <div class="demo-row">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  );
}
