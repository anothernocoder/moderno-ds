/** @jsxImportSource solid-js */
import { Button, Dialog, Portal } from "@moderno-ui/solid";

export function DialogDemo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger
        asChild={(triggerProps) => <Button {...triggerProps()}>Publish changes</Button>}
      ></Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Title>Publish changes?</Dialog.Title>
            <Dialog.Description>
              Your edits go live for everyone with access to this site.
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
                asChild={(closeProps) => <Button {...closeProps()}>Publish</Button>}
              ></Dialog.CloseTrigger>
            </div>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
