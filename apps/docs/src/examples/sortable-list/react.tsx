import { useState } from "react";
import { SortableList } from "@moderno-ui/react";

export function SortableListDemo() {
  const [slides, setSlides] = useState(["Cover", "Logo", "Colors", "Fonts"]);
  return (
    <SortableList.Root
      items={slides}
      onReorder={(details) => setSlides(details.items)}
      aria-label="Slides"
    >
      {slides.map((slide) => (
        <SortableList.Item key={slide} value={slide}>
          <SortableList.ItemHandle />
          <SortableList.ItemTrigger>{slide}</SortableList.ItemTrigger>
        </SortableList.Item>
      ))}
    </SortableList.Root>
  );
}
