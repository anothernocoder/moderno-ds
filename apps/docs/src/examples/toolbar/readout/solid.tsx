/** @jsxImportSource solid-js */
import { createSignal } from "solid-js";
import { Toolbar } from "@moderno-ui/solid";

function Icon(props: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d={props.d} />
    </svg>
  );
}

export function ToolbarReadoutDemo() {
  const [zoom, setZoom] = createSignal(100);
  return (
    <Toolbar.Root aria-label="Zoom">
      <Toolbar.Button label="Zoom out" onClick={() => setZoom(Math.max(25, zoom() - 25))}>
        <Icon d="M5 12h14" />
      </Toolbar.Button>
      <span aria-live="polite">{zoom()}%</span>
      <Toolbar.Button label="Zoom in" onClick={() => setZoom(Math.min(400, zoom() + 25))}>
        <Icon d="M5 12h14M12 5v14" />
      </Toolbar.Button>
    </Toolbar.Root>
  );
}
