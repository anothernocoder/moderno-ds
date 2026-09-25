import { Button } from "@moderno-ui/solid";

export function EmptyState() {
  return (
    <div class="moderno-block-empty">
      <h2>No projects yet</h2>
      <p>Create your first project to get started.</p>
      <Button type="button">New project</Button>
    </div>
  );
}
