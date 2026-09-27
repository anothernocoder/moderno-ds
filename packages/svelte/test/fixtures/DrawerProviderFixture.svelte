<script lang="ts">
  import { useDialog } from "@ark-ui/svelte";
  import { Drawer } from "../../src/index.js";

  const dialog = useDialog();
</script>

<Drawer.RootProvider value={dialog} placement="left">
  <Drawer.Positioner data-testid="positioner">
    <Drawer.Content data-testid="filters" />
  </Drawer.Positioner>
</Drawer.RootProvider>
