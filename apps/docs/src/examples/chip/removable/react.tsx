import { useState } from "react";
import { Chip } from "@moderno-ui/react";

export function ChipRemovableDemo() {
  const [tags, setTags] = useState(["React", "Vue", "Svelte", "Solid"]);
  return (
    <div className="demo-row">
      {tags.map((tag) => (
        <Chip
          key={tag}
          removable
          removeLabel={`Remove ${tag}`}
          onRemove={() => setTags(tags.filter((t) => t !== tag))}
        >
          {tag}
        </Chip>
      ))}
    </div>
  );
}
