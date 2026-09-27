<!--
  DonutChart — a ring and a pie over one traffic split, the second with a zero
  share and a gap between slices: the SVG is drawn on the server.
-->
<script lang="ts">
  import { DonutChart } from "../../src/exports/donut-chart.js";
  import type { SectionProps } from "../section.js";

  let {}: SectionProps = $props();

  const traffic = [
    { name: "Direct", value: 456 },
    { name: "Search", value: 351 },
    { name: "Referral", value: 271 },
  ];
  const withEmpty = [...traffic.slice(0, 1), { name: "Social", value: 0 }, ...traffic.slice(1)];
</script>

<section aria-label="donut chart">
  <DonutChart width={180} height={180} data={traffic} aria-label="Traffic by source" />
  <DonutChart width={180} height={180} data={withEmpty} innerRadius={0} padAngle={0.02} />
</section>
