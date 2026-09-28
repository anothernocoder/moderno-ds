<!--
  One Toolbar item, shared by Toolbar.Button and Toolbar.Toggle: the
  machine's props, the consumer's, and a tooltip when it has a label. The
  consumer's handlers run first, so a Menu.Trigger merged in (asChild) can
  claim a key before the toolbar moves focus; a disabled item drops them.
  The tooltip and a Menu.Trigger share the item's id, so both find it.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { Portal, Tooltip as ArkTooltip, useTooltip } from "@ark-ui/svelte";
  import { mergeProps } from "@zag-js/svelte";
  import {
    toolbarTooltipText,
    toolbarTooltipTriggerProps,
    withoutEventHandlers,
  } from "@moderno-ui/core";
  import TooltipContent from "./TooltipContent.svelte";

  interface Props {
    part: "button" | "toggle";
    label?: string;
    shortcut?: string;
    disabled?: boolean;
    /** The machine's props for this item. */
    itemProps: HTMLButtonAttributes;
    /** What the consumer (or a Menu.Trigger around the item) passed. */
    consumer: HTMLButtonAttributes;
    children?: Snippet;
  }

  let { part, label, shortcut, disabled, itemProps, consumer, children }: Props = $props();

  const generatedId = $props.id();
  const id = $derived(consumer.id ?? generatedId);

  // Ark's Svelte useTooltip makes no id of its own.
  const tooltip = useTooltip(() => ({ id: `${generatedId}-tooltip`, ids: { trigger: id } }));

  const merged = $derived(
    mergeProps(
      label ? toolbarTooltipTriggerProps(tooltip().getTriggerProps()) : {},
      { "aria-label": label },
      itemProps,
      disabled ? withoutEventHandlers(consumer) : consumer,
    ),
  );
</script>

<button {...merged} {id} data-scope="toolbar" data-part={part}>
  {@render children?.()}
</button>
{#if label}
  <ArkTooltip.RootProvider value={tooltip}>
    <Portal>
      <ArkTooltip.Positioner>
        <TooltipContent>{toolbarTooltipText(label, shortcut)}</TooltipContent>
      </ArkTooltip.Positioner>
    </Portal>
  </ArkTooltip.RootProvider>
{/if}
