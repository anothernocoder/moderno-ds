<!--
  SortableList.Item — one <li>. It keeps any content; it moves as a whole.
-->
<script lang="ts">
  import { mergeProps } from "@zag-js/svelte";
  import {
    getSortableList,
    setSortableListItem,
    type SortableListItemProps,
  } from "./sortable-list-props.js";

  let { value, label, disabled, children, ...rest }: SortableListItemProps = $props();

  const api = getSortableList("Item");
  const item = $derived({ value, label, disabled });
  setSortableListItem(() => item);
</script>

<li {...mergeProps(api().getItemProps(item), rest)}>
  {@render children?.()}
</li>
