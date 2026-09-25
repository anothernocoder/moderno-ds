<script lang="ts">
  import { AreaChart } from "@moderno-ui/svelte";

  const series = [
    {
      name: "Net cash flow",
      points: [
        { x: 0, y: 6 },
        { x: 1, y: 2 },
        { x: 2, y: -4 },
        { x: 3, y: -1 },
        { x: 4, y: 5 },
        { x: 5, y: 9 },
      ],
    },
  ];
</script>

<AreaChart width={520} height={260} {series} xTicks={6} yTicks={5} />
