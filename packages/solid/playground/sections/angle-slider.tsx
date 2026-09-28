/**
 * AngleSlider — Ark's angle-slider machine: the thumb's slider role, value,
 * spoken value and label, the root's inline `--angle`, the markers' state
 * and the angle field's formatted text must reach the server.
 */
import { For } from "solid-js";
import { AngleSlider } from "../../src/angle-slider.jsx";
import type { Section } from "../section.js";

const MARKS = [0, 90, 180, 270];

const AngleSliderSection: Section = () => (
  <section aria-label="angle-slider">
    <AngleSlider.Root defaultValue={45} marks={MARKS}>
      <AngleSlider.Label>Rotation</AngleSlider.Label>
      <AngleSlider.Control>
        <AngleSlider.Thumb />
        <AngleSlider.MarkerGroup>
          <For each={MARKS}>{(mark) => <AngleSlider.Marker value={mark} />}</For>
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
);

export default AngleSliderSection;
