import { RadioGroup } from "@moderno-ui/react";

const sizes = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
] as const;

export function RadioGroupSizesDemo() {
  return (
    <div className="demo-row">
      {sizes.map((size) => (
        <RadioGroup.Root key={size.value} size={size.value} defaultValue="yes">
          <RadioGroup.Label>{size.label}</RadioGroup.Label>
          <RadioGroup.Item value="yes">
            <RadioGroup.ItemControl />
            <RadioGroup.ItemText>Yes</RadioGroup.ItemText>
            <RadioGroup.ItemHiddenInput />
          </RadioGroup.Item>
          <RadioGroup.Item value="no">
            <RadioGroup.ItemControl />
            <RadioGroup.ItemText>No</RadioGroup.ItemText>
            <RadioGroup.ItemHiddenInput />
          </RadioGroup.Item>
        </RadioGroup.Root>
      ))}
    </div>
  );
}
