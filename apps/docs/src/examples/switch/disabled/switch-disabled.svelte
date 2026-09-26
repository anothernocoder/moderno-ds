<script lang="ts">
  import { Switch } from "@moderno-ui/svelte";
</script>

<Switch.Root disabled defaultChecked>
  <Switch.Control>
    <Switch.Thumb />
  </Switch.Control>
  <Switch.Label>Sync over mobile data</Switch.Label>
  <Switch.HiddenInput />
</Switch.Root>
