<script lang="ts">
  import { Avatar, Button, SortableList } from "@moderno-ui/svelte";

  let slides = $state(["Cover", "Logo", "Colors", "Fonts"]);
  const remove = (slide: string) => {
    slides = slides.filter((other) => other !== slide);
  };
</script>

<SortableList.Root bind:items={slides} aria-label="Slides">
  {#each slides as slide (slide)}
    <SortableList.Item value={slide}>
      <SortableList.ItemHandle />
      <Avatar.Root size="sm" shape="square">
        <Avatar.Fallback>{slide.slice(0, 2)}</Avatar.Fallback>
      </Avatar.Root>
      <SortableList.ItemTrigger>{slide}</SortableList.ItemTrigger>
      <Button variant="ghost" size="sm" onclick={() => remove(slide)}>Remove</Button>
    </SortableList.Item>
  {/each}
</SortableList.Root>
