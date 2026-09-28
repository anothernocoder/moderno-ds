<script lang="ts">
  import { AngleSlider } from "@moderno-ui/svelte";
</script>

<AngleSlider.Root defaultValue={45}>
  <AngleSlider.Label>Rotation</AngleSlider.Label>
  <AngleSlider.Control>
    <AngleSlider.Thumb />
  </AngleSlider.Control>
  <AngleSlider.Input />
  <AngleSlider.HiddenInput />
</AngleSlider.Root>
