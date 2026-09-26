/** @jsxImportSource solid-js */
import { Skeleton } from "@moderno-ui/solid";

export function SkeletonProfileDemo() {
  return (
    <div class="demo-media" aria-busy="true">
      <Skeleton shape="circle" />
      <div class="demo-stack">
        <Skeleton />
        <Skeleton style={{ width: "60%" }} />
      </div>
    </div>
  );
}
