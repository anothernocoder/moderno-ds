/** @jsxImportSource solid-js */
import { Chip } from "@moderno-ui/solid";

export function ChipVariantsDemo() {
  return (
    <div class="demo-row">
      <Chip variant="outline">Outline</Chip>
      <Chip variant="muted">Muted</Chip>
      <Chip variant="solid">Solid</Chip>
    </div>
  );
}
