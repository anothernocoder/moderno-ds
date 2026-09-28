<script lang="ts">
  import { SortableList } from "../../src/index.js";
  import type { SortableListReorderDetails, SortableListSize } from "../../src/index.js";

  let {
    handles = false,
    disabled = undefined,
    disabledItem = undefined,
    size = undefined,
    onReorder = undefined,
    onSelect = undefined,
  }: {
    handles?: boolean;
    disabled?: boolean;
    disabledItem?: string;
    size?: SortableListSize;
    onReorder?: (details: SortableListReorderDetails) => void;
    onSelect?: (value: string) => void;
  } = $props();

  const labels: Record<string, string> = {
    title: "Title",
    logo: "Logo",
    colors: "Colors",
    fonts: "Fonts",
  };
  let items = $state(["title", "logo", "colors", "fonts"]);
</script>

<SortableList.Root bind:items {onReorder} {disabled} {size} aria-label="Slides" class="slides">
  {#each items as value (value)}
    <SortableList.Item {value} label={labels[value]} disabled={value === disabledItem}>
      {#if handles}
        <SortableList.ItemHandle />
      {/if}
      <SortableList.ItemTrigger onclick={() => onSelect?.(value)}>
        {labels[value]}
      </SortableList.ItemTrigger>
    </SortableList.Item>
  {/each}
</SortableList.Root>
