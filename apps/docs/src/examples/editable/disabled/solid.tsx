/** @jsxImportSource solid-js */
import { Editable } from "@moderno-ui/solid";

export function EditableDisabledDemo() {
  return (
    <Editable.Root defaultValue="Locked layer" disabled>
      <Editable.Label>Layer name</Editable.Label>
      <Editable.Area>
        <Editable.Input />
        <Editable.Preview />
      </Editable.Area>
    </Editable.Root>
  );
}
