/**
 * Slider — Ark's slider machine: each thumb's slider role, value, bounds and
 * ids, the root's inline range offsets, and the markers' state must reach the
 * server.
 */
import { Slider } from "../../src/slider.jsx";
import type { Section } from "../section.js";

const SliderSection: Section = () => (
  <section aria-label="slider">
    <Slider.Root defaultValue={[40]}>
      <Slider.Label>Volume</Slider.Label>
      <Slider.ValueText />
      <Slider.Control>
        <Slider.Track>
          <Slider.Range />
        </Slider.Track>
        <Slider.Thumb index={0}>
          <Slider.HiddenInput />
        </Slider.Thumb>
      </Slider.Control>
      <Slider.MarkerGroup>
        <Slider.Marker value={0}>0</Slider.Marker>
        <Slider.Marker value={50}>50</Slider.Marker>
        <Slider.Marker value={100}>100</Slider.Marker>
      </Slider.MarkerGroup>
    </Slider.Root>
    <Slider.Root size="sm" defaultValue={[20, 80]}>
      <Slider.Label>Price</Slider.Label>
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
  </section>
);

export default SliderSection;
