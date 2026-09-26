<!--
  Dialog — a Portal + focus-trap machine that must emit a stable trigger
  while its content stays unmounted. `open` mounts the content, and the
  trigger reports it.
-->
<script lang="ts">
  import { Dialog } from "../../src/exports/dialog.js";
  import { Portal } from "../../src/exports/portal.js";
  import type { SectionProps } from "../section.js";

  let { open }: SectionProps = $props();
</script>

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
