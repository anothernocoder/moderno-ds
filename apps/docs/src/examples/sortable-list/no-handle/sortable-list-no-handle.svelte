<script lang="ts">
  import { SortableList } from "@moderno-ui/svelte";

  let slides = $state(["Cover", "Logo", "Colors", "Fonts"]);
</script>

<SortableList.Root bind:items={slides} aria-label="Slides">
  {#each slides as slide (slide)}
    <SortableList.Item value={slide}>
      <SortableList.ItemTrigger>{slide}</SortableList.ItemTrigger>
    </SortableList.Item>
  {/each}
</SortableList.Root>
