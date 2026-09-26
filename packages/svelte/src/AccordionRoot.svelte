<!--
  Accordion.Root with the Moderno `variant` × `size` recipe folded in. Ark's
  Root spreads unknown props onto its data-part="root" element, so the
  recipe's attributes ride along and components.css styles the items from
  them. `children` and every other prop pass straight through via `...rest`.
-->
<script lang="ts">
  import { Accordion as ArkAccordion } from "@ark-ui/svelte";
  import type { AccordionRootProps } from "@ark-ui/svelte";
  import { accordionRecipe, type AccordionSize, type AccordionVariant } from "@moderno-ui/core";

  let {
    variant,
    size,
    ...rest
  }: AccordionRootProps & { variant?: AccordionVariant; size?: AccordionSize } = $props();
</script>

<ArkAccordion.Root {...rest} {...accordionRecipe({ variant, size })} />
