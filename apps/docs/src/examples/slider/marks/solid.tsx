/** @jsxImportSource solid-js */
import { Slider } from "@moderno-ui/solid";

export function SliderMarksDemo() {
  return (
    <Slider.Root defaultValue={[50]} step={25}>
      <Slider.Label>Brightness</Slider.Label>
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
        <Slider.Marker value={25}>25</Slider.Marker>
        <Slider.Marker value={50}>50</Slider.Marker>
        <Slider.Marker value={75}>75</Slider.Marker>
        <Slider.Marker value={100}>100</Slider.Marker>
      </Slider.MarkerGroup>
    </Slider.Root>
  );
}
