<script lang="ts">
  import { ColorPicker } from "@moderno-ui/svelte";

  let color = $state("#1E90FF");
</script>

<div class="demo-row">
  <ColorPicker bind:value={color} />
  <span style:color>Aa</span>
</div>
