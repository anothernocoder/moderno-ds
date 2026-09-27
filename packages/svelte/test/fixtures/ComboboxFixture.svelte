<!-- The documented pattern: Ark's collection narrowed by the typed text. -->
<script lang="ts">
  import { Combobox, Portal, useFilter, useListCollection } from "../../src/index.js";
  import type { ComboboxSize, ComboboxValueChangeDetails } from "../../src/index.js";

  let {
    size = undefined,
    multiple = false,
    value = $bindable(),
    defaultValue = undefined,
    disabled = false,
    invalid = undefined,
    onValueChange = undefined,
  }: {
    size?: ComboboxSize;
    multiple?: boolean;
    value?: string[];
    defaultValue?: string[];
    disabled?: boolean;
    invalid?: boolean;
    onValueChange?: (details: ComboboxValueChangeDetails) => void;
  } = $props();

  const filters = useFilter({ sensitivity: "base" });
  const { collection, filter } = useListCollection({
    initialItems: [
      { label: "React", value: "react" },
      { label: "Vue", value: "vue" },
      { label: "Svelte", value: "svelte" },
      { label: "Solid", value: "solid", disabled: true },
    ],
    filter: (itemText, filterText) => filters().contains(itemText, filterText),
  });
</script>

<Combobox.Root
  {size}
  collection={collection()}
  onInputValueChange={(details) => filter(details.inputValue)}
  {multiple}
  bind:value
  {defaultValue}
  {disabled}
  {invalid}
  {onValueChange}
  class="frameworks"
>
  <Combobox.Label>Framework</Combobox.Label>
  <Combobox.Control>
    <Combobox.Input placeholder="Search" />
    <Combobox.ClearTrigger>×</Combobox.ClearTrigger>
    <Combobox.Trigger>▾</Combobox.Trigger>
  </Combobox.Control>
  <Portal>
    <Combobox.Positioner>
      <Combobox.Content>
        <Combobox.Empty>No frameworks found</Combobox.Empty>
        {#each collection().items as item (item.value)}
          <Combobox.Item {item}>
            <Combobox.ItemText>{item.label}</Combobox.ItemText>
            <Combobox.ItemIndicator>✓</Combobox.ItemIndicator>
          </Combobox.Item>
        {/each}
      </Combobox.Content>
    </Combobox.Positioner>
  </Portal>
</Combobox.Root>
