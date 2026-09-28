<!-- VectorPad.Thumb: the handle, a `role="slider"` that says both values; it takes focus. -->
<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { mergeProps } from "@zag-js/svelte";
  import { getVectorPadContext } from "./vector-pad-props.js";

  let { children, ...rest }: HTMLAttributes<HTMLDivElement> = $props();
  const context = getVectorPadContext();
</script>

<div {...mergeProps(context.api.getThumbProps(), rest)}>{@render children?.()}</div>
