<!--
  BarList — a ranking drawn on the server as one SVG, rows sorted largest
  first.
-->
<script lang="ts">
  import { BarList } from "../../src/exports/bar-list.js";
  import type { SectionProps } from "../section.js";

  let {}: SectionProps = $props();

  const pages = [
    { name: "/blog", value: 320 },
    { name: "/", value: 1240 },
    { name: "/pricing", value: 860 },
    { name: "/docs", value: 540 },
  ];
</script>

<section aria-label="bar list">
  <BarList width={320} data={pages} aria-label="Visits by page" />
</section>
