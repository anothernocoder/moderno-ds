<!--
  Toolbar.Button — one action. With a `label` and an icon as its child it is
  an icon-only button, named by the label, which it shows as a tooltip.
-->
<script lang="ts">
  import ToolbarItem from "./ToolbarItem.svelte";
  import { useToolbar, type ToolbarButtonProps } from "./toolbar-props.js";

  let { label, shortcut, disabled = false, children, ...rest }: ToolbarButtonProps = $props();

  const api = useToolbar("Button");
  const value = $props.id();
  const itemProps = $derived(api().getButtonProps({ value, disabled }));
</script>

<ToolbarItem part="button" {label} {shortcut} {disabled} {itemProps} consumer={rest} {children} />
