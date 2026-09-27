/** @jsxImportSource solid-js */
import { Splitter } from "@moderno-ui/solid";

export function SplitterCollapsibleDemo() {
  return (
    <Splitter.Root
      panels={[
        { id: "sidebar", minSize: 20, collapsible: true },
        { id: "main", minSize: 40 },
      ]}
      defaultSize={[30, 70]}
    >
      <Splitter.Panel id="sidebar">Sidebar</Splitter.Panel>
      <Splitter.ResizeTrigger id="sidebar:main" aria-label="Resize sidebar and main">
        <Splitter.ResizeTriggerIndicator />
      </Splitter.ResizeTrigger>
      <Splitter.Panel id="main">Main</Splitter.Panel>
    </Splitter.Root>
  );
}
