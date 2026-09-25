/** @jsxImportSource solid-js */
/**
 * One Button at the recipe defaults (primary, md) — @moderno-ui/solid.
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
    <Button>Save changes</Button>
  );
}
