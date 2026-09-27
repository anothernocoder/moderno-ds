import { ColorPicker } from "@moderno-ui/react";

export function ColorPickerSizesDemo() {
  return (
    <div className="demo-row">
      <ColorPicker size="sm" defaultValue="#1E90FF" />
      <ColorPicker size="md" defaultValue="#1E90FF" />
      <ColorPicker size="lg" defaultValue="#1E90FF" />
    </div>
  );
}
