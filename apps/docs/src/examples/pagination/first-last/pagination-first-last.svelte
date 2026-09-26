<script lang="ts">
  import { Pagination } from "@moderno-ui/svelte";
</script>

<Pagination.Root count={120} pageSize={10} defaultPage={6}>
  <Pagination.FirstTrigger>«</Pagination.FirstTrigger>
  <Pagination.PrevTrigger>‹</Pagination.PrevTrigger>
  <Pagination.Context>
    {#snippet render(pagination)}
      {#each pagination().pages as page, index (index)}
        {#if page.type === "page"}
          <Pagination.Item {...page}>{page.value}</Pagination.Item>
        {:else}
          <Pagination.Ellipsis {index}>…</Pagination.Ellipsis>
        {/if}
      {/each}
    {/snippet}
  </Pagination.Context>
  <Pagination.NextTrigger>›</Pagination.NextTrigger>
  <Pagination.LastTrigger>»</Pagination.LastTrigger>
</Pagination.Root>
