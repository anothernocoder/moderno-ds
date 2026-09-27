<script lang="ts">
  import { AngleSlider } from "@moderno-ui/svelte";

  const marks = [0, 45, 90, 135, 180, 225, 270, 315];
</script>

<AngleSlider.Root defaultValue={90} {marks}>
  <AngleSlider.Label>Gradient direction</AngleSlider.Label>
  <AngleSlider.Control>
    <AngleSlider.Thumb />
    <AngleSlider.MarkerGroup>
      {#each marks as mark (mark)}
        <AngleSlider.Marker value={mark} />
      {/each}
    </AngleSlider.MarkerGroup>
  </AngleSlider.Control>
  <AngleSlider.Input />
  <AngleSlider.HiddenInput />
</AngleSlider.Root>
