<script lang="ts">
  import { DonutChart } from "@moderno-ui/svelte";

  const data = [
    { name: "Direct", value: 456 },
    { name: "Search", value: 351 },
    { name: "Referral", value: 271 },
    { name: "Social", value: 120 },
  ];
</script>

<DonutChart width={240} height={240} {data} innerRadius={0} aria-label="Traffic by source" />
