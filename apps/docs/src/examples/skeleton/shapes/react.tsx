import { Skeleton } from "@moderno-ui/react";

export function SkeletonShapesDemo() {
  return (
    <div className="demo-stack">
      <Skeleton shape="circle" />
      <Skeleton shape="text" />
      <Skeleton shape="rect" />
    </div>
  );
}
