<script lang="ts">
  import { Toolbar, type ToolbarOrientation, type ToolbarSize } from "../../src/index.js";

  let {
    orientation,
    size,
    dir,
    onUndo,
    onRedo,
    onBoldChange,
  }: {
    orientation?: ToolbarOrientation;
    size?: ToolbarSize;
    dir?: "ltr" | "rtl";
    onUndo?: () => void;
    onRedo?: () => void;
    onBoldChange?: (pressed: boolean) => void;
  } = $props();
</script>

<button type="button">Before</button>
<Toolbar.Root aria-label="Canvas tools" {orientation} {size} {dir} class="tools">
  <Toolbar.Button label="Undo" shortcut="⌘Z" onclick={() => onUndo?.()}>
    <svg aria-hidden="true"></svg>
  </Toolbar.Button>
  <Toolbar.Button label="Redo" disabled onclick={() => onRedo?.()}>
    <svg aria-hidden="true"></svg>
  </Toolbar.Button>
  <Toolbar.Separator />
  <Toolbar.Group aria-label="Text style">
    <Toolbar.Toggle label="Bold" onPressedChange={(pressed) => onBoldChange?.(pressed)}>
      <svg aria-hidden="true"></svg>
    </Toolbar.Toggle>
    <Toolbar.Toggle label="Italic" defaultPressed>
      <svg aria-hidden="true"></svg>
    </Toolbar.Toggle>
  </Toolbar.Group>
  <span>100%</span>
  <Toolbar.Button>Share</Toolbar.Button>
</Toolbar.Root>
<button type="button">After</button>
