/** @jsxImportSource solid-js */
import { Badge } from "@moderno-ui/solid";

export function BadgeStatusesDemo() {
  return (
    <div class="demo-row">
      <Badge variant="info">Info</Badge>
      <Badge variant="success">Paid</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="error">Overdue</Badge>
    </div>
  );
}
