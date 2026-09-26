<!--
  Spinner — a CSS-only loading state; the status role, ring and label reach
  the server.
-->
<script lang="ts">
  import { Spinner } from "../../src/exports/spinner.js";
  import type { SectionProps } from "../section.js";

  let {}: SectionProps = $props();
</script>

<section aria-label="spinners">
  <Spinner />
  <Spinner size="lg" label="Saving changes" />
</section>
