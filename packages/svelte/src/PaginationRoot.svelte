<!--
  Pagination.Root with the Moderno `size` recipe folded in. Ark's Root
  spreads unknown props onto its data-part="root" element, so the recipe's
  attribute rides along and components.css sizes the parts from it.
  `children` and every other prop pass straight through via `...rest`.
-->
<script lang="ts">
  import { Pagination as ArkPagination } from "@ark-ui/svelte";
  import type { PaginationRootProps } from "@ark-ui/svelte";
  import { paginationRecipe, type PaginationSize } from "@moderno-ui/core";

  let { size, ...rest }: PaginationRootProps & { size?: PaginationSize } = $props();
</script>

<ArkPagination.Root {...rest} {...paginationRecipe({ size })} />
