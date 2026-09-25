<script lang="ts">
  import { Switch } from "@moderno-ui/svelte";
</script>

<Switch.Root invalid>
  <Switch.Control>
    <Switch.Thumb />
  </Switch.Control>
  <Switch.Label>Share my location</Switch.Label>
  <Switch.HiddenInput />
</Switch.Root>
