import { Badge } from "@moderno-ui/react";

export function BadgeDotDemo() {
  return (
    <div className="demo-row">
      <Badge variant="success" dot>Live</Badge>
      <Badge variant="warning" dot>Degraded</Badge>
      <Badge variant="outline" dot>Draft</Badge>
    </div>
  );
}
