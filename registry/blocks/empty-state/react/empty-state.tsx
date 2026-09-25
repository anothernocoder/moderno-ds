import { Button } from "@moderno-ui/react";

export function EmptyState() {
  return (
    <div className="moderno-block-empty">
      <h2>No projects yet</h2>
      <p>Create your first project to get started.</p>
      <Button type="button">New project</Button>
    </div>
  );
}
