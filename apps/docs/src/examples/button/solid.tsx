/** @jsxImportSource solid-js */
/**
 * Button across its variants and sizes — @moderno-ui/solid, the same demo
 * every framework's example shows. Painted by @moderno-ui/css from the
 * active theme; no styling in this file.
 *
 * The `@jsxImportSource` pragma above is required in every Solid example:
 * `astro check` type-checks every .tsx under the docs with one project-wide
 * JSX setting (React's, since that's the framework the docs' own tsconfig
 * assumes), and this is the per-file escape hatch TypeScript gives for a
 * Solid file living next to React ones.
 */
import { Button } from "@moderno-ui/solid";

export function ButtonDemo() {
  return (
    <>
      <div class="demo-row">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
      </div>
      <div class="demo-row">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
    </>
  );
}
