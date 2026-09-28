<script lang="ts">
  import { SortableList } from "@moderno-ui/svelte";

  let lists = $state({
    sm: ["Cover", "Logo", "Colors"],
    md: ["Cover", "Logo", "Colors"],
    lg: ["Cover", "Logo", "Colors"],
  });
</script>

<div class="demo-row">
  <SortableList.Root size="sm" bind:items={lists.sm} aria-label="Slides, sm">
    {#each lists.sm as slide (slide)}
      <SortableList.Item value={slide}>
        <SortableList.ItemHandle />
        <SortableList.ItemTrigger>{slide}</SortableList.ItemTrigger>
      </SortableList.Item>
    {/each}
  </SortableList.Root>
  <SortableList.Root size="md" bind:items={lists.md} aria-label="Slides, md">
    {#each lists.md as slide (slide)}
      <SortableList.Item value={slide}>
        <SortableList.ItemHandle />
        <SortableList.ItemTrigger>{slide}</SortableList.ItemTrigger>
      </SortableList.Item>
    {/each}
  </SortableList.Root>
  <SortableList.Root size="lg" bind:items={lists.lg} aria-label="Slides, lg">
    {#each lists.lg as slide (slide)}
      <SortableList.Item value={slide}>
        <SortableList.ItemHandle />
        <SortableList.ItemTrigger>{slide}</SortableList.ItemTrigger>
      </SortableList.Item>
    {/each}
  </SortableList.Root>
</div>
