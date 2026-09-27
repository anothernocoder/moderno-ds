import { DonutChart } from "@moderno-ui/react";

const data = [
  { name: "Direct", value: 456 },
  { name: "Search", value: 351 },
  { name: "Referral", value: 271 },
  { name: "Social", value: 120 },
];

export function DonutChartSliceGapsDemo() {
  return (
    <DonutChart
      width={240}
      height={240}
      data={data}
      padAngle={0.03}
      aria-label="Traffic by source"
    />
  );
}
