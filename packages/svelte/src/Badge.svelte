<!--
  Badge — a short, static label for a status or a count, ported to Svelte 5.

  Identical contract to @moderno-ui/react: a <span> carrying data-scope/
  data-part plus the shared badgeRecipe's data-variant/data-size, painted
  entirely by components.css. `dot` adds the dot part, hidden from assistive
  tech. The scope/part/variant attrs spread last so they can't be clobbered.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { badgeRecipe, partAttrs, type BadgeSize, type BadgeVariant } from "@moderno-ui/core";

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    size?: BadgeSize;
    /** Show a small dot before the text, tinted like the badge. */
    dot?: boolean;
    children?: Snippet;
  }

  let { variant, size, dot = false, children, ...rest }: Props = $props();
</script>

<span {...rest} {...partAttrs("badge", "root")} {...badgeRecipe({ variant, size })}>
  {#if dot}
    <span aria-hidden="true" {...partAttrs("badge", "dot")}></span>
  {/if}
  {@render children?.()}
</span>
