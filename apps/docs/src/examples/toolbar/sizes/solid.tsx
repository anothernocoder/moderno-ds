/** @jsxImportSource solid-js */
import { For } from "solid-js";
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

export function ToolbarSizesDemo() {
  return (
    <div class="demo-row">
      <For each={["sm", "md", "lg"] as const}>
        {(size) => (
          <Toolbar.Root aria-label={`History, ${size}`} size={size}>
            <Toolbar.Button label="Undo">
              <Icon d="M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
            </Toolbar.Button>
            <Toolbar.Button label="Redo">
              <Icon d="m15 14 5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H13" />
            </Toolbar.Button>
          </Toolbar.Root>
        )}
      </For>
    </div>
  );
}
