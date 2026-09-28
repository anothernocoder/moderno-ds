/** @jsxImportSource solid-js */
import { createSignal, For } from "solid-js";
import { SortableList } from "@moderno-ui/solid";

export function SortableListDisabledDemo() {
  const [slides, setSlides] = createSignal(["Cover", "Logo", "Colors", "Fonts"]);
  return (
    <SortableList.Root
      items={slides()}
      onReorder={(details) => setSlides(details.items)}
      aria-label="Slides"
    >
      <For each={slides()}>
        {(slide) => (
          <SortableList.Item value={slide} disabled={slide === "Cover"}>
            <SortableList.ItemHandle />
            <SortableList.ItemTrigger>{slide}</SortableList.ItemTrigger>
          </SortableList.Item>
        )}
      </For>
    </SortableList.Root>
  );
}
