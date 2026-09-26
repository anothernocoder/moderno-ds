<!--
  Select — a collection + popover whose hidden native <select> and ids must
  serialise. `open` mounts the popover, and the trigger reports it.
-->
<script lang="ts">
  import { createListCollection } from "../../src/exports/list-collection.js";
  import { Portal } from "../../src/exports/portal.js";
  import { Select } from "../../src/exports/select.js";
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
</script>

<section aria-label="select">
  <Select.Root collection={frameworks} size="md" defaultOpen={open}>
    <Select.Label>Framework</Select.Label>
    <Select.Control>
      <Select.Trigger>
        <Select.ValueText placeholder="Pick one" />
        <Select.Indicator>▾</Select.Indicator>
      </Select.Trigger>
    </Select.Control>
    <Portal>
      <Select.Positioner>
        <Select.Content>
          {#each frameworks.items as item (item.value)}
            <Select.Item {item}>
              <Select.ItemText>{item.label}</Select.ItemText>
              <Select.ItemIndicator>✓</Select.ItemIndicator>
            </Select.Item>
          {/each}
        </Select.Content>
      </Select.Positioner>
    </Portal>
  </Select.Root>
</section>
