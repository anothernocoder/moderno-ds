import { Indicator } from "@moderno-ui/react";

export function IndicatorDotOnlyDemo() {
  return (
    <div className="demo-row">
      <Indicator variant="success" aria-label="Online" />
      <Indicator variant="error" size="sm" aria-label="Offline" />
    </div>
  );
}
