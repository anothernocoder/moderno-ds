/** @jsxImportSource solid-js */
import { BarList } from "@moderno-ui/solid";

const sources = [
  { name: "Search", value: 4820 },
  { name: "Direct", value: 2310 },
  { name: "Social", value: 1470 },
  { name: "Email", value: 860 },
  { name: "Referral", value: 540 },
  { name: "Ads", value: 290 },
];

export function BarListRowSizeDemo() {
  return (
    <BarList
      width={420}
      data={sources}
      rowHeight={24}
      barHeight={4}
      aria-label="Visits by source"
    />
  );
}
