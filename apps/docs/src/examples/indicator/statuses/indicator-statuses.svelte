<script lang="ts">
  import { Indicator } from "@moderno-ui/svelte";
</script>

<div class="demo-row">
  <Indicator variant="neutral">Idle</Indicator>
  <Indicator variant="info">Syncing</Indicator>
  <Indicator variant="success">Online</Indicator>
  <Indicator variant="warning">Degraded</Indicator>
  <Indicator variant="error">Offline</Indicator>
</div>
