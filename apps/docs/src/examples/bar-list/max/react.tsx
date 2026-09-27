import { BarList } from "@moderno-ui/react";

const teams = [
  { name: "Design", value: 82 },
  { name: "Engineering", value: 64 },
  { name: "Marketing", value: 45 },
  { name: "Sales", value: 30 },
];
const format = (value: number) => `${value}%`;

export function BarListMaxDemo() {
  return (
    <BarList
      width={420}
      data={teams}
      max={100}
      format={format}
      aria-label="Goal progress by team"
    />
  );
}
