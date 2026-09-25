/**
 * A Dialog holding a short form. With no role override Ark focuses the first
 * focusable element in the content on open — here the input — @moderno-
 * ui/react.
 */
import { Button, Dialog, Field, Portal } from "@moderno-ui/react";

export function DialogFormDemo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="outline">Rename project</Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Title>Rename project</Dialog.Title>
            <Dialog.Description>
              The new name shows in the sidebar and in every link to the project.
            </Dialog.Description>
            <Field.Root>
              <Field.Label>Project name</Field.Label>
              <Field.Input defaultValue="Moderno" />
            </Field.Root>
            <div className="demo-row">
              <Dialog.CloseTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.CloseTrigger>
              <Dialog.CloseTrigger asChild>
                <Button>Save</Button>
              </Dialog.CloseTrigger>
            </div>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
