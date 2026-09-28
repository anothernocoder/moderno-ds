import { useState } from "react";
import { Avatar, Button, SortableList } from "@moderno-ui/react";

export function SortableListContentDemo() {
  const [slides, setSlides] = useState(["Cover", "Logo", "Colors", "Fonts"]);
  const remove = (slide: string) => setSlides(slides.filter((other) => other !== slide));
  return (
    <SortableList.Root
      items={slides}
      onReorder={(details) => setSlides(details.items)}
      aria-label="Slides"
    >
      {slides.map((slide) => (
        <SortableList.Item key={slide} value={slide}>
          <SortableList.ItemHandle />
          <Avatar.Root size="sm" shape="square">
            <Avatar.Fallback>{slide.slice(0, 2)}</Avatar.Fallback>
          </Avatar.Root>
          <SortableList.ItemTrigger>{slide}</SortableList.ItemTrigger>
          <Button variant="ghost" size="sm" onClick={() => remove(slide)}>
            Remove
          </Button>
        </SortableList.Item>
      ))}
    </SortableList.Root>
  );
}
