/** @jsxImportSource solid-js */
/**
 * Button's four everyday variants, side by side — @moderno-ui/solid.
 *
 * See examples/button/solid.tsx for why the pragma above is required.
 */
import { Button } from "@moderno-ui/solid";

export function ButtonVariantsDemo() {
  return (
    <div class="demo-row">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  );
}
