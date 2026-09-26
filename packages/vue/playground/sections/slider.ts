/**
 * Slider — Ark's slider machine: every thumb reaches the server as a slider
 * with its value and bounds (a range's two thumbs bound each other), the root
 * carries the range's offsets inline, and each marker knows where it sits.
 */
import { h } from "vue";
import { Slider } from "../../src/slider.js";
import type { Section } from "../section.js";

const SliderSection: Section = () =>
  h("section", { "aria-label": "slider" }, [
    h(Slider.Root, { defaultValue: [40] }, () => [
      h(Slider.Label, {}, () => "Volume"),
      h(Slider.ValueText),
      h(Slider.Control, {}, () => [
        h(Slider.Track, {}, () => h(Slider.Range)),
        h(Slider.Thumb, { index: 0 }, () => h(Slider.HiddenInput)),
      ]),
      h(Slider.MarkerGroup, {}, () => [
        h(Slider.Marker, { value: 0 }, () => "0"),
        h(Slider.Marker, { value: 50 }, () => "50"),
        h(Slider.Marker, { value: 100 }, () => "100"),
      ]),
    ]),
    h(Slider.Root, { size: "sm", defaultValue: [20, 80] }, () => [
      h(Slider.Label, {}, () => "Price"),
      h(Slider.Control, {}, () => [
        h(Slider.Track, {}, () => h(Slider.Range)),
        h(Slider.Thumb, { index: 0 }, () => h(Slider.HiddenInput)),
        h(Slider.Thumb, { index: 1 }, () => h(Slider.HiddenInput)),
      ]),
    ]),
  ]);

export default SliderSection;
