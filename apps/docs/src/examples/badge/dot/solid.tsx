/** @jsxImportSource solid-js */
import { Badge } from "@moderno-ui/solid";

export function BadgeDotDemo() {
  return (
    <div class="demo-row">
      <Badge variant="success" dot>Live</Badge>
      <Badge variant="warning" dot>Degraded</Badge>
      <Badge variant="outline" dot>Draft</Badge>
    </div>
  );
}
