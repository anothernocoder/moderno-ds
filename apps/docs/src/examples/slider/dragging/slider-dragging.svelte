<script lang="ts">
  import { Slider } from "@moderno-ui/svelte";
</script>

<Slider.Root defaultValue={[70]}>
  <Slider.Label>Opacity</Slider.Label>
  <Slider.Control>
    <Slider.Track>
      <Slider.Range />
    </Slider.Track>
    <Slider.Thumb index={0}>
      <Slider.HiddenInput />
      <Slider.DraggingIndicator />
    </Slider.Thumb>
  </Slider.Control>
</Slider.Root>
