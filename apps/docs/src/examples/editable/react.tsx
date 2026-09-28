import { Editable } from "@moderno-ui/react";

export function EditableDemo() {
  return (
    <Editable.Root defaultValue="Background">
      <Editable.Label>Layer name</Editable.Label>
      <Editable.Area>
        <Editable.Input />
        <Editable.Preview />
      </Editable.Area>
    </Editable.Root>
  );
}
