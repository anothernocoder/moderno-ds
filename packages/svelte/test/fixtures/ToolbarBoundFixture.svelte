<script lang="ts">
  import { Toolbar } from "../../src/index.js";

  let { redoDisabled = false, onRedo }: { redoDisabled?: boolean; onRedo?: () => void } =
    $props();
  let bold = $state(false);
</script>

<Toolbar.Root aria-label="Text">
  <Toolbar.Toggle label="Bold" bind:pressed={bold}>B</Toolbar.Toggle>
  <Toolbar.Button label="Redo" disabled={redoDisabled} onclick={() => onRedo?.()}>R</Toolbar.Button>
</Toolbar.Root>
<output>{bold ? "bold" : "regular"}</output>
