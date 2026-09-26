<!--
  Skeleton — a muted placeholder shown where content is still loading, ported
  to Svelte 5.

  Identical contract to @moderno-ui/react: an empty <span> carrying data-scope/
  data-part plus the shared skeletonRecipe's data-shape, painted as a block by
  components.css. It is aria-hidden (a consumer attribute can override it);
  mark the loading region with aria-busy instead. The scope/part/shape attrs
  spread last so they can't be clobbered.
-->
<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { partAttrs, skeletonRecipe, type SkeletonShape } from "@moderno-ui/core";

  interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
    shape?: SkeletonShape;
  }

  let { shape, ...rest }: Props = $props();
</script>

<span
  aria-hidden="true"
  {...rest}
  {...partAttrs("skeleton", "root")}
  {...skeletonRecipe({ shape })}
></span>
