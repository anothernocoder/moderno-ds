import { Skeleton } from "@moderno-ui/react";

export function SkeletonProfileDemo() {
  return (
    <div className="demo-media" aria-busy="true">
      <Skeleton shape="circle" />
      <div className="demo-stack">
        <Skeleton />
        <Skeleton style={{ width: "60%" }} />
      </div>
    </div>
  );
}
