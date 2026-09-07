<!--
  Divider — the rule primitive, ported to Svelte 5.

  Identical contract to @moderno-ui/react: a plain element carrying
  data-scope/data-part plus the shared dividerRecipe's data-orientation/
  data-align, with the stroke drawn by components.css from --border. The
  children snippet is the optional label; role/aria-orientation are computed
  before the consumer's attributes spread, so they stay overridable, and the
  scope/part/variant attrs spread last so they can't be clobbered.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import {
    dividerRecipe,
    partAttrs,
    type DividerAlign,
    type DividerOrientation,
  } from "@moderno-ui/core";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    orientation?: DividerOrientation;
    align?: DividerAlign;
    children?: Snippet;
  }

  let { orientation, align, children, ...rest }: Props = $props();
</script>

<div
  role={children ? undefined : "separator"}
  aria-orientation={children ? undefined : (orientation ?? "horizontal")}
  {...rest}
  {...partAttrs("divider", "root")}
  {...dividerRecipe({ orientation, align })}
>
  {#if children}
    <span {...partAttrs("divider", "label")}>{@render children()}</span>
  {/if}
</div>
