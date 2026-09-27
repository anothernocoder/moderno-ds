<script lang="ts">
  import { Editable } from "@moderno-ui/svelte";
</script>

<div class="demo-row">
  <Editable.Root size="sm" defaultValue="Layer 1">
    <Editable.Label>Small</Editable.Label>
    <Editable.Area>
      <Editable.Input />
      <Editable.Preview />
    </Editable.Area>
  </Editable.Root>
  <Editable.Root size="md" defaultValue="Layer 2">
    <Editable.Label>Medium</Editable.Label>
    <Editable.Area>
      <Editable.Input />
      <Editable.Preview />
    </Editable.Area>
  </Editable.Root>
  <Editable.Root size="lg" defaultValue="Layer 3">
    <Editable.Label>Large</Editable.Label>
    <Editable.Area>
      <Editable.Input />
      <Editable.Preview />
    </Editable.Area>
  </Editable.Root>
</div>
