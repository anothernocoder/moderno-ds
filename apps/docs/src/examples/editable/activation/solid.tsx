/** @jsxImportSource solid-js */
import { Editable } from "@moderno-ui/solid";

export function EditableActivationDemo() {
  return (
    <Editable.Root defaultValue="Voice-over" activationMode="click">
      <Editable.Label>Track name</Editable.Label>
      <Editable.Area>
        <Editable.Input />
        <Editable.Preview />
      </Editable.Area>
    </Editable.Root>
  );
}
