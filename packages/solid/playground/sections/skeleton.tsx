/**
 * Skeleton — a CSS-only loading state; every shape reaches the server.
 */
import { Skeleton } from "../../src/skeleton.jsx";
import type { Section } from "../section.js";

const SkeletonSection: Section = () => (
  <section aria-label="skeletons">
    <Skeleton />
    <Skeleton shape="rect" />
    <Skeleton shape="circle" />
  </section>
);

export default SkeletonSection;
