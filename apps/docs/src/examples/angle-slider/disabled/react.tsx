import { AngleSlider } from "@moderno-ui/react";

export function AngleSliderDisabledDemo() {
  return (
    <AngleSlider.Root defaultValue={90} disabled>
      <AngleSlider.Label>Rotation</AngleSlider.Label>
      <AngleSlider.Control>
        <AngleSlider.Thumb />
      </AngleSlider.Control>
      <AngleSlider.Input />
      <AngleSlider.HiddenInput />
    </AngleSlider.Root>
  );
}
