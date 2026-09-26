<script lang="ts">
  import { Pagination } from "@moderno-ui/svelte";
</script>

<div class="demo-stack">
  <Pagination.Root size="sm" count={50} pageSize={10}>
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
  </Pagination.Root>
  <Pagination.Root size="md" count={50} pageSize={10}>
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
  </Pagination.Root>
  <Pagination.Root size="lg" count={50} pageSize={10}>
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
  </Pagination.Root>
</div>
