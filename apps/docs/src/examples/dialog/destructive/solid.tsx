/** @jsxImportSource solid-js */
import { Button, Dialog, Portal } from "@moderno-ui/solid";

export function DialogDestructiveDemo() {
  return (
    <Dialog.Root role="alertdialog">
      <Dialog.Trigger
        asChild={(triggerProps) => (
          <Button {...triggerProps()} variant="destructive">
            Delete project
          </Button>
        )}
      ></Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Title>Delete project</Dialog.Title>
            <Dialog.Description>
              This permanently removes the project and everything in it. This cannot be undone.
            </Dialog.Description>
            <div class="demo-row">
              <Dialog.CloseTrigger
                asChild={(closeProps) => (
                  <Button {...closeProps()} variant="outline">
                    Cancel
                  </Button>
                )}
              ></Dialog.CloseTrigger>
              <Dialog.CloseTrigger
                asChild={(closeProps) => (
                  <Button {...closeProps()} variant="destructive">
                    Delete
                  </Button>
                )}
              ></Dialog.CloseTrigger>
            </div>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
