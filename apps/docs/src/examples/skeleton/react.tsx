import { Skeleton } from "@moderno-ui/react";

export function SkeletonDemo() {
  return (
    <div className="demo-stack">
      <Skeleton />
      <Skeleton />
      <Skeleton style={{ width: "60%" }} />
    </div>
  );
}
