<!--
  Toggle — Ark's toggle machine on a native button; the pressed state
  (aria-pressed, data-state), the Indicator's on/off content and the disabled
  button reach the server string.
-->
<script lang="ts">
  import { Toggle } from "../../src/exports/toggle.js";
  import type { SectionProps } from "../section.js";

  let {}: SectionProps = $props();
</script>

<section aria-label="toggles">
  <Toggle.Root defaultPressed>
    <Toggle.Indicator>
      {#snippet fallback()}☆{/snippet}
      ★
    </Toggle.Indicator>
    Favorite
  </Toggle.Root>
  <Toggle.Root variant="outline" size="sm" disabled>
    <Toggle.Indicator>
      {#snippet fallback()}☆{/snippet}
      ★
    </Toggle.Indicator>
    Pin
  </Toggle.Root>
</section>
