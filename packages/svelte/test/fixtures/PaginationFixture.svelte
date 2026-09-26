<script lang="ts">
  import { Pagination } from "../../src/index.js";
  import type { PaginationSize, PaginationPageChangeDetails } from "../../src/index.js";

  let {
    size = undefined,
    count = 100,
    pageSize = 10,
    page = undefined,
    defaultPage = undefined,
    siblingCount = undefined,
    boundaryCount = undefined,
    onPageChange = undefined,
  }: {
    size?: PaginationSize;
    count?: number;
    pageSize?: number;
    page?: number;
    defaultPage?: number;
    siblingCount?: number;
    boundaryCount?: number;
    onPageChange?: (details: PaginationPageChangeDetails) => void;
  } = $props();
</script>

<Pagination.Root
  {size}
  {count}
  {pageSize}
  {page}
  {defaultPage}
  {siblingCount}
  {boundaryCount}
  {onPageChange}
  class="pages"
>
  <Pagination.FirstTrigger>«</Pagination.FirstTrigger>
  <Pagination.PrevTrigger>‹</Pagination.PrevTrigger>
  <Pagination.Context>
    {#snippet render(pagination)}
      {#each pagination().pages as item, index (index)}
        {#if item.type === "page"}
          <Pagination.Item {...item}>{item.value}</Pagination.Item>
        {:else}
          <Pagination.Ellipsis {index}>…</Pagination.Ellipsis>
        {/if}
      {/each}
    {/snippet}
  </Pagination.Context>
  <Pagination.NextTrigger>›</Pagination.NextTrigger>
  <Pagination.LastTrigger>»</Pagination.LastTrigger>
</Pagination.Root>
