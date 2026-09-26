<!--
  Spinner — a spinning ring that says "something is loading" without a
  progress value, ported to Svelte 5.

  Identical contract to @moderno-ui/react: a <span role="status"> root carrying
  data-scope/data-part plus the shared spinnerRecipe's data-size. The circle
  part is the ring, hidden from assistive tech; the label part is visually
  hidden text read by screen readers ("Loading", or `label`). The scope/part/
  size attrs spread last so they can't be clobbered.
-->
<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { partAttrs, spinnerRecipe, type SpinnerSize } from "@moderno-ui/core";

  interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
    size?: SpinnerSize;
    /** What is loading, read by screen readers. */
    label?: string;
  }

  let { size, label = "Loading", ...rest }: Props = $props();
</script>

<span role="status" {...rest} {...partAttrs("spinner", "root")} {...spinnerRecipe({ size })}>
  <span aria-hidden="true" {...partAttrs("spinner", "circle")}></span>
  <span {...partAttrs("spinner", "label")}>{label}</span>
</span>
