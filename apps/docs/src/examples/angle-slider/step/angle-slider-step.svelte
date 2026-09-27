<script lang="ts">
  import { AngleSlider } from "@moderno-ui/svelte";
</script>

<AngleSlider.Root defaultValue={90} step={15}>
  <AngleSlider.Label>Direction</AngleSlider.Label>
  <AngleSlider.Control>
    <AngleSlider.Thumb />
  </AngleSlider.Control>
  <AngleSlider.Input />
  <AngleSlider.HiddenInput />
</AngleSlider.Root>
