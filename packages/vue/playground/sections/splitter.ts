/**
 * Splitter — Ark's splitter machine: each panel's inline flex size from
 * `defaultSize`, and each resize trigger's separator role, value, bounds and
 * `aria-controls` ids must match both ways.
 */
import { h } from "vue";
import { Splitter } from "../../src/splitter.js";
import type { Section } from "../section.js";

const SplitterSection: Section = () =>
  h("section", { "aria-label": "splitter" }, [
    h(
      Splitter.Root,
      {
        panels: [
          { id: "files", minSize: 20 },
          { id: "editor", minSize: 30 },
        ],
        defaultSize: [30, 70],
      },
      () => [
        h(Splitter.Panel, { id: "files" }, () => "Files"),
        h(
          Splitter.ResizeTrigger,
          { id: "files:editor", "aria-label": "Resize files and editor" },
          () => h(Splitter.ResizeTriggerIndicator),
        ),
        h(Splitter.Panel, { id: "editor" }, () => "Editor"),
      ],
    ),
    h(
      Splitter.Root,
      {
        variant: "enclosed",
        orientation: "vertical",
        panels: [{ id: "code" }, { id: "console", collapsible: true, minSize: 20 }],
        defaultSize: [75, 25],
      },
      () => [
        h(Splitter.Panel, { id: "code" }, () => "Code"),
        h(
          Splitter.ResizeTrigger,
          { id: "code:console", "aria-label": "Resize code and console" },
          () => h(Splitter.ResizeTriggerIndicator),
        ),
        h(Splitter.Panel, { id: "console" }, () => "Console"),
      ],
    ),
  ]);

export default SplitterSection;
