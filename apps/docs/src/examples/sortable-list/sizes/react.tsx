import { useState } from "react";
import { SortableList, type SortableListSize } from "@moderno-ui/react";

function SizedList({ size }: { size: SortableListSize }) {
  const [slides, setSlides] = useState(["Cover", "Logo", "Colors"]);
  return (
    <SortableList.Root
      size={size}
      items={slides}
      onReorder={(details) => setSlides(details.items)}
      aria-label={`Slides, ${size}`}
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

export function SortableListSizesDemo() {
  return (
    <div className="demo-row">
      <SizedList size="sm" />
      <SizedList size="md" />
      <SizedList size="lg" />
    </div>
  );
}
