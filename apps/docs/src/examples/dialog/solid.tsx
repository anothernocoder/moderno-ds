/** @jsxImportSource solid-js */
/**
 * A Dialog opened from its trigger: Ark portals the content, traps focus,
 * locks scroll and restores focus to the trigger on close. Triggers render
 * through `asChild`, so each button is the design system's own Button —
 * @moderno-ui/solid.
 *
 * See examples/button/solid.tsx for why the pragma above is required.
 */
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
