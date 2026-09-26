/**
 * Callout — CSS-only; the note role and the optional icon reach the server, at
 * two statuses.
 */
import { Callout } from "../../src/callout.jsx";
import type { Section } from "../section.js";

const CalloutSection: Section = () => (
  <section aria-label="callouts">
    <Callout.Root>
      <Callout.Icon>i</Callout.Icon>
      <Callout.Content>
        <Callout.Title>Good to know</Callout.Title>
        <Callout.Description>Exports run overnight.</Callout.Description>
      </Callout.Content>
    </Callout.Root>
    <Callout.Root variant="warning">
      <Callout.Content>
        <Callout.Description>Renaming a workspace breaks old links.</Callout.Description>
      </Callout.Content>
    </Callout.Root>
  </section>
);

export default CalloutSection;
