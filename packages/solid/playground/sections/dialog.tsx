/**
 * Dialog — a Portal + focus-trap machine that must emit a stable trigger while
 * its content stays unmounted. Solid's <Portal> is client-only, so `open`
 * leaves the content out of the server string but still serialises the open
 * state onto the trigger.
 */
import { Dialog, Portal } from "../../src/dialog.js";
import type { Section } from "../section.js";

const DialogSection: Section = (props) => (
  <section aria-label="dialog">
    <Dialog.Root defaultOpen={props.open}>
      <Dialog.Trigger>Open dialog</Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Title>Delete account</Dialog.Title>
            <Dialog.Description>This action cannot be undone.</Dialog.Description>
            <Dialog.CloseTrigger>Cancel</Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  </section>
);

export default DialogSection;
