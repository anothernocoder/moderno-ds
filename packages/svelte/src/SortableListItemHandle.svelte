<!--
  SortableList.ItemHandle — the optional grip button. With it, only the
  handle drags; it is named "Reorder <label>" and Space on it picks the item
  up. Its children replace the grip icon.
-->
<script lang="ts">
  import { mergeProps } from "@zag-js/svelte";
  import { sortableListGripIcon } from "@moderno-ui/core";
  import {
    getSortableList,
    getSortableListItem,
    type SortableListItemHandleProps,
  } from "./sortable-list-props.js";

  let { children, ...rest }: SortableListItemHandleProps = $props();

  const api = getSortableList("ItemHandle");
  const item = getSortableListItem("ItemHandle");
</script>

<button {...mergeProps(api().getItemHandleProps(item()), rest)}>
  {#if children}
    {@render children()}
  {:else}
    <svg viewBox={sortableListGripIcon.viewBox} fill="currentColor" aria-hidden="true">
      {#each sortableListGripIcon.dots as dot (`${dot.cx}-${dot.cy}`)}
        <circle cx={dot.cx} cy={dot.cy} r={sortableListGripIcon.radius} />
      {/each}
    </svg>
  {/if}
</button>
