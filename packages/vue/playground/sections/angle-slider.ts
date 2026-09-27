/**
 * AngleSlider — Ark's angle-slider machine: the thumb reaches the server as
 * a slider with its value, spoken value and label, the root carries
 * `--angle` inline, each marker knows where it sits, and the angle field
 * shows the formatted angle.
 */
import { h } from "vue";
import { AngleSlider } from "../../src/angle-slider.js";
import type { Section } from "../section.js";

const MARKS = [0, 90, 180, 270];

const AngleSliderSection: Section = () =>
  h("section", { "aria-label": "angle-slider" }, [
    h(AngleSlider.Root, { defaultValue: 45, marks: MARKS }, () => [
      h(AngleSlider.Label, {}, () => "Rotation"),
      h(AngleSlider.Control, {}, () => [
        h(AngleSlider.Thumb),
        h(AngleSlider.MarkerGroup, {}, () =>
          MARKS.map((mark) => h(AngleSlider.Marker, { key: mark, value: mark })),
        ),
      ]),
      h(AngleSlider.Input),
      h(AngleSlider.HiddenInput),
    ]),
    h(AngleSlider.Root, { size: "sm", defaultValue: 370, step: 15 }, () => [
      h(AngleSlider.Label, {}, () => "Direction"),
      h(AngleSlider.Control, {}, () => h(AngleSlider.Thumb)),
    ]),
  ]);

export default AngleSliderSection;
