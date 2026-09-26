<!--
  Badge — CSS-only; proves the optional dot part serialises.
-->
<script lang="ts">
  import { Badge } from "../../src/exports/badge.js";
  import type { SectionProps } from "../section.js";

  let {}: SectionProps = $props();
</script>

<section aria-label="badges">
  <Badge>Draft</Badge>
  <Badge variant="success" dot>Paid</Badge>
  <Badge variant="error" size="sm">Overdue</Badge>
</section>
