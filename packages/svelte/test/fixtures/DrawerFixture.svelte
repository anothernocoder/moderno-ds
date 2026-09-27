<script lang="ts">
  import { Drawer } from "../../src/index.js";
  import type { DrawerOpenChangeDetails, DrawerPlacement } from "../../src/index.js";

  let {
    placement = undefined,
    open = $bindable(),
    onOpenChange = undefined,
  }: {
    placement?: DrawerPlacement;
    open?: boolean;
    onOpenChange?: (details: DrawerOpenChangeDetails) => void;
  } = $props();
</script>

<Drawer.Root {placement} bind:open {onOpenChange}>
  <Drawer.Trigger>Filters</Drawer.Trigger>
  <Drawer.Backdrop data-testid="backdrop" />
  <Drawer.Positioner data-testid="positioner">
    <Drawer.Content class="filters" data-testid="filters">
      <Drawer.Title>Filters</Drawer.Title>
      <Drawer.Description>Narrow the list of orders.</Drawer.Description>
      <Drawer.CloseTrigger aria-label="Close">×</Drawer.CloseTrigger>
    </Drawer.Content>
  </Drawer.Positioner>
</Drawer.Root>
