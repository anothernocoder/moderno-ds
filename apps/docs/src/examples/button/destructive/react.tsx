import { Button } from "@moderno-ui/react";

export function ButtonDestructiveDemo() {
  return (
    <div className="demo-row">
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Delete project</Button>
    </div>
  );
}
