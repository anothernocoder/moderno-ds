<script lang="ts">
  import { AngleSlider } from "../../src/index.js";

  let angle = $state(30);
</script>

<AngleSlider.Root bind:value={angle}>
  <AngleSlider.Label>Rotation</AngleSlider.Label>
  <AngleSlider.Control>
    <AngleSlider.Thumb />
  </AngleSlider.Control>
</AngleSlider.Root>
<output>{angle}</output>
<button type="button" onclick={() => (angle = 370)}>Turn</button>
