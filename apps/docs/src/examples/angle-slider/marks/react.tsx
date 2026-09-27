import { AngleSlider } from "@moderno-ui/react";

const marks = [0, 45, 90, 135, 180, 225, 270, 315];

export function AngleSliderMarksDemo() {
  return (
    <AngleSlider.Root defaultValue={90} marks={marks}>
      <AngleSlider.Label>Gradient direction</AngleSlider.Label>
      <AngleSlider.Control>
        <AngleSlider.Thumb />
        <AngleSlider.MarkerGroup>
          {marks.map((mark) => (
            <AngleSlider.Marker key={mark} value={mark} />
          ))}
        </AngleSlider.MarkerGroup>
      </AngleSlider.Control>
      <AngleSlider.Input />
      <AngleSlider.HiddenInput />
    </AngleSlider.Root>
  );
}
