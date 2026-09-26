<!--
  Skeleton — a CSS-only loading state; every shape reaches the server.
-->
<script lang="ts">
  import { Skeleton } from "../../src/exports/skeleton.js";
  import type { SectionProps } from "../section.js";

  let {}: SectionProps = $props();
</script>

<section aria-label="skeletons">
  <Skeleton />
  <Skeleton shape="rect" />
  <Skeleton shape="circle" />
</section>
