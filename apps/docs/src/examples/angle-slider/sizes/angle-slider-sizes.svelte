<script lang="ts">
  import { AngleSlider } from "@moderno-ui/svelte";
</script>

<div class="demo-row">
  <AngleSlider.Root size="sm" defaultValue={30}>
    <AngleSlider.Label>Small</AngleSlider.Label>
    <AngleSlider.Control>
      <AngleSlider.Thumb />
    </AngleSlider.Control>
    <AngleSlider.Input />
    <AngleSlider.HiddenInput />
  </AngleSlider.Root>
  <AngleSlider.Root size="md" defaultValue={60}>
    <AngleSlider.Label>Medium</AngleSlider.Label>
    <AngleSlider.Control>
      <AngleSlider.Thumb />
    </AngleSlider.Control>
    <AngleSlider.Input />
    <AngleSlider.HiddenInput />
  </AngleSlider.Root>
  <AngleSlider.Root size="lg" defaultValue={90}>
    <AngleSlider.Label>Large</AngleSlider.Label>
    <AngleSlider.Control>
      <AngleSlider.Thumb />
    </AngleSlider.Control>
    <AngleSlider.Input />
    <AngleSlider.HiddenInput />
  </AngleSlider.Root>
</div>
