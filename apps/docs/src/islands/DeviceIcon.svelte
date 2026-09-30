<!--
  A phone, tablet or desktop outline, drawn at the size of a `.demo-tab` icon.
  Shared by the screen/flow device tabs and the block breakpoint switch.
-->
<script lang="ts">
  let { device }: { device: "phone" | "tablet" | "desktop" } = $props();
</script>

<svg class="demo-tab-icon" viewBox="0 0 24 24" aria-hidden="true">
  {#if device === "phone"}
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <path d="M12 18h.01" />
  {:else if device === "tablet"}
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M12 18h.01" />
  {:else}
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  {/if}
</svg>
