/**
 * A controlled Dialog: the open state is yours, passed as `open` and updated
 * from `onOpenChange`, so any code can open or close it — here a plain Button
 * outside the dialog, and one inside that closes it — @moderno-ui/react.
 */
import { useState } from "react";
import { Button, Dialog, Portal } from "@moderno-ui/react";

export function DialogControlledDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Show shortcuts
      </Button>
      <Dialog.Root open={open} onOpenChange={(details) => setOpen(details.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Title>Keyboard shortcuts</Dialog.Title>
              <Dialog.Description>
                Press ⌘K to search and Esc to close any dialog.
              </Dialog.Description>
              <div className="demo-row">
                <Button onClick={() => setOpen(false)}>Got it</Button>
              </div>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}
