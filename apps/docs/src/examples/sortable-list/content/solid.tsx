/** @jsxImportSource solid-js */
import { createSignal, For } from "solid-js";
import { Avatar, Button, SortableList } from "@moderno-ui/solid";

export function SortableListContentDemo() {
  const [slides, setSlides] = createSignal(["Cover", "Logo", "Colors", "Fonts"]);
  const remove = (slide: string) => setSlides(slides().filter((other) => other !== slide));
  return (
    <SortableList.Root
      items={slides()}
      onReorder={(details) => setSlides(details.items)}
      aria-label="Slides"
    >
      <For each={slides()}>
        {(slide) => (
          <SortableList.Item value={slide}>
            <SortableList.ItemHandle />
            <Avatar.Root size="sm" shape="square">
              <Avatar.Fallback>{slide.slice(0, 2)}</Avatar.Fallback>
            </Avatar.Root>
            <SortableList.ItemTrigger>{slide}</SortableList.ItemTrigger>
            <Button variant="ghost" size="sm" onClick={() => remove(slide)}>
              Remove
            </Button>
          </SortableList.Item>
        )}
      </For>
    </SortableList.Root>
  );
}
