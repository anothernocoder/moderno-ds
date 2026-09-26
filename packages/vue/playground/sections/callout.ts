/**
 * Callout — CSS-only note: every root stays `role="note"` whatever its status
 * (nothing is a live region), and the optional icon is hidden.
 */
import { h } from "vue";
import { Callout } from "../../src/callout.js";
import type { Section } from "../section.js";

const CalloutSection: Section = () =>
  h("section", { "aria-label": "callouts" }, [
    h(Callout.Root, {}, () => [
      h(Callout.Icon, {}, () => "i"),
      h(Callout.Content, {}, () => [
        h(Callout.Title, {}, () => "Good to know"),
        h(Callout.Description, {}, () => "Exports run overnight."),
      ]),
    ]),
    h(Callout.Root, { variant: "warning" }, () =>
      h(Callout.Content, {}, () =>
        h(Callout.Description, {}, () => "Renaming a workspace breaks old links."),
      ),
    ),
  ]);

export default CalloutSection;
