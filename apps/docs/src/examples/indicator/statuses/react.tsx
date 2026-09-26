import { Indicator } from "@moderno-ui/react";

export function IndicatorStatusesDemo() {
  return (
    <div className="demo-row">
      <Indicator variant="neutral">Idle</Indicator>
      <Indicator variant="info">Syncing</Indicator>
      <Indicator variant="success">Online</Indicator>
      <Indicator variant="warning">Degraded</Indicator>
      <Indicator variant="error">Offline</Indicator>
    </div>
  );
}
