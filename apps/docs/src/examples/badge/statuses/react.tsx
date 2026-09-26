import { Badge } from "@moderno-ui/react";

export function BadgeStatusesDemo() {
  return (
    <div className="demo-row">
      <Badge variant="info">Info</Badge>
      <Badge variant="success">Paid</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="error">Overdue</Badge>
    </div>
  );
}
