/**
 * Tabs — Ark's tabs machine: the selected tab reaches the server string, and
 * every panel is labelled by its own tab's id.
 */
import { h } from "vue";
import { Tabs } from "../../src/tabs.js";
import type { Section } from "../section.js";

const TabsSection: Section = () =>
  h("section", { "aria-label": "tabs" }, [
    h(Tabs.Root, { defaultValue: "account" }, () => [
      h(Tabs.List, { "aria-label": "Settings" }, () => [
        h(Tabs.Trigger, { value: "account" }, () => "Account"),
        h(Tabs.Trigger, { value: "password" }, () => "Password"),
        h(Tabs.Indicator),
      ]),
      h(Tabs.Content, { value: "account" }, () => "Account panel"),
      h(Tabs.Content, { value: "password" }, () => "Password panel"),
    ]),
    h(
      Tabs.Root,
      { variant: "enclosed", size: "sm", orientation: "vertical", defaultValue: "team" },
      () => [
        h(Tabs.List, { "aria-label": "Workspace" }, () => [
          h(Tabs.Trigger, { value: "billing", disabled: true }, () => "Billing"),
          h(Tabs.Trigger, { value: "team" }, () => "Team"),
          h(Tabs.Indicator),
        ]),
        h(Tabs.Content, { value: "billing" }, () => "Billing panel"),
        h(Tabs.Content, { value: "team" }, () => "Team panel"),
      ],
    ),
  ]);

export default TabsSection;
