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

export function ToolbarSizesDemo() {
  return (
    <div className="demo-row">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Toolbar.Root key={size} aria-label={`History, ${size}`} size={size}>
          <Toolbar.Button label="Undo">
            <Icon d="M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
          </Toolbar.Button>
          <Toolbar.Button label="Redo">
            <Icon d="m15 14 5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H13" />
          </Toolbar.Button>
        </Toolbar.Root>
      ))}
    </div>
  );
}
