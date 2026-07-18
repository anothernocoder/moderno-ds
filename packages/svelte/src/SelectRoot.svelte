<!--
  Select.Root with the Moderno `size` recipe folded in. Ark's Root spreads
  unknown props onto its data-part="root" element, so the recipe's data-size
  rides along and components.css keys the trigger/menu density off it. Generic
  over the collection item type, exactly like Ark's own Root. `children` and
  every other prop pass straight through via `...rest`.
-->
<script lang="ts" generics="T extends CollectionItem">
  import { Select as ArkSelect } from "@ark-ui/svelte";
  import type { CollectionItem, SelectRootProps } from "@ark-ui/svelte";
  import { selectRecipe, type SelectSize } from "@moderno/core";

  let { size, ...rest }: SelectRootProps<T> & { size?: SelectSize } = $props();
</script>

<ArkSelect.Root {...rest} {...selectRecipe({ size })} />
