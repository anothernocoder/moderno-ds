<!--
  Toolbar.Root — role="toolbar", the toolbar machine from @moderno-ui/core
  bound with @zag-js/svelte, and the recipe's data-size. Name it with
  aria-label. The machine is ided with `$props.id()` so server and client
  agree.
-->
<script lang="ts">
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte";
  import { toolbar, toolbarRecipe } from "@moderno-ui/core";
  import { provideToolbar, type ToolbarRootProps } from "./toolbar-props.js";

  let { orientation, size, dir, id, children, ...rest }: ToolbarRootProps = $props();

  const machineId = $props.id();

  const service = useMachine(toolbar.machine, () => ({
    id: machineId,
    ids: id ? { root: id } : undefined,
    orientation,
    dir,
  }));

  const api = $derived(toolbar.connect(service, normalizeProps));

  provideToolbar(() => api);
</script>

<div {...mergeProps(api.getRootProps(), rest)} {...toolbarRecipe({ size })}>
  {@render children?.()}
</div>
