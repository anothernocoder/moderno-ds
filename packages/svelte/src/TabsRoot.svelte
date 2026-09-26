<!--
  Tabs.Root with the Moderno `variant` × `size` recipe folded in. Ark's Root
  spreads unknown props onto its data-part="root" element, so the recipe's
  attributes ride along and components.css styles the list from them.
  `children` and every other prop pass straight through via `...rest`.
-->
<script lang="ts">
  import { Tabs as ArkTabs } from "@ark-ui/svelte";
  import type { TabsRootProps } from "@ark-ui/svelte";
  import { tabsRecipe, type TabsSize, type TabsVariant } from "@moderno-ui/core";

  let {
    variant,
    size,
    ...rest
  }: TabsRootProps & { variant?: TabsVariant; size?: TabsSize } = $props();
</script>

<ArkTabs.Root {...rest} {...tabsRecipe({ variant, size })} />
