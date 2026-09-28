/**
 * SortableList — the sortable-list machine from core on a <ul>: the recipe
 * on the root, the Tab stop on the first trigger, the handles' names, a
 * disabled item and a disabled list must reach the server.
 */
import { For } from "solid-js";
import { SortableList } from "../../src/sortable-list.jsx";
import type { Section } from "../section.js";

const SLIDES = [
  { value: "title", label: "Title" },
  { value: "logo", label: "Logo" },
  { value: "colors", label: "Colors" },
];

const SortableListSection: Section = () => (
  <section aria-label="sortable lists">
    <SortableList.Root defaultItems={SLIDES.map((slide) => slide.value)} aria-label="Slides">
      <For each={SLIDES}>
        {(slide) => (
          <SortableList.Item
            value={slide.value}
            label={slide.label}
            disabled={slide.value === "title"}
          >
            <SortableList.ItemHandle />
            <SortableList.ItemTrigger>{slide.label}</SortableList.ItemTrigger>
          </SortableList.Item>
        )}
      </For>
    </SortableList.Root>
    <SortableList.Root size="sm" disabled defaultItems={["a", "b"]} aria-label="Layers">
      <SortableList.Item value="a">
        <SortableList.ItemTrigger>A</SortableList.ItemTrigger>
      </SortableList.Item>
      <SortableList.Item value="b">
        <SortableList.ItemTrigger>B</SortableList.ItemTrigger>
      </SortableList.Item>
    </SortableList.Root>
  </section>
);

export default SortableListSection;
