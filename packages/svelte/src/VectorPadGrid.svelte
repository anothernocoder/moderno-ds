<!-- VectorPad.Grid: optional lines across the pad, hidden from screen readers. -->
<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { mergeProps } from "@zag-js/svelte";
  import { getVectorPadContext } from "./vector-pad-props.js";

  let { children, ...rest }: HTMLAttributes<HTMLDivElement> = $props();
  const context = getVectorPadContext();
</script>

<div {...mergeProps(context.api.getGridProps(), rest)}>{@render children?.()}</div>
