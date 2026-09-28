import { useState } from "react";
import { Toolbar } from "@moderno-ui/react";

function Icon({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

export function ToolbarReadoutDemo() {
  const [zoom, setZoom] = useState(100);
  return (
    <Toolbar.Root aria-label="Zoom">
      <Toolbar.Button label="Zoom out" onClick={() => setZoom(Math.max(25, zoom - 25))}>
        <Icon d="M5 12h14" />
      </Toolbar.Button>
      <span aria-live="polite">{zoom}%</span>
      <Toolbar.Button label="Zoom in" onClick={() => setZoom(Math.min(400, zoom + 25))}>
        <Icon d="M5 12h14M12 5v14" />
      </Toolbar.Button>
    </Toolbar.Root>
  );
}
