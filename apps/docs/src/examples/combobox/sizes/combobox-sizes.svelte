<script lang="ts">
  import { Combobox, Portal, createListCollection } from "@moderno-ui/svelte";

  const frameworks = createListCollection({
    items: [
      { label: "React", value: "react" },
      { label: "Vue", value: "vue" },
      { label: "Svelte", value: "svelte" },
      { label: "Solid", value: "solid" },
    ],
  });
  const sizes = [
    { size: "sm", label: "Small" },
    { size: "md", label: "Medium" },
    { size: "lg", label: "Large" },
  ] as const;
</script>

<div class="demo-stack">
  {#each sizes as { size, label } (size)}
    <Combobox.Root collection={frameworks} {size}>
      <Combobox.Label>{label}</Combobox.Label>
      <Combobox.Control>
        <Combobox.Input placeholder="Search frameworks" />
        <Combobox.Trigger>▾</Combobox.Trigger>
      </Combobox.Control>
      <Portal>
        <Combobox.Positioner>
          <Combobox.Content>
            {#each frameworks.items as item (item.value)}
              <Combobox.Item {item}>
                <Combobox.ItemText>{item.label}</Combobox.ItemText>
                <Combobox.ItemIndicator>✓</Combobox.ItemIndicator>
              </Combobox.Item>
            {/each}
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
  {/each}
</div>
