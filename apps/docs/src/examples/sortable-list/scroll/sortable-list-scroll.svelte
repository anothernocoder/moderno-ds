<script lang="ts">
  import { SortableList } from "@moderno-ui/svelte";

  let slides = $state([
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
</script>

<SortableList.Root bind:items={slides} style="max-height: 12rem; overflow-y: auto" aria-label="Slides">
  {#each slides as slide (slide)}
    <SortableList.Item value={slide}>
      <SortableList.ItemHandle />
      <SortableList.ItemTrigger>{slide}</SortableList.ItemTrigger>
    </SortableList.Item>
  {/each}
</SortableList.Root>
