import { RadioGroup } from "@moderno-ui/react";

const layouts = [
  { value: "title", label: "Title", shape: "M3 3.5h10v2H3z" },
  { value: "split", label: "Split", shape: "M2 2.5h5v1H2zm0 2h5v1H2zm0 2h3v1H2zM9 1.5h5v6H9z" },
  {
    value: "grid",
    label: "Grid",
    shape: "M2 1.5h5.5v2.75H2zm6.5 0H14v2.75H8.5zM2 4.75h5.5V7.5H2zm6.5 0H14V7.5H8.5z",
  },
];

export function RadioGroupTilesDemo() {
  return (
    <RadioGroup.Root variant="tile" defaultValue="split">
      <RadioGroup.Label>Slide layout</RadioGroup.Label>
      {layouts.map((layout) => (
        <RadioGroup.Item key={layout.value} value={layout.value}>
          <RadioGroup.ItemMedia>
            <svg viewBox="0 0 16 9" fill="currentColor" aria-hidden="true">
              <path d={layout.shape} />
            </svg>
          </RadioGroup.ItemMedia>
          <RadioGroup.ItemControl />
          <RadioGroup.ItemText>{layout.label}</RadioGroup.ItemText>
          <RadioGroup.ItemHiddenInput />
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}
