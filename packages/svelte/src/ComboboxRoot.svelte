<!--
  Combobox.Root with the Moderno `size` recipe folded in. Ark's Root spreads
  unknown props onto its data-part="root" element, so the recipe's data-size
  rides along and components.css sizes the control from it. Generic over the
  collection item type, exactly like Ark's own Root. `children` and every
  other prop pass straight through via `...rest`; `value`, `inputValue` and
  `open` stay bindable.
-->
<script lang="ts" generics="T extends CollectionItem">
  import { Combobox as ArkCombobox } from "@ark-ui/svelte";
  import type { CollectionItem, ComboboxRootProps } from "@ark-ui/svelte";
  import { comboboxRecipe, type ComboboxSize } from "@moderno-ui/core";

  let {
    size,
    value = $bindable(),
    inputValue = $bindable(),
    open = $bindable(),
    ...rest
  }: ComboboxRootProps<T> & { size?: ComboboxSize } = $props();
</script>

<ArkCombobox.Root
  bind:value
  bind:inputValue
  bind:open
  {...rest}
  {...comboboxRecipe({ size })}
/>
