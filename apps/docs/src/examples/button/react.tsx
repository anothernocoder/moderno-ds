/**
 * Button across its variants and sizes — @moderno-ui/react, the same demo
 * every framework's example shows. Painted by @moderno-ui/css from the
 * active theme; no styling in this file.
 */
import { Button } from "@moderno-ui/react";

export function ButtonDemo() {
  return (
    <>
      <div className="demo-row">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
      </div>
      <div className="demo-row">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
    </>
  );
}
