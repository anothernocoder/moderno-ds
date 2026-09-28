/** @jsxImportSource solid-js */
import { ColorPicker } from "@moderno-ui/solid";

export function ColorPickerSizesDemo() {
  return (
    <div class="demo-row">
      <ColorPicker size="sm" defaultValue="#1E90FF" />
      <ColorPicker size="md" defaultValue="#1E90FF" />
      <ColorPicker size="lg" defaultValue="#1E90FF" />
    </div>
  );
}
