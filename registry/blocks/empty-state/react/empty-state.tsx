import { Button } from "@moderno/react";

/**
 * EmptyState — an ejected block: a centered placeholder shown when a list or
 * view has no data, with a primary call to action. Copy it into your project
 * and edit freely. Themed via CSS variables from the design system; no
 * hardcoded colors, radii, or fonts live here.
 */
export function EmptyState() {
  return (
    <div className="moderno-block-empty">
      <h2>No projects yet</h2>
      <p>Create your first project to get started.</p>
      <Button type="button">New project</Button>
    </div>
  );
}
