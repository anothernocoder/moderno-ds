<!-- VectorPad.Crosshair: optional lines through the pad's centre, hidden from screen readers. -->
<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { mergeProps } from "@zag-js/svelte";
  import { getVectorPadContext } from "./vector-pad-props.js";

  let { children, ...rest }: HTMLAttributes<HTMLDivElement> = $props();
  const context = getVectorPadContext();
</script>

<div {...mergeProps(context.api.getCrosshairProps(), rest)}>{@render children?.()}</div>
