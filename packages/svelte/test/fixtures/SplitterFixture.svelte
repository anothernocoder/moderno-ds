<script lang="ts">
  import { Splitter } from "../../src/index.js";
  import type {
    SplitterPanelData,
    SplitterResizeDetails,
    SplitterVariant,
  } from "../../src/index.js";

  let {
    variant = undefined,
    orientation = undefined,
    size = undefined,
    defaultSize = undefined,
    disabled = false,
    onResize = undefined,
  }: {
    variant?: SplitterVariant;
    orientation?: "horizontal" | "vertical";
    size?: number[];
    defaultSize?: number[];
    disabled?: boolean;
    onResize?: (details: SplitterResizeDetails) => void;
  } = $props();

  const panels: SplitterPanelData[] = [
    { id: "files", minSize: 20, collapsible: true, collapsedSize: 0 },
    { id: "editor", minSize: 30 },
  ];
</script>

<Splitter.Root {variant} {orientation} {panels} {size} {defaultSize} {onResize} class="workspace">
  <Splitter.Panel id="files">Files</Splitter.Panel>
  <Splitter.ResizeTrigger id="files:editor" aria-label="Resize files and editor" {disabled}>
    <Splitter.ResizeTriggerIndicator />
  </Splitter.ResizeTrigger>
  <Splitter.Panel id="editor">Editor</Splitter.Panel>
</Splitter.Root>
