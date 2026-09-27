<!--
  SparkChart — a plain trend line and a filled one with its last point marked;
  the SVG is drawn on the server.
-->
<script lang="ts">
  import { SparkChart } from "../../src/exports/spark-chart.js";
  import type { SectionProps } from "../section.js";

  let {}: SectionProps = $props();

  const visits = [
    { x: 0, y: 12 },
    { x: 1, y: 18 },
    { x: 2, y: 15 },
    { x: 3, y: 24 },
    { x: 4, y: 21 },
    { x: 5, y: 30 },
  ];
</script>

<section aria-label="spark charts">
  <SparkChart points={visits} aria-label="Visits, last 6 days" />
  <SparkChart points={visits} area showLastPoint aria-label="Visits, with today marked" />
</section>
