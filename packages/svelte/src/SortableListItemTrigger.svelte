<!--
  SortableList.ItemTrigger — the item's one focus target, usually its name.
  Up and Down move between the triggers; without a handle, Space on it picks
  the item up.
-->
<script lang="ts">
  import { mergeProps } from "@zag-js/svelte";
  import {
    getSortableList,
    getSortableListItem,
    type SortableListItemTriggerProps,
  } from "./sortable-list-props.js";

  let { children, ...rest }: SortableListItemTriggerProps = $props();

  const api = getSortableList("ItemTrigger");
  const item = getSortableListItem("ItemTrigger");
</script>

<button {...mergeProps(api().getItemTriggerProps(item()), rest)}>
  {@render children?.()}
</button>
