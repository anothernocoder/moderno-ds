/** @jsxImportSource solid-js */
import { Indicator } from "@moderno-ui/solid";

export function IndicatorDotOnlyDemo() {
  return (
    <div class="demo-row">
      <Indicator variant="success" aria-label="Online" />
      <Indicator variant="error" size="sm" aria-label="Offline" />
    </div>
  );
}
