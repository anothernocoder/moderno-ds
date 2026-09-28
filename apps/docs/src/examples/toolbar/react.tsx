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

export function ToolbarDemo() {
  return (
    <Toolbar.Root aria-label="Canvas tools">
      <Toolbar.Button label="Undo" shortcut="⌘Z">
        <Icon d="M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
      </Toolbar.Button>
      <Toolbar.Button label="Redo" shortcut="⇧⌘Z">
        <Icon d="m15 14 5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H13" />
      </Toolbar.Button>
      <Toolbar.Separator />
      <Toolbar.Group aria-label="Text style">
        <Toolbar.Toggle label="Bold" shortcut="⌘B" defaultPressed>
          <Icon d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8" />
        </Toolbar.Toggle>
        <Toolbar.Toggle label="Italic" shortcut="⌘I">
          <Icon d="M19 4h-9M14 20H5M15 4 9 20" />
        </Toolbar.Toggle>
      </Toolbar.Group>
      <Toolbar.Separator />
      <Toolbar.Button label="Zoom out">
        <Icon d="M5 12h14" />
      </Toolbar.Button>
      <span>100%</span>
      <Toolbar.Button label="Zoom in">
        <Icon d="M5 12h14M12 5v14" />
      </Toolbar.Button>
    </Toolbar.Root>
  );
}
