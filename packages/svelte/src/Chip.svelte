<!--
  Chip — a compact, optionally removable token, ported to Svelte 5.

  Identical contract to @moderno-ui/react: a <span> root carrying data-scope/
  data-part plus the shared chipRecipe's data-variant/data-size, the children
  inside the label part and — when `removable` — a native <button> as the
  remove-trigger part. The press is reported through `onRemove`; removing the
  chip is the consumer's job. The scope/part/variant attrs spread last so they
  can't be clobbered.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { chipRecipe, partAttrs, type ChipSize, type ChipVariant } from "@moderno-ui/core";

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    variant?: ChipVariant;
    size?: ChipSize;
    /** Show a remove (×) button after the label. */
    removable?: boolean;
    /** Accessible name of the remove button. Name the chip: "Remove React". */
    removeLabel?: string;
    /** Called when the remove button is pressed. */
    onRemove?: () => void;
    children?: Snippet;
  }

  let {
    variant,
    size,
    removable = false,
    removeLabel = "Remove",
    onRemove,
    children,
    ...rest
  }: Props = $props();
</script>

<span {...rest} {...partAttrs("chip", "root")} {...chipRecipe({ variant, size })}>
  <span {...partAttrs("chip", "label")}>{@render children?.()}</span>
  {#if removable}
    <button
      type="button"
      aria-label={removeLabel}
      onclick={() => onRemove?.()}
      {...partAttrs("chip", "remove-trigger")}
    >
      <span aria-hidden="true">×</span>
    </button>
  {/if}
</span>
