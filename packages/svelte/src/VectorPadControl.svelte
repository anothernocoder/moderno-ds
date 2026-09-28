<!-- VectorPad.Control: the square pad you press or drag on; it holds the handle. -->
<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { mergeProps } from "@zag-js/svelte";
  import { getVectorPadContext } from "./vector-pad-props.js";

  let { children, ...rest }: HTMLAttributes<HTMLDivElement> = $props();
  const context = getVectorPadContext();
</script>

<div {...mergeProps(context.api.getControlProps(), rest)}>{@render children?.()}</div>
