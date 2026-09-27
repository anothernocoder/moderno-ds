<!-- A ColorPicker bound with bind:value (unset unless `value` is given), a button that sets the value from outside and the value as text. -->
<script lang="ts">
  import { ColorPicker } from "../../src/index.js";

  let { value = $bindable() }: { value?: string } = $props();
</script>

<ColorPicker bind:value swatches={["#ff0000"]} />
<output data-testid="value">{value}</output>
<button type="button" onclick={() => (value = "#00FF00")}>Green</button>
