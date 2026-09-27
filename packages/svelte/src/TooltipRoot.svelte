<!--
  Tooltip.Root with the Moderno `size` recipe folded in. Ark's Root renders no
  element, so the size is handed to Tooltip.Content, the surface, through
  context.

  Built on Ark's own useTooltip + Tooltip.RootProvider rather than Ark's Svelte
  Root: that Root (Ark Svelte 5.22) never hands `open` to the machine, so a
  controlled `open` did nothing, while Ark's Dialog and Popover roots pass it.
  This one passes it the way they do, keeps `bind:open` in step, and ids the
  machine with `$props.id()` so server and client agree.
-->
<script lang="ts">
  import { Tooltip as ArkTooltip, useTooltip } from "@ark-ui/svelte";
  import type { TooltipRootProps } from "@ark-ui/svelte";
  import type { TooltipSize } from "@moderno-ui/core";
  import { provideTooltipSize } from "./tooltip-size.js";

  let {
    size,
    open = $bindable(),
    children,
    immediate,
    lazyMount,
    onExitComplete,
    skipAnimationOnMount,
    unmountOnExit,
    ...machineProps
  }: TooltipRootProps & { size?: TooltipSize } = $props();

  const providedId = $props.id();

  const tooltip = useTooltip(() => ({
    ...machineProps,
    id: machineProps.id ?? providedId,
    open,
    onOpenChange(details) {
      machineProps.onOpenChange?.(details);
      if (open !== undefined) open = details.open;
    },
  }));

  provideTooltipSize(() => size);
</script>

<ArkTooltip.RootProvider
  value={tooltip}
  {immediate}
  {lazyMount}
  {onExitComplete}
  {skipAnimationOnMount}
  {unmountOnExit}
>
  {@render children?.()}
</ArkTooltip.RootProvider>
