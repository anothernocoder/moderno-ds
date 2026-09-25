/**
 * A Dialog opened from its trigger: Ark portals the content, traps focus,
 * locks scroll and restores focus to the trigger on close. Triggers render
 * through `asChild`, so each button is the design system's own Button —
 * @moderno-ui/react.
 */
import { Button, Dialog, Portal } from "@moderno-ui/react";

export function DialogDemo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button>Publish changes</Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Title>Publish changes?</Dialog.Title>
            <Dialog.Description>
              Your edits go live for everyone with access to this site.
            </Dialog.Description>
            <div className="demo-row">
              <Dialog.CloseTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.CloseTrigger>
              <Dialog.CloseTrigger asChild>
                <Button>Publish</Button>
              </Dialog.CloseTrigger>
            </div>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
