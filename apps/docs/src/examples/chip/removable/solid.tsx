/** @jsxImportSource solid-js */
import { createSignal, For } from "solid-js";
import { Chip } from "@moderno-ui/solid";

export function ChipRemovableDemo() {
  const [tags, setTags] = createSignal(["React", "Vue", "Svelte", "Solid"]);
  return (
    <div class="demo-row">
      <For each={tags()}>
        {(tag) => (
          <Chip
            removable
            removeLabel={`Remove ${tag}`}
            onRemove={() => setTags(tags().filter((t) => t !== tag))}
          >
            {tag}
          </Chip>
        )}
      </For>
    </div>
  );
}
