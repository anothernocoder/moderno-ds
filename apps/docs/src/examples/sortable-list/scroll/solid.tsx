/** @jsxImportSource solid-js */
import { createSignal, For } from "solid-js";
import { SortableList } from "@moderno-ui/solid";

export function SortableListScrollDemo() {
  const [slides, setSlides] = createSignal([
    "Cover",
    "Agenda",
    "Logo",
    "Colors",
    "Fonts",
    "Icons",
    "Photos",
    "Tone of voice",
    "Layouts",
    "Contact",
  ]);
  return (
    <SortableList.Root
      items={slides()}
      onReorder={(details) => setSlides(details.items)}
      style={{ "max-height": "12rem", "overflow-y": "auto" }}
      aria-label="Slides"
    >
      <For each={slides()}>
        {(slide) => (
          <SortableList.Item value={slide}>
            <SortableList.ItemHandle />
            <SortableList.ItemTrigger>{slide}</SortableList.ItemTrigger>
          </SortableList.Item>
        )}
      </For>
    </SortableList.Root>
  );
}
