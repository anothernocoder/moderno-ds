<!--
  Toolbar.Group — a run of related items, role="group". Name it with
  aria-label.
-->
<script lang="ts">
  import { mergeProps } from "@zag-js/svelte";
  import { useToolbar, type ToolbarGroupProps } from "./toolbar-props.js";

  let { children, ...rest }: ToolbarGroupProps = $props();

  const api = useToolbar("Group");
</script>

<div {...mergeProps(api().getGroupProps(), rest)}>
  {@render children?.()}
</div>
