/** @jsxImportSource solid-js */
import { Button, Dialog, Field, Portal } from "@moderno-ui/solid";

export function DialogFormDemo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger
        asChild={(triggerProps) => (
          <Button {...triggerProps()} variant="outline">
            Rename project
          </Button>
        )}
      ></Dialog.Trigger>
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
              <Field.Input value="Moderno" />
            </Field.Root>
            <div class="demo-row">
              <Dialog.CloseTrigger
                asChild={(closeProps) => (
                  <Button {...closeProps()} variant="outline">
                    Cancel
                  </Button>
                )}
              ></Dialog.CloseTrigger>
              <Dialog.CloseTrigger
                asChild={(closeProps) => <Button {...closeProps()}>Save</Button>}
              ></Dialog.CloseTrigger>
            </div>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
