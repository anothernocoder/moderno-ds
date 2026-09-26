<!--
  Chip — CSS-only; proves the optional remove button serialises.
-->
<script lang="ts">
  import { Chip } from "../../src/exports/chip.js";
  import type { SectionProps } from "../section.js";

  let {}: SectionProps = $props();
</script>

<section aria-label="chips">
  <Chip>Design</Chip>
  <Chip variant="muted" size="sm" removable removeLabel="Remove React">React</Chip>
</section>
