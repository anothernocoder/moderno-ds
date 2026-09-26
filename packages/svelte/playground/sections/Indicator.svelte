<!--
  Indicator — CSS-only; proves the optional label and the bare `data-pulse`
  attribute serialise.
-->
<script lang="ts">
  import { Indicator } from "../../src/exports/indicator.js";
  import type { SectionProps } from "../section.js";

  let {}: SectionProps = $props();
</script>

<section aria-label="indicators">
  <Indicator variant="success" pulse>Online</Indicator>
  <Indicator variant="error" size="sm" aria-label="Offline" />
</section>
