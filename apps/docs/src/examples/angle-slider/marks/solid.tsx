/** @jsxImportSource solid-js */
import { For } from "solid-js";
import { AngleSlider } from "@moderno-ui/solid";

const marks = [0, 45, 90, 135, 180, 225, 270, 315];

export function AngleSliderMarksDemo() {
  return (
    <AngleSlider.Root defaultValue={90} marks={marks}>
      <AngleSlider.Label>Gradient direction</AngleSlider.Label>
      <AngleSlider.Control>
        <AngleSlider.Thumb />
        <AngleSlider.MarkerGroup>
          <For each={marks}>{(mark) => <AngleSlider.Marker value={mark} />}</For>
        </AngleSlider.MarkerGroup>
      </AngleSlider.Control>
      <AngleSlider.Input />
      <AngleSlider.HiddenInput />
    </AngleSlider.Root>
  );
}
