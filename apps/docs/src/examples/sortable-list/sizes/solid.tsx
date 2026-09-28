/** @jsxImportSource solid-js */
import { createSignal, For } from "solid-js";
import { SortableList, type SortableListSize } from "@moderno-ui/solid";

function SizedList(props: { size: SortableListSize }) {
  const [slides, setSlides] = createSignal(["Cover", "Logo", "Colors"]);
  return (
    <SortableList.Root
      size={props.size}
      items={slides()}
      onReorder={(details) => setSlides(details.items)}
      aria-label={`Slides, ${props.size}`}
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

export function SortableListSizesDemo() {
  return (
    <div class="demo-row">
      <SizedList size="sm" />
      <SizedList size="md" />
      <SizedList size="lg" />
    </div>
  );
}
