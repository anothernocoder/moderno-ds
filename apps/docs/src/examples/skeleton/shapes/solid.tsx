/** @jsxImportSource solid-js */
import { Skeleton } from "@moderno-ui/solid";

export function SkeletonShapesDemo() {
  return (
    <div class="demo-stack">
      <Skeleton shape="circle" />
      <Skeleton shape="text" />
      <Skeleton shape="rect" />
    </div>
  );
}
