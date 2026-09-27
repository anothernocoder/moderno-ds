/**
 * Splitter — Ark's splitter machine: each panel's inline flex size from
 * `defaultSize`, and each resize trigger's separator role, value, bounds and
 * `aria-controls` ids must match both ways.
 */
import { Splitter } from "../../src/splitter.jsx";
import type { Section } from "../section.js";

const SplitterSection: Section = () => (
  <section aria-label="splitter">
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
    <Splitter.Root
      variant="enclosed"
      orientation="vertical"
      panels={[{ id: "code" }, { id: "console", collapsible: true, minSize: 20 }]}
      defaultSize={[75, 25]}
    >
      <Splitter.Panel id="code">Code</Splitter.Panel>
      <Splitter.ResizeTrigger id="code:console" aria-label="Resize code and console">
        <Splitter.ResizeTriggerIndicator />
      </Splitter.ResizeTrigger>
      <Splitter.Panel id="console">Console</Splitter.Panel>
    </Splitter.Root>
  </section>
);

export default SplitterSection;
