<!--
  Toolbar.Separator — a rule between groups, across the toolbar.
-->
<script lang="ts">
  import { mergeProps } from "@zag-js/svelte";
  import { useToolbar, type ToolbarSeparatorProps } from "./toolbar-props.js";

  let props: ToolbarSeparatorProps = $props();

  const api = useToolbar("Separator");
</script>

<div {...mergeProps(api().getSeparatorProps(), props)}></div>
