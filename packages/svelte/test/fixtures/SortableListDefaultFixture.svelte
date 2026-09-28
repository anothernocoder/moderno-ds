<script lang="ts">
  import { SortableList } from "../../src/index.js";
</script>

<SortableList.Root defaultItems={["a", "b"]} aria-label="Letters">
  {#snippet children(items: string[])}
    {#each items as value (value)}
      <SortableList.Item {value}>
        <SortableList.ItemTrigger>{value.toUpperCase()}</SortableList.ItemTrigger>
      </SortableList.Item>
    {/each}
  {/snippet}
</SortableList.Root>
