/** @jsxImportSource solid-js */
import { AngleSlider } from "@moderno-ui/solid";

export function AngleSliderDemo() {
  return (
    <AngleSlider.Root defaultValue={45}>
      <AngleSlider.Label>Rotation</AngleSlider.Label>
      <AngleSlider.Control>
        <AngleSlider.Thumb />
      </AngleSlider.Control>
      <AngleSlider.Input />
      <AngleSlider.HiddenInput />
    </AngleSlider.Root>
  );
}
