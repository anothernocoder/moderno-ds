import { useState } from "react";
import { ColorPicker } from "@moderno-ui/react";

export function ColorPickerControlledDemo() {
  const [color, setColor] = useState("#1E90FF");
  return (
    <div className="demo-row">
      <ColorPicker value={color} onValueChange={(details) => setColor(details.value)} />
      <span style={{ color }}>Aa</span>
    </div>
  );
}
