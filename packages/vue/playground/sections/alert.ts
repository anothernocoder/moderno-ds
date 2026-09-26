/**
 * Alert — CSS-only message: its anatomy serialises with the role its status
 * resolves to ("info" reports politely, "error" interrupts).
 */
import { h } from "vue";
import { Alert } from "../../src/alert.js";
import { Button } from "../../src/button.js";
import type { Section } from "../section.js";

const AlertSection: Section = () =>
  h("section", { "aria-label": "alerts" }, [
    h(Alert.Root, { variant: "info" }, () => [
      h(Alert.Icon, {}, () => "i"),
      h(Alert.Content, {}, () => [
        h(Alert.Title, {}, () => "Heads up"),
        h(Alert.Description, {}, () => "Your trial ends in three days."),
        h(Alert.Action, {}, () =>
          h(Button, { size: "sm", variant: "outline" }, () => "Manage plan"),
        ),
      ]),
    ]),
    h(Alert.Root, { variant: "error", size: "sm" }, () => [
      h(Alert.Icon, {}, () => "!"),
      h(Alert.Content, {}, () => [
        h(Alert.Title, {}, () => "Payment failed"),
        h(Alert.Description, {}, () => "We could not charge your card."),
      ]),
    ]),
  ]);

export default AlertSection;
