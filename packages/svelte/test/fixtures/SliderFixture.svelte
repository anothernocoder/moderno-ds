<script lang="ts">
  import { Slider } from "../../src/index.js";
  import type { SliderSize, SliderValueChangeDetails } from "../../src/index.js";

  let {
    size = undefined,
    value = undefined,
    defaultValue = undefined,
    disabled = false,
    onValueChange = undefined,
  }: {
    size?: SliderSize;
    value?: number[];
    defaultValue?: number[];
    disabled?: boolean;
    onValueChange?: (details: SliderValueChangeDetails) => void;
  } = $props();

  const thumbs = $derived((value ?? defaultValue ?? [0]).map((_, index) => index));
</script>

<Slider.Root {size} {value} {defaultValue} {disabled} {onValueChange} class="volume">
  <Slider.Label>Volume</Slider.Label>
  <Slider.ValueText />
  <Slider.Control>
    <Slider.Track>
      <Slider.Range />
    </Slider.Track>
    {#each thumbs as index (index)}
      <Slider.Thumb {index}>
        <Slider.HiddenInput />
      </Slider.Thumb>
    {/each}
  </Slider.Control>
  <Slider.MarkerGroup>
    <Slider.Marker value={0}>0</Slider.Marker>
    <Slider.Marker value={50}>50</Slider.Marker>
    <Slider.Marker value={100}>100</Slider.Marker>
  </Slider.MarkerGroup>
</Slider.Root>
