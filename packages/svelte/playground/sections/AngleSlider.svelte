<!--
  AngleSlider — Ark's angle-slider machine: the thumb's slider role, value,
  spoken value and label, the root's inline `--angle`, the markers' state
  and the angle field's formatted text reach the server string.
-->
<script lang="ts">
  import { AngleSlider } from "../../src/exports/angle-slider.js";
  import type { SectionProps } from "../section.js";

  let {}: SectionProps = $props();

  const MARKS = [0, 90, 180, 270];
</script>

<section aria-label="angle-slider">
  <AngleSlider.Root defaultValue={45} marks={MARKS}>
    <AngleSlider.Label>Rotation</AngleSlider.Label>
    <AngleSlider.Control>
      <AngleSlider.Thumb />
      <AngleSlider.MarkerGroup>
        {#each MARKS as mark (mark)}
          <AngleSlider.Marker value={mark} />
        {/each}
      </AngleSlider.MarkerGroup>
    </AngleSlider.Control>
    <AngleSlider.Input />
    <AngleSlider.HiddenInput />
  </AngleSlider.Root>
  <AngleSlider.Root size="sm" defaultValue={370} step={15}>
    <AngleSlider.Label>Direction</AngleSlider.Label>
    <AngleSlider.Control>
      <AngleSlider.Thumb />
    </AngleSlider.Control>
  </AngleSlider.Root>
</section>
