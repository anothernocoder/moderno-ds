/** @jsxImportSource solid-js */
import { Editable } from "@moderno-ui/solid";

export function EditableLongDemo() {
  return (
    <Editable.Root defaultValue="Background gradient with a soft grain overlay">
      <Editable.Label>Layer name</Editable.Label>
      <Editable.Area>
        <Editable.Input />
        <Editable.Preview />
      </Editable.Area>
    </Editable.Root>
  );
}
