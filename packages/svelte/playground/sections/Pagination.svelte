<!--
  Pagination — Ark's pagination machine: the page list with its ellipses,
  the current page and the triggers disabled at either end reach the server
  string.
-->
<script lang="ts">
  import { Pagination } from "../../src/exports/pagination.js";
  import type { SectionProps } from "../section.js";

  let {}: SectionProps = $props();
</script>

<section aria-label="pagination">
  <Pagination.Root count={100} pageSize={10} defaultPage={5}>
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
  <Pagination.Root size="sm" count={30} pageSize={10}>
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
</section>
