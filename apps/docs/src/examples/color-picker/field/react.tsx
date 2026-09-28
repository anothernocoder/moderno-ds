import { ColorPicker, Field } from "@moderno-ui/react";

export function ColorPickerFieldDemo() {
  return (
    <Field.Root>
      <Field.Label>Brand color</Field.Label>
      <ColorPicker defaultValue="#1E90FF" />
      <Field.HelperText>Used for buttons and links.</Field.HelperText>
    </Field.Root>
  );
}
