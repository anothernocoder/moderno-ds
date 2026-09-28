<!-- VectorPad.Label: names the pad and the fields; a click focuses the handle. -->
<script lang="ts">
  import type { HTMLLabelAttributes } from "svelte/elements";
  import { mergeProps } from "@zag-js/svelte";
  import { getVectorPadContext } from "./vector-pad-props.js";

  let { children, ...rest }: HTMLLabelAttributes = $props();
  const context = getVectorPadContext();
</script>

<label {...mergeProps(context.api.getLabelProps(), rest)}>{@render children?.()}</label>
