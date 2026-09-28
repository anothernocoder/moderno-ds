<!--
  SortableList — the sortable-list machine from core on a <ul>: the recipe
  on the root, the Tab stop on the first trigger, the handles' names, a
  disabled item and a disabled list reach the server string.
-->
<script lang="ts">
  import { SortableList } from "../../src/exports/sortable-list.js";
  import type { SectionProps } from "../section.js";

  let {}: SectionProps = $props();

  const slides = [
    { value: "title", label: "Title" },
    { value: "logo", label: "Logo" },
    { value: "colors", label: "Colors" },
  ];
</script>

<section aria-label="sortable lists">
  <SortableList.Root defaultItems={slides.map((slide) => slide.value)} aria-label="Slides">
    {#each slides as slide (slide.value)}
      <SortableList.Item
        value={slide.value}
        label={slide.label}
        disabled={slide.value === "title"}
      >
        <SortableList.ItemHandle />
        <SortableList.ItemTrigger>{slide.label}</SortableList.ItemTrigger>
      </SortableList.Item>
    {/each}
  </SortableList.Root>
  <SortableList.Root size="sm" disabled defaultItems={["a", "b"]} aria-label="Layers">
    <SortableList.Item value="a">
      <SortableList.ItemTrigger>A</SortableList.ItemTrigger>
    </SortableList.Item>
    <SortableList.Item value="b">
      <SortableList.ItemTrigger>B</SortableList.ItemTrigger>
    </SortableList.Item>
  </SortableList.Root>
</section>
