/** @jsxImportSource solid-js */
import { createSignal } from "solid-js";
import { ColorPicker } from "@moderno-ui/solid";

export function ColorPickerControlledDemo() {
  const [color, setColor] = createSignal("#1E90FF");
  return (
    <div class="demo-row">
      <ColorPicker value={color()} onValueChange={(details) => setColor(details.value)} />
      <span style={{ color: color() }}>Aa</span>
    </div>
  );
}
