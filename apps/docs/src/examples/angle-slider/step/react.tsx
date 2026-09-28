import { AngleSlider } from "@moderno-ui/react";

export function AngleSliderStepDemo() {
  return (
    <AngleSlider.Root defaultValue={90} step={15}>
      <AngleSlider.Label>Direction</AngleSlider.Label>
      <AngleSlider.Control>
        <AngleSlider.Thumb />
      </AngleSlider.Control>
      <AngleSlider.Input />
      <AngleSlider.HiddenInput />
    </AngleSlider.Root>
  );
}
