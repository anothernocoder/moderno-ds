<script lang="ts">
  import { Editable } from "../../src/index.js";

  let name = $state("Background");
</script>

<Editable.Root bind:value={name}>
  <Editable.Label>Layer name</Editable.Label>
  <Editable.Area>
    <Editable.Input />
    <Editable.Preview />
  </Editable.Area>
</Editable.Root>
<output>{name}</output>
