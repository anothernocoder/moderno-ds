/** @jsxImportSource solid-js */
import { Slider } from "@moderno-ui/solid";

export function SliderSizesDemo() {
  return (
    <div class="demo-stack">
      <Slider.Root size="sm" defaultValue={[25]}>
        <Slider.Label>Small</Slider.Label>
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
      <Slider.Root size="md" defaultValue={[50]}>
        <Slider.Label>Medium</Slider.Label>
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
      <Slider.Root size="lg" defaultValue={[75]}>
        <Slider.Label>Large</Slider.Label>
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
    </div>
  );
}
