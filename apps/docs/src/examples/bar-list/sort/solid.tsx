/** @jsxImportSource solid-js */
import { BarList } from "@moderno-ui/solid";

const days = [
  { name: "Monday", value: 64 },
  { name: "Tuesday", value: 82 },
  { name: "Wednesday", value: 71 },
  { name: "Thursday", value: 90 },
  { name: "Friday", value: 48 },
];

export function BarListSortDemo() {
  return <BarList width={420} data={days} sort="none" aria-label="Orders by day" />;
}
