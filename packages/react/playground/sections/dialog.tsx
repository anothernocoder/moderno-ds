/**
 * Dialog — a Portal + focus-trap machine that must emit a stable,
 * hydration-safe trigger while its content stays unmounted-visible. `open`
 * mounts the content, so its portal and `useId` wiring hydrate too.
 */
import { Dialog, Portal } from "../../src/dialog.js";
import type { Section } from "../section.js";

const DialogSection: Section = ({ open }) => (
  <section aria-label="dialog">
    <Dialog.Root defaultOpen={open}>
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
