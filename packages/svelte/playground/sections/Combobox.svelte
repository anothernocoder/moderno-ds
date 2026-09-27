<!--
  Combobox — Ark's combobox machine: the label pointing at the input, the
  input's aria-controls / aria-expanded against the listbox, each item's id
  and selected state, a multiple listbox and the empty state reach the server
  string. The list is rendered in place (no Portal), so the closed listbox is
  in it too; `open` mounts the first one open.
-->
<script lang="ts">
  import { Combobox } from "../../src/exports/combobox.js";
  import { createListCollection } from "../../src/exports/list-collection.js";
  import type { SectionProps } from "../section.js";

  let { open }: SectionProps = $props();

  const frameworks = createListCollection({
    items: [
      { label: "React", value: "react" },
      { label: "Vue", value: "vue" },
      { label: "Svelte", value: "svelte" },
      { label: "Solid", value: "solid" },
    ],
  });
  const nothing = createListCollection<{ label: string; value: string }>({ items: [] });
</script>

{#snippet combobox(
  collection: typeof frameworks,
  size: "sm" | "md" | "lg",
  defaultOpen?: boolean,
  defaultValue?: string[],
)}
  <Combobox.Root {collection} {size} {defaultOpen} multiple={!!defaultValue} {defaultValue}>
    <Combobox.Label>Framework</Combobox.Label>
    <Combobox.Control>
      <Combobox.Input placeholder="Search frameworks" />
      <Combobox.ClearTrigger>×</Combobox.ClearTrigger>
      <Combobox.Trigger>▾</Combobox.Trigger>
    </Combobox.Control>
    <Combobox.Positioner>
      <Combobox.Content>
        <Combobox.Empty>No frameworks found</Combobox.Empty>
        {#each collection.items as item (item.value)}
          <Combobox.Item {item}>
            <Combobox.ItemText>{item.label}</Combobox.ItemText>
            <Combobox.ItemIndicator>✓</Combobox.ItemIndicator>
          </Combobox.Item>
        {/each}
      </Combobox.Content>
    </Combobox.Positioner>
  </Combobox.Root>
{/snippet}

<section aria-label="combobox">
  {@render combobox(frameworks, "md", open)}
  {@render combobox(frameworks, "sm", false, ["vue", "solid"])}
  {@render combobox(nothing, "lg")}
</section>
