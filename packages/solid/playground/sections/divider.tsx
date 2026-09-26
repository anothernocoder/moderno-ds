/**
 * Divider — CSS-only, but proves an optional child (the label) and the
 * conditional separator role reach the server. Mounted in every recipe cell
 * the props table advertises, captioned × vertical included.
 */
import { Divider } from "../../src/divider.jsx";
import type { Section } from "../section.js";

const DividerSection: Section = () => (
  <section aria-label="dividers">
    <Divider />
    <Divider align="start">Or</Divider>
    <Divider orientation="vertical" />
    <Divider orientation="vertical">Or</Divider>
  </section>
);

export default DividerSection;
