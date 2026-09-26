<script lang="ts">
  import { Slider } from "@moderno-ui/svelte";
</script>

<Slider.Root defaultValue={[20, 80]}>
  <Slider.Label>Price</Slider.Label>
  <Slider.ValueText />
  <Slider.Control>
    <Slider.Track>
      <Slider.Range />
    </Slider.Track>
    <Slider.Thumb index={0}>
      <Slider.HiddenInput />
    </Slider.Thumb>
    <Slider.Thumb index={1}>
      <Slider.HiddenInput />
    </Slider.Thumb>
  </Slider.Control>
</Slider.Root>
