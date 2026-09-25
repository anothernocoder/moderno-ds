<!--
  Indicator — a small status dot with an optional label and pulse, ported to
  Svelte 5.

  Identical contract to @moderno-ui/react: a <span> root carrying data-scope/
  data-part plus the shared indicatorAttrs (data-variant, data-size, and a bare
  data-pulse when `pulse` is on). The dot is always rendered and hidden from
  assistive tech; the children snippet becomes the label part. The scope/part/
  variant attrs spread last so they can't be clobbered.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { indicatorAttrs, partAttrs, type IndicatorAttrsProps } from "@moderno-ui/core";

  interface Props extends HTMLAttributes<HTMLSpanElement>, IndicatorAttrsProps {
    children?: Snippet;
  }

  let { variant, size, pulse = false, children, ...rest }: Props = $props();
</script>

<span {...rest} {...partAttrs("indicator", "root")} {...indicatorAttrs({ variant, size, pulse })}>
  <span aria-hidden="true" {...partAttrs("indicator", "dot")}></span>
  {#if children}
    <span {...partAttrs("indicator", "label")}>{@render children()}</span>
  {/if}
</span>
