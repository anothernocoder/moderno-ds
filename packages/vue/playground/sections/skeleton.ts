/**
 * Skeleton — CSS-only loading placeholder: every shape reaches the server,
 * hidden from assistive tech.
 */
import { h } from "vue";
import { Skeleton } from "../../src/skeleton.js";
import type { Section } from "../section.js";

const SkeletonSection: Section = () =>
  h("section", { "aria-label": "skeletons" }, [
    h(Skeleton),
    h(Skeleton, { shape: "rect" }),
    h(Skeleton, { shape: "circle" }),
  ]);

export default SkeletonSection;
