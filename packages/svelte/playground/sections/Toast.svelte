<!--
  Toast — Ark's toast group machine: the Toaster renders its live region,
  named after the toaster's placement, on the server. Toasts only arrive once
  a client calls the toaster, so the server string holds the empty region and
  the snippet each toast would go through. A section has no toast to open, so
  it ignores `open`.
-->
<script lang="ts">
  import { Toast, Toaster, createToaster } from "../../src/exports/toast.js";
  import type { SectionProps } from "../section.js";

  let {}: SectionProps = $props();

  const toaster = createToaster({ placement: "bottom-end" });
</script>

<section aria-label="toast">
  <Toaster {toaster}>
    {#snippet children(toast)}
      <Toast.Root size="sm">
        <Toast.Title>{toast().title}</Toast.Title>
        <Toast.Description>{toast().description}</Toast.Description>
        <Toast.CloseTrigger aria-label="Dismiss">×</Toast.CloseTrigger>
      </Toast.Root>
    {/snippet}
  </Toaster>
</section>
