import { Splitter } from "@moderno-ui/react";

export function SplitterDemo() {
  return (
    <Splitter.Root
      panels={[
        { id: "files", minSize: 20 },
        { id: "editor", minSize: 30 },
      ]}
      defaultSize={[30, 70]}
    >
      <Splitter.Panel id="files">Files</Splitter.Panel>
      <Splitter.ResizeTrigger id="files:editor" aria-label="Resize files and editor">
        <Splitter.ResizeTriggerIndicator />
      </Splitter.ResizeTrigger>
      <Splitter.Panel id="editor">Editor</Splitter.Panel>
    </Splitter.Root>
  );
}
