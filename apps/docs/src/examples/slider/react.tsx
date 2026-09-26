import { Slider } from "@moderno-ui/react";

export function SliderDemo() {
  return (
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
    </Slider.Root>
  );
}
