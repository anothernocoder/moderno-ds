<!--
  Live Select preview — the real @moderno-ui/svelte Select. `Root` is the only
  wrapped part (it injects the `size` recipe); Trigger, Positioner, Content and
  Item are Ark's verbatim, and components.css keys their density off the
  `data-size` the recipe puts on the root.

  The three sizes render side by side in their resting state, which is what the
  size recipe is *for*: `data-size` only ever changes the trigger. The menu is
  portalled and opens on click — it is deliberately not forced open here,
  because a floating panel anchored by floating-ui settles a frame or two after
  hydration and this page is captured pixel-for-pixel by the visual suite.
-->
<script lang="ts">
  import { Select, Portal, createListCollection } from "@moderno-ui/svelte";

  const frameworks = createListCollection({
    items: [
      { label: "React", value: "react" },
      { label: "Vue", value: "vue" },
      { label: "Svelte", value: "svelte" },
      { label: "Solid", value: "solid" },
    ],
  });

  const sizes = [
    { size: "sm", label: "Small", value: [] as string[] },
    { size: "md", label: "Medium", value: ["svelte"] },
    { size: "lg", label: "Large", value: [] as string[] },
  ] as const;
</script>

<div class="demo-selects">
  {#each sizes as demo (demo.size)}
    <Select.Root collection={frameworks} size={demo.size} defaultValue={[...demo.value]}>
      <Select.Label>{demo.label}</Select.Label>
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
  {/each}
</div>

<style>
  /* Stacked at every width: three triggers side by side inside the preview
     panel would each be narrower than the value they have to show, which is
     the one thing the size recipe is here to demonstrate. */
  .demo-selects {
    display: grid;
    gap: var(--spacing-5);
    justify-items: start;
  }
</style>
