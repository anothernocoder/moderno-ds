import { useState } from "react";
import { SortableList } from "@moderno-ui/react";

export function SortableListScrollDemo() {
  const [slides, setSlides] = useState([
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
      items={slides}
      onReorder={(details) => setSlides(details.items)}
      style={{ maxHeight: "12rem", overflowY: "auto" }}
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
