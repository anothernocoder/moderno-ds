<!--
  SortableList.Root — the <ul>. It runs the sortable-list machine from
  @moderno-ui/core and hands it to the items; the Moderno `size` recipe
  lands on it. `items` is bindable; the children snippet receives the
  current order.
-->
<script lang="ts">
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte";
  import { sortableList, sortableListRecipe } from "@moderno-ui/core";
  import { setSortableList, type SortableListRootProps } from "./sortable-list-props.js";

  let {
    id,
    items = $bindable(),
    defaultItems,
    onReorder,
    disabled,
    size,
    translations,
    children,
    ...rest
  }: SortableListRootProps = $props();
  const providedId = $props.id();

  const service = useMachine(sortableList.machine, () => ({
    id: id ?? providedId,
    items,
    defaultItems,
    disabled,
    translations,
    onReorder(details: sortableList.ReorderDetails) {
      if (items !== undefined) items = details.items;
      onReorder?.(details);
    },
  }));
  const api = $derived(sortableList.connect(service, normalizeProps));
  setSortableList(() => api);
</script>

<ul {...mergeProps(api.getRootProps(), sortableListRecipe({ size }), rest)}>
  {@render children?.(api.items)}
</ul>
