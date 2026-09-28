<script lang="ts">
  import { AngleSlider } from "../../src/index.js";
  import type { AngleSliderSize, AngleSliderValueChangeDetails } from "../../src/index.js";

  let {
    size = undefined,
    value = undefined,
    defaultValue = undefined,
    step = undefined,
    marks = undefined,
    disabled = false,
    getAriaValueText = undefined,
    onValueChange = undefined,
    onValueChangeEnd = undefined,
  }: {
    size?: AngleSliderSize;
    value?: number;
    defaultValue?: number;
    step?: number;
    marks?: number[];
    disabled?: boolean;
    getAriaValueText?: (value: number) => string;
    onValueChange?: (details: AngleSliderValueChangeDetails) => void;
    onValueChangeEnd?: (details: AngleSliderValueChangeDetails) => void;
  } = $props();
</script>

<AngleSlider.Root
  {size}
  {value}
  {defaultValue}
  {step}
  {marks}
  {disabled}
  {getAriaValueText}
  {onValueChange}
  {onValueChangeEnd}
  class="rotation"
>
  <AngleSlider.Label>Rotation</AngleSlider.Label>
  <AngleSlider.Control>
    <AngleSlider.Thumb />
    <AngleSlider.MarkerGroup>
      {#each marks ?? [] as mark (mark)}
        <AngleSlider.Marker value={mark} />
      {/each}
    </AngleSlider.MarkerGroup>
  </AngleSlider.Control>
  <AngleSlider.Input />
  <AngleSlider.HiddenInput />
</AngleSlider.Root>
