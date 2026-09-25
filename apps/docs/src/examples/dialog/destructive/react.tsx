import { Button, Dialog, Portal } from "@moderno-ui/react";

export function DialogDestructiveDemo() {
  return (
    <Dialog.Root role="alertdialog">
      <Dialog.Trigger asChild>
        <Button variant="destructive">Delete project</Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Title>Delete project</Dialog.Title>
            <Dialog.Description>
              This permanently removes the project and everything in it. This cannot be undone.
            </Dialog.Description>
            <div className="demo-row">
              <Dialog.CloseTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.CloseTrigger>
              <Dialog.CloseTrigger asChild>
                <Button variant="destructive">Delete</Button>
              </Dialog.CloseTrigger>
            </div>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
