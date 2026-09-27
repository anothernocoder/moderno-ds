import { Editable } from "@moderno-ui/react";

export function EditablePlaceholderDemo() {
  return (
    <Editable.Root placeholder="Untitled" maxLength={32}>
      <Editable.Label>File name</Editable.Label>
      <Editable.Area>
        <Editable.Input />
        <Editable.Preview />
      </Editable.Area>
    </Editable.Root>
  );
}
