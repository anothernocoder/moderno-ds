<!-- A ColorPicker submitting its hex with a form. -->
<script lang="ts">
  import { ColorPicker } from "../../src/index.js";
</script>

<form>
  <ColorPicker name="brand" defaultValue="#1e90ff" swatches={["#f00"]} />
</form>
